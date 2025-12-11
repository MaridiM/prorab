import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class NotificationSettings {
	@Field(() => String)
	id: string

	@Field(() => String)
	userId: string

	@Field(() => Boolean)
	appPush: boolean

	@Field(() => Boolean)
	appEmail: boolean

	@Field(() => Boolean)
	appSms: boolean

	@Field(() => Boolean)
	marketingPush: boolean

	@Field(() => Boolean)
	marketingEmail: boolean

	@Field(() => Date)
	createdAt: Date

	@Field(() => Date)
	updatedAt: Date
}
