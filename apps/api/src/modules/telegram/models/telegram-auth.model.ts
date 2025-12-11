import { ObjectType, Field } from '@nestjs/graphql'
import { User } from '../../users/models/user.model'

@ObjectType()
export class TelegramAuthPayload {
	@Field()
	token: string

	@Field()
	deepLink: string

	@Field()
	expiresAt: Date
}

@ObjectType()
export class TelegramAuthStatusPayload {
	@Field()
	completed: boolean

	@Field(() => User, { nullable: true })
	user?: User

	@Field({ nullable: true })
	sessionToken?: string

	@Field({ nullable: true })
	refreshToken?: string
}
