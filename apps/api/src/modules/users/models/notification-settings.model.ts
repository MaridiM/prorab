import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'

export enum NotificationFrequency {
	INSTANT = 'INSTANT',
	DAILY = 'DAILY',
	WEEKLY = 'WEEKLY',
}

registerEnumType(NotificationFrequency, {
	name: 'NotificationFrequency',
})

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

	// Event-specific notifications
	@Field(() => Boolean)
	notifyProjectCreated: boolean

	@Field(() => Boolean)
	notifyProjectCompleted: boolean

	@Field(() => Boolean)
	notifyExpenseAdded: boolean

	@Field(() => Boolean)
	notifyPayoutCalculated: boolean

	@Field(() => Boolean)
	notifyPayoutPaid: boolean

	@Field(() => Boolean)
	notifyMemberInvited: boolean

	@Field(() => Boolean)
	notifyMemberJoined: boolean

	@Field(() => Boolean)
	notifyMemberRemoved: boolean

	@Field(() => Boolean)
	notifyTaskAssigned: boolean

	@Field(() => Boolean)
	notifyTaskCompleted: boolean

	@Field(() => Boolean)
	notifyPhotoReportCreated: boolean

	@Field(() => Boolean)
	notifySubscriptionExpiring: boolean

	// Notification frequency
	@Field(() => NotificationFrequency)
	emailFrequency: NotificationFrequency

	@Field(() => NotificationFrequency)
	pushFrequency: NotificationFrequency

	// Quiet hours
	@Field(() => Boolean)
	quietHoursEnabled: boolean

	@Field(() => String, { nullable: true })
	quietHoursStart: string | null

	@Field(() => String, { nullable: true })
	quietHoursEnd: string | null

	@Field(() => Date)
	createdAt: Date

	@Field(() => Date)
	updatedAt: Date
}
