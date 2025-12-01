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
		return req.ip || req.headers?.['x-forwarded-for']?.split(',')[0]
	},
)

export const UserAgent = createParamDecorator(
	(data: unknown, context: ExecutionContext): string | undefined => {
		const ctx = GqlExecutionContext.create(context)
		const { req } = ctx.getContext()
		return req.headers?.['user-agent']
	},
)

