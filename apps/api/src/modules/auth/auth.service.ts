import {
	BadRequestException,
	Injectable,
	Logger,
	UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as argon2 from 'argon2'
import { nanoid } from 'nanoid'

import { RedisService } from '../../core/redis/redis.service'
import { MailService } from '../../core/mail/mail.service'
import { UsersService } from '../users/users.service'
import { TwoFactorService } from './two-factor.service'

import { LoginInput } from './dto/login.input'
import { RegisterInput } from './dto/register.input'

export interface SessionData {
	userId: string
	userAgent?: string
	ip?: string
	createdAt: number
}

export interface LoginResult {
	user: any
	sessionToken?: string
	refreshToken?: string
	requiresTwoFactor?: boolean
	twoFactorToken?: string
}

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name)
	private readonly sessionTtl: number
	private readonly refreshTokenTtl: number
	private readonly verificationTokenTtl: number
	private readonly passwordResetTokenTtl: number
	private readonly rateLimitAttempts: number
	private readonly rateLimitWindow: number

	constructor(
		private readonly usersService: UsersService,
		private readonly redisService: RedisService,
		private readonly mailService: MailService,
		private readonly configService: ConfigService,
		private readonly twoFactorService: TwoFactorService,
	) {
		this.sessionTtl = this.configService.get('auth.sessionTtl')!
		this.refreshTokenTtl = this.configService.get('auth.refreshTokenTtl')!
		this.verificationTokenTtl = this.configService.get('auth.verificationTokenTtl')!
		this.passwordResetTokenTtl = this.configService.get('auth.passwordResetTokenTtl')!
		this.rateLimitAttempts = this.configService.get('auth.rateLimitAttempts')!
		this.rateLimitWindow = this.configService.get('auth.rateLimitWindow')!
	}

	// ==================== Rate Limiting ====================

	private async checkRateLimit(action: string, identifier: string): Promise<void> {
		const key = `rate_limit:${action}:${identifier}`
		const current = await this.redisService.getRateLimit(key)

		if (current >= this.rateLimitAttempts) {
			throw new BadRequestException(
				`Слишком много попыток. Попробуйте через 15 минут.`,
			)
		}
	}

	private async incrementRateLimit(action: string, identifier: string): Promise<void> {
		const key = `rate_limit:${action}:${identifier}`
		await this.redisService.incrementRateLimit(key, this.rateLimitWindow)
	}

	// ==================== Password Hashing ====================

	private async hashPassword(password: string): Promise<string> {
		return argon2.hash(password, {
			type: argon2.argon2id,
			memoryCost: 65536,
			timeCost: 3,
			parallelism: 4,
		})
	}

	private async verifyPassword(hash: string, password: string): Promise<boolean> {
		return argon2.verify(hash, password)
	}

	// ==================== Token Generation ====================

	private generateToken(): string {
		return nanoid(48)
	}

	// ==================== Registration ====================

	async register(
		input: RegisterInput,
		userAgent?: string,
		ip?: string,
	): Promise<{ user: any; sessionToken: string; refreshToken: string }> {
		await this.checkRateLimit('register', ip ?? 'unknown')

		// Normalize email
		const emailNormalized = this.normalizeEmail(input.email)

		// Check if user exists
		const existingUser = await this.usersService.findByEmailNormalized(emailNormalized)
		if (existingUser) {
			await this.incrementRateLimit('register', ip ?? 'unknown')
			throw new BadRequestException('Пользователь с таким email уже существует')
		}

		// Hash password
		const passwordHash = await this.hashPassword(input.password)

		// Create user
		const user = await this.usersService.create({
			email: input.email.trim().toLowerCase(),
			emailNormalized,
			passwordHash,
			fullName: input.fullName,
			phone: input.phone,
		})

		// Create verification token
		await this.createVerificationToken(user.id)

		// Create session
		const { sessionToken, refreshToken } = await this.createSession(
			user.id,
			userAgent,
			ip,
		)

		return { user, sessionToken, refreshToken }
	}

	// ==================== Login ====================

	async login(
		input: LoginInput,
		userAgent?: string,
		ip?: string,
	): Promise<LoginResult> {
		await this.checkRateLimit('login', ip ?? 'unknown')

		const emailNormalized = this.normalizeEmail(input.email)
		const user = await this.usersService.findByEmailNormalized(emailNormalized)

		if (!user) {
			await this.incrementRateLimit('login', ip ?? 'unknown')
			throw new UnauthorizedException('Неверный email или пароль')
		}

		const isValidPassword = await this.verifyPassword(user.passwordHash, input.password)
		if (!isValidPassword) {
			await this.incrementRateLimit('login', ip ?? 'unknown')
			throw new UnauthorizedException('Неверный email или пароль')
		}

		// Check if 2FA is enabled
		const twoFactorStatus = await this.twoFactorService.getStatus(user.id)
		if (twoFactorStatus.enabled) {
			// Generate temporary token for 2FA verification
			const twoFactorToken = this.generateToken()
			await this.redisService.set(
				`2fa_pending:${twoFactorToken}`,
				JSON.stringify({ userId: user.id, userAgent, ip }),
				300, // 5 minutes TTL
			)

			return {
				user,
				requiresTwoFactor: true,
				twoFactorToken,
			}
		}

		// Create session (no 2FA required)
		const { sessionToken, refreshToken } = await this.createSession(
			user.id,
			userAgent,
			ip,
		)

		return { user, sessionToken, refreshToken }
	}

	async verifyTwoFactorLogin(
		twoFactorToken: string,
		code: string,
	): Promise<{ user: any; sessionToken: string; refreshToken: string }> {
		// Get pending 2FA data from Redis
		const pendingData = await this.redisService.get(`2fa_pending:${twoFactorToken}`)
		if (!pendingData) {
			throw new UnauthorizedException('Недействительный или истёкший токен 2FA')
		}

		const { userId, userAgent, ip } = JSON.parse(pendingData)

		// Verify 2FA code
		const isValid = await this.twoFactorService.verify2FAToken(userId, code)
		if (!isValid) {
			throw new UnauthorizedException('Неверный код двухфакторной аутентификации')
		}

		// Delete the pending token
		await this.redisService.del(`2fa_pending:${twoFactorToken}`)

		// Get user data
		const user = await this.usersService.findById(userId)
		if (!user) {
			throw new UnauthorizedException('Пользователь не найден')
		}

		// Create session
		const { sessionToken, refreshToken } = await this.createSession(
			userId,
			userAgent,
			ip,
		)

		return { user, sessionToken, refreshToken }
	}

	// ==================== Session Management ====================

	async createSession(
		userId: string,
		userAgent?: string,
		ip?: string,
	): Promise<{ sessionToken: string; refreshToken: string }> {
		const sessionToken = this.generateToken()
		const refreshToken = this.generateToken()

		const sessionData: SessionData = {
			userId,
			userAgent,
			ip,
			createdAt: Date.now(),
		}

		await this.redisService.setSession(sessionToken, sessionData, this.sessionTtl)
		await this.redisService.setRefreshToken(
			refreshToken,
			{ userId, sessionToken },
			this.refreshTokenTtl,
		)

		return { sessionToken, refreshToken }
	}

	async validateSession(sessionToken: string): Promise<SessionData | null> {
		return this.redisService.getSession(sessionToken)
	}

	async refreshSession(
		refreshToken: string,
		userAgent?: string,
		ip?: string,
	): Promise<{ sessionToken: string; refreshToken: string } | null> {
		const refreshData = await this.redisService.getRefreshToken(refreshToken)
		if (!refreshData) return null

		// Delete old refresh token
		await this.redisService.deleteRefreshToken(refreshToken)

		// Delete old session if exists
		await this.redisService.deleteSession(refreshData.sessionToken, refreshData.userId)

		// Create new session
		return this.createSession(refreshData.userId, userAgent, ip)
	}

	async logout(sessionToken: string, refreshToken: string, userId: string): Promise<void> {
		await this.redisService.deleteSession(sessionToken, userId)
		await this.redisService.deleteRefreshToken(refreshToken)
	}

	async getUserSessions(userId: string): Promise<SessionData[]> {
		const sessionTokens = await this.redisService.getUserSessions(userId)
		const sessions: SessionData[] = []

		for (const token of sessionTokens) {
			const session = await this.redisService.getSession(token)
			if (session) {
				sessions.push({ ...session, userId: token }) // userId here is actually the token for identification
			}
		}

		return sessions
	}

	async revokeSession(sessionToken: string, userId: string): Promise<void> {
		await this.redisService.deleteSession(sessionToken, userId)
	}

	async revokeAllSessions(userId: string, exceptToken?: string): Promise<void> {
		const sessionTokens = await this.redisService.getUserSessions(userId)

		for (const token of sessionTokens) {
			if (token !== exceptToken) {
				await this.redisService.deleteSession(token, userId)
			}
		}
	}

	// ==================== Email Verification ====================

	private async createVerificationToken(userId: string): Promise<string> {
		const token = this.generateToken()
		const expiresAt = new Date(Date.now() + this.verificationTokenTtl)

		await this.usersService.createVerificationToken(userId, token, expiresAt)

		const user = await this.usersService.findById(userId)
		if (user) {
			// Check if email is a Telegram placeholder (cannot receive emails)
			const { shouldSkipEmail } = await import('../../shared/utils/email.utils')
			if (!shouldSkipEmail(user.email, user)) {
				await this.mailService.sendVerificationEmail(user.email, user.fullName, token, user)
			} else {
				this.logger.log(
					`Verification email skipped for Telegram user: ${user.email}. Email is already verified for Telegram OAuth users.`,
				)
			}
		}

		return token
	}

	async verifyEmail(token: string): Promise<boolean> {
		const verificationToken = await this.usersService.findVerificationToken(token)

		if (!verificationToken) {
			throw new BadRequestException('Недействительный токен верификации')
		}

		if (verificationToken.expiresAt < new Date()) {
			throw new BadRequestException('Токен верификации истёк')
		}

		await this.usersService.verifyEmail(verificationToken.userId)
		await this.usersService.deleteVerificationToken(token)

		return true
	}

	async resendVerificationEmail(userId: string, ip?: string): Promise<boolean> {
		await this.checkRateLimit('verify_email', userId)

		const user = await this.usersService.findById(userId)
		if (!user) {
			throw new BadRequestException('Пользователь не найден')
		}

		if (user.emailVerified) {
			throw new BadRequestException('Email уже подтверждён')
		}

		// Check if user is Telegram OAuth user (email is already verified)
		const { shouldSkipEmail } = await import('../../shared/utils/email.utils')
		if (shouldSkipEmail(user.email, user)) {
			throw new BadRequestException(
				'Пользователи Telegram не могут получать письма на placeholder email. Email уже подтверждён автоматически.',
			)
		}

		await this.incrementRateLimit('verify_email', userId)
		await this.createVerificationToken(userId)

		return true
	}

	// ==================== Password Reset ====================

	async forgotPassword(email: string, ip?: string): Promise<boolean> {
		await this.checkRateLimit('forgot_password', ip ?? 'unknown')

		const emailNormalized = this.normalizeEmail(email)
		const user = await this.usersService.findByEmailNormalized(emailNormalized)

		// Always return true to prevent email enumeration
		if (!user) {
			await this.incrementRateLimit('forgot_password', ip ?? 'unknown')
			return true
		}

		// Check if user is Telegram OAuth user (no password)
		if (user.oauthProvider === 'telegram' && !user.passwordHash) {
			// Telegram users don't have passwords, so password reset doesn't make sense
			// Log warning but return true to prevent email enumeration
			this.logger.warn(
				`Password reset requested for Telegram OAuth user: ${user.email}. Telegram users don't have passwords.`,
			)
			await this.incrementRateLimit('forgot_password', ip ?? 'unknown')
			return true
		}

		// Check if email is a Telegram placeholder (cannot receive emails)
		const { shouldSkipEmail } = await import('../../shared/utils/email.utils')
		if (shouldSkipEmail(user.email, user)) {
			this.logger.warn(
				`Password reset email skipped for Telegram placeholder email: ${user.email}. User should use Telegram login.`,
			)
			// Still return true to prevent email enumeration
			await this.incrementRateLimit('forgot_password', ip ?? 'unknown')
			return true
		}

		const token = this.generateToken()
		const expiresAt = new Date(Date.now() + this.passwordResetTokenTtl)

		await this.usersService.createPasswordResetToken(user.id, token, expiresAt)
		await this.mailService.sendPasswordResetEmail(user.email, user.fullName, token, user)

		await this.incrementRateLimit('forgot_password', ip ?? 'unknown')
		return true
	}

	async resetPassword(token: string, newPassword: string): Promise<boolean> {
		const resetToken = await this.usersService.findPasswordResetToken(token)

		if (!resetToken) {
			throw new BadRequestException('Недействительный токен сброса пароля')
		}

		if (resetToken.expiresAt < new Date()) {
			throw new BadRequestException('Токен сброса пароля истёк')
		}

		if (resetToken.used) {
			throw new BadRequestException('Токен уже был использован')
		}

		const passwordHash = await this.hashPassword(newPassword)
		await this.usersService.updatePassword(resetToken.userId, passwordHash)
		await this.usersService.markPasswordResetTokenUsed(token)

		// Invalidate all sessions
		await this.revokeAllSessions(resetToken.userId)

		return true
	}

	async changePassword(
		userId: string,
		currentPassword: string,
		newPassword: string,
		currentSessionToken?: string,
	): Promise<boolean> {
		const user = await this.usersService.findById(userId)
		if (!user) {
			throw new BadRequestException('Пользователь не найден')
		}

		const isValidPassword = await this.verifyPassword(user.passwordHash, currentPassword)
		if (!isValidPassword) {
			throw new UnauthorizedException('Неверный текущий пароль')
		}

		const passwordHash = await this.hashPassword(newPassword)
		await this.usersService.updatePassword(userId, passwordHash)

		// Invalidate all sessions except current
		await this.revokeAllSessions(userId, currentSessionToken)

		return true
	}

	// ==================== Helpers ====================

	private normalizeEmail(email: string): string {
		const [localPart, domain] = email.trim().toLowerCase().split('@')

		// Remove dots and everything after + for Gmail
		let normalized = localPart
		if (domain === 'gmail.com' || domain === 'googlemail.com') {
			normalized = localPart.replace(/\./g, '').split('+')[0]
		} else {
			normalized = localPart.split('+')[0]
		}

		return `${normalized}@${domain}`
	}
}

