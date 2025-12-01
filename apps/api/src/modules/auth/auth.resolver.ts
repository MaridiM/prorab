import { UseGuards } from '@nestjs/common'
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Response } from 'express'

import { AuthService } from './auth.service'
import { LoginInput } from './dto/login.input'
import { RegisterInput } from './dto/register.input'
import { ResetPasswordInput } from './dto/reset-password.input'
import { ChangePasswordInput } from './dto/change-password.input'
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

const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax' as const,
	path: '/',
}

@Resolver()
export class AuthResolver {
	constructor(private readonly authService: AuthService) {}

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
		const { user, sessionToken, refreshToken } = await this.authService.login(
			input,
			userAgent,
			ip,
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

