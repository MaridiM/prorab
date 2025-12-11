import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class UpdateNotificationSettingsInput {
	@Field(() => Boolean, { nullable: true })
	appPush?: boolean

	@Field(() => Boolean, { nullable: true })
	appEmail?: boolean

	@Field(() => Boolean, { nullable: true })
	appSms?: boolean

	@Field(() => Boolean, { nullable: true })
	marketingPush?: boolean

	@Field(() => Boolean, { nullable: true })
	marketingEmail?: boolean
}
