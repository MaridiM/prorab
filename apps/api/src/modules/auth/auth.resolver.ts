import { UseGuards } from '@nestjs/common'
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Response } from 'express'

import { AuthService } from './auth.service'
import { LoginInput } from './dto/login.input'
import { RegisterInput } from './dto/register.input'
import { ResetPasswordInput } from './dto/reset-password.input'
import { ChangePasswordInput } from './dto/change-password.input'
import { ChangeEmailInput } from './dto/change-email.input'
import { VerifyEmailChangeInput } from './dto/verify-email-change.input'
import { ChangeEmailResult } from './models/change-email-result.model'
import { AuthGuard } from '../../shared/guards/auth.guard'
import { Public } from '../../shared/decorators/public.decorator'
import {
	CurrentUser,
	CurrentUserData,
	SessionToken,
	RefreshToken,
	ClientIp,
	UserAgent,
} from '../../shared/decorators/current-user.decorator'
import { AuthPayload, Session } from './models/auth.model'
import { TelegramAuthService } from '../telegram/telegram-auth.service'
import {
	TelegramAuthPayload,
	TelegramAuthStatusPayload,
} from '../telegram/models/telegram-auth.model'
import { CheckTelegramAuthInput } from '../telegram/dto/telegram-auth.dto'

const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax' as const,
	path: '/',
}

@Resolver()
export class AuthResolver {
	constructor(
		private readonly authService: AuthService,
		private readonly telegramAuthService: TelegramAuthService,
	) {}

	// ==================== Registration ====================

	@Public()
	@Mutation(() => AuthPayload)
	async register(
		@Args('input') input: RegisterInput,
		@Context() ctx: { res: Response },
		@UserAgent() userAgent?: string,
		@ClientIp() ip?: string,
	): Promise<AuthPayload> {
		const { user, sessionToken, refreshToken } = await this.authService.register(
			input,
			userAgent,
			ip,
		)

		this.setAuthCookies(ctx.res, sessionToken, refreshToken)

		return {
			user,
			message: 'Регистрация успешна. Проверьте email для подтверждения.',
		}
	}

