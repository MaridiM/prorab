import { Field, ObjectType } from '@nestjs/graphql'

import { User } from '../../users/models/user.model'

@ObjectType()
export class AuthPayload {
	@Field(() => User, { nullable: true })
	user?: User

	@Field({ nullable: true })
	message?: string

	@Field({ nullable: true })
	requiresTwoFactor?: boolean

	@Field({ nullable: true })
	twoFactorToken?: string
}

@ObjectType()
export class Session {
	@Field()
	id: string

	@Field({ nullable: true })
	userAgent?: string

	@Field({ nullable: true })
	ip?: string

	@Field({ nullable: true })
	city?: string

	@Field({ nullable: true })
	country?: string

	@Field({ nullable: true })
	device?: string

	@Field({ nullable: true })
	browser?: string

	@Field({ nullable: true })
	os?: string

	@Field()
	createdAt: Date

	@Field()
	current: boolean
}

@ObjectType()
export class LoginHistory {
	@Field()
	id: string

	@Field()
	ip: string

	@Field({ nullable: true })
	userAgent?: string

	@Field({ nullable: true })
	city?: string

	@Field({ nullable: true })
	country?: string

	@Field({ nullable: true })
	device?: string

	@Field({ nullable: true })
	browser?: string

	@Field({ nullable: true })
	os?: string

	@Field()
	createdAt: Date
}

