import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'

import { AuthService } from '../../modules/auth/auth.service'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly authService: AuthService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// Check if route is public
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		])

		if (isPublic) {
			return true
		}

		const ctx = GqlExecutionContext.create(context)
		const { req } = ctx.getContext()

		const sessionToken = this.extractSessionToken(req)
		if (!sessionToken) {
			throw new UnauthorizedException('Требуется авторизация')
		}

		const session = await this.authService.validateSession(sessionToken)
		if (!session) {
			throw new UnauthorizedException('Сессия истекла или недействительна')
		}

		// Attach user info to request
		req.user = { id: session.userId }
		req.sessionToken = sessionToken

		return true
	}

	private extractSessionToken(req: any): string | undefined {
		// Try to get from cookies first
		const cookieToken = req.cookies?.['session_token']
		if (cookieToken) return cookieToken

		// Fallback to Authorization header
		const authHeader = req.headers?.authorization
		if (authHeader?.startsWith('Bearer ')) {
			return authHeader.substring(7)
		}

		return undefined
	}
}

