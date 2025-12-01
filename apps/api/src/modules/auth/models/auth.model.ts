import { Field, ObjectType } from '@nestjs/graphql'

import { User } from '../../users/models/user.model'

@ObjectType()
export class AuthPayload {
	@Field(() => User)
	user: User

	@Field({ nullable: true })
	message?: string
}

@ObjectType()
export class Session {
	@Field()
	id: string

	@Field({ nullable: true })
	userAgent?: string

	@Field({ nullable: true })
	ip?: string

	@Field()
	createdAt: Date

	@Field()
	current: boolean
}

