import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export interface CurrentUserData {
	id: string
}

export const CurrentUser = createParamDecorator(
	(data: unknown, context: ExecutionContext): CurrentUserData => {
		const ctx = GqlExecutionContext.create(context)
		const { req } = ctx.getContext()
		return req.user
	},
)

export const SessionToken = createParamDecorator(
	(data: unknown, context: ExecutionContext): string | undefined => {
		const ctx = GqlExecutionContext.create(context)
		const { req } = ctx.getContext()
		return req.sessionToken
	},
)

export const RefreshToken = createParamDecorator(
	(data: unknown, context: ExecutionContext): string | undefined => {
		const ctx = GqlExecutionContext.create(context)
		const { req } = ctx.getContext()
		return req.cookies?.['refresh_token']
	},
)

export const ClientIp = createParamDecorator(
	(data: unknown, context: ExecutionContext): string | undefined => {
		const ctx = GqlExecutionContext.create(context)
		const { req } = ctx.getContext()
		
		// Priority order for IP detection:
		// 1. req.ip (works when trust proxy is enabled)
		// 2. x-forwarded-for header (first IP in chain)
		// 3. x-real-ip header (some proxies use this)
		// 4. req.connection.remoteAddress (fallback)
		
		if (req.ip) {
			return req.ip
		}
		
		const forwardedFor = req.headers?.['x-forwarded-for']
		if (forwardedFor) {
			// x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
			// We want the first one (original client)
			const ips = typeof forwardedFor === 'string' ? forwardedFor.split(',') : forwardedFor
			return ips[0]?.trim()
		}
		
		const realIp = req.headers?.['x-real-ip']
		if (realIp) {
			return typeof realIp === 'string' ? realIp : realIp[0]
		}
		
		// Fallback to connection remote address
		return req.connection?.remoteAddress || req.socket?.remoteAddress
	},
)

export const UserAgent = createParamDecorator(
	(data: unknown, context: ExecutionContext): string | undefined => {
		const ctx = GqlExecutionContext.create(context)
		const { req } = ctx.getContext()
		return req.headers?.['user-agent']
	},
)