	@Public()
	@Mutation(() => Boolean)
	async verifyEmail(@Args('token') token: string): Promise<boolean> {
		return this.authService.verifyEmail(token)
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async resendVerificationEmail(
		@CurrentUser() user: CurrentUserData,
		@ClientIp() ip?: string,
	): Promise<boolean> {
		return this.authService.resendVerificationEmail(user.id, ip)
	}

	// ==================== Login/Logout ====================

	@Public()
	@Mutation(() => AuthPayload)
	async login(
		@Args('input') input: LoginInput,
		@Context() ctx: { res: Response },
		@UserAgent() userAgent?: string,
		@ClientIp() ip?: string,
	): Promise<AuthPayload> {
		const result = await this.authService.login(
			input,
			userAgent,
			ip,
		)

		// If 2FA is required, return the token without setting cookies
		if (result.requiresTwoFactor) {
			return {
				requiresTwoFactor: true,
				twoFactorToken: result.twoFactorToken,
			}
		}

		// No 2FA - set cookies and return user
		this.setAuthCookies(ctx.res, result.sessionToken!, result.refreshToken!)

		return { user: result.user }
	}

	@Public()
	@Mutation(() => AuthPayload)
	async verifyTwoFactorLogin(
		@Args('twoFactorToken') twoFactorToken: string,
		@Args('code') code: string,
		@Context() ctx: { res: Response },
	): Promise<AuthPayload> {
		const { user, sessionToken, refreshToken } = await this.authService.verifyTwoFactorLogin(
			twoFactorToken,
			code,
		)

		this.setAuthCookies(ctx.res, sessionToken, refreshToken)

		return { user }
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async logout(
		@Context() ctx: { res: Response },
		@CurrentUser() user: CurrentUserData,
		@SessionToken() sessionToken: string,
		@RefreshToken() refreshToken: string,
	): Promise<boolean> {
		await this.authService.logout(sessionToken, refreshToken || '', user.id)
		this.clearAuthCookies(ctx.res)
		return true
	}

	@Public()
	@Mutation(() => AuthPayload, { nullable: true })
	async refreshSession(
		@Context() ctx: { res: Response },
		@RefreshToken() refreshToken?: string,
		@UserAgent() userAgent?: string,
		@ClientIp() ip?: string,
	): Promise<AuthPayload | null> {
		if (!refreshToken) {
			return null
		}

		const result = await this.authService.refreshSession(refreshToken, userAgent, ip)
		if (!result) {
			this.clearAuthCookies(ctx.res)
			return null
		}

		this.setAuthCookies(ctx.res, result.sessionToken, result.refreshToken)

		// Get user info
		const session = await this.authService.validateSession(result.sessionToken)
		if (!session) {
			return null
		}

		// Import UsersService to get user
		return { user: { id: session.userId } as any }
	}

	// ==================== Sessions ====================

	@UseGuards(AuthGuard)
	@Query(() => [Session])
	async sessions(
		@CurrentUser() user: CurrentUserData,
		@SessionToken() currentSessionToken: string,
	): Promise<Session[]> {
		const sessions = await this.authService.getUserSessions(user.id)

		return sessions.map((s) => ({
			id: s.userId, // This is actually the token
			userAgent: s.userAgent,
			ip: s.ip,
			createdAt: new Date(s.createdAt),
			current: s.userId === currentSessionToken,
		}))
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async revokeSession(
		@Args('sessionId') sessionId: string,
		@CurrentUser() user: CurrentUserData,
	): Promise<boolean> {
		await this.authService.revokeSession(sessionId, user.id)
		return true
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async revokeAllSessions(
		@CurrentUser() user: CurrentUserData,
		@SessionToken() currentSessionToken: string,
	): Promise<boolean> {
		await this.authService.revokeAllSessions(user.id, currentSessionToken)
		return true
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async revokeAllSessionsIncludingCurrent(
		@Context() ctx: { res: Response },
		@CurrentUser() user: CurrentUserData,
	): Promise<boolean> {
		await this.authService.revokeAllSessions(user.id)
		this.clearAuthCookies(ctx.res)
		return true
	}

	// ==================== Password ====================

	@Public()
	@Mutation(() => Boolean)
	async forgotPassword(
		@Args('email') email: string,
		@ClientIp() ip?: string,
	): Promise<boolean> {
		return this.authService.forgotPassword(email, ip)
	}

	@Public()
	@Mutation(() => Boolean)
	async resetPassword(
		@Args('input') input: ResetPasswordInput,
	): Promise<boolean> {
		return this.authService.resetPassword(input.token, input.newPassword)
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async changePassword(
		@Args('input') input: ChangePasswordInput,
		@CurrentUser() user: CurrentUserData,
		@SessionToken() sessionToken: string,
	): Promise<boolean> {
		return this.authService.changePassword(
			user.id,
			input.currentPassword,
			input.newPassword,
			sessionToken,
		)
	}

	// ==================== Email Change ====================

	@UseGuards(AuthGuard)
	@Mutation(() => ChangeEmailResult, {
		description: 'Инициировать изменение email адреса (требуется 2FA, если включена)',
	})
	async initiateEmailChange(
		@Args('input') input: ChangeEmailInput,
		@CurrentUser() user: CurrentUserData,
	): Promise<ChangeEmailResult> {
		return this.authService.initiateEmailChange(user.id, input.newEmail, input.twoFactorCode)
	}

	@Public()
	@Mutation(() => Boolean, {
		description: 'Подтвердить изменение email адреса по токену из письма',
	})
	async verifyEmailChange(@Args('input') input: VerifyEmailChangeInput): Promise<boolean> {
		return this.authService.verifyEmailChange(input.token)
	}

	// ==================== Telegram OAuth ====================

	@Public()
	@Mutation(() => TelegramAuthPayload)
	async initTelegramAuth(): Promise<TelegramAuthPayload> {
		const { token, deepLink } = await this.telegramAuthService.generateAuthToken()
		const authTokenTtl = 600000 // 10 minutes
		const expiresAt = new Date(Date.now() + authTokenTtl)

		return {
			token,
			deepLink,
			expiresAt,
		}
	}

	@Public()
	@Mutation(() => TelegramAuthStatusPayload)
	async checkTelegramAuth(
		@Args('input') input: CheckTelegramAuthInput,
		@Context() ctx: { res: Response },
		@UserAgent() userAgent?: string,
		@ClientIp() ip?: string,
	): Promise<TelegramAuthStatusPayload> {
		const { completed, chatId, telegramUser } = await this.telegramAuthService.checkAuthToken(
			input.token,
		)

		if (!completed || !chatId || !telegramUser) {
			return { completed: false }
		}

		// Создать или найти пользователя
		const user = await this.telegramAuthService.authenticateWithTelegram(
			chatId,
			telegramUser,
		)

		// Создать сессию (используем тот же AuthService.createSession)
		const { sessionToken, refreshToken } = await this.authService.createSession(
			user.id,
			userAgent,
			ip,
		)

		// Установить cookies
		this.setAuthCookies(ctx.res, sessionToken, refreshToken)

		return {
			completed: true,
			user: user as any,
			sessionToken,
			refreshToken,
		}
	}

	// ==================== Helpers ====================

	private setAuthCookies(
		res: Response,
		sessionToken: string,
		refreshToken: string,
	): void {
		res.cookie('session_token', sessionToken, {
			...COOKIE_OPTIONS,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		})

		res.cookie('refresh_token', refreshToken, {
			...COOKIE_OPTIONS,
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		})
	}

	private clearAuthCookies(res: Response): void {
		res.clearCookie('session_token', COOKIE_OPTIONS)
		res.clearCookie('refresh_token', COOKIE_OPTIONS)
	}
}

