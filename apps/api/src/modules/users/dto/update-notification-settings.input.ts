import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsBoolean, IsEnum, IsString } from 'class-validator'
import { NotificationFrequency } from '../models/notification-settings.model'

@InputType()
export class UpdateNotificationSettingsInput {
	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	appPush?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	appEmail?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	appSms?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	marketingPush?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	marketingEmail?: boolean

	// Event-specific notifications
	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	notifyProjectCreated?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	notifyProjectCompleted?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	notifyExpenseAdded?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	notifyPayoutCalculated?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	notifyPayoutPaid?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	notifyMemberInvited?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	notifyMemberJoined?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	notifyMemberRemoved?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	notifyTaskAssigned?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	notifyTaskCompleted?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	notifyPhotoReportCreated?: boolean

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	notifySubscriptionExpiring?: boolean

	// Notification frequency
	@Field(() => NotificationFrequency, { nullable: true })
	@IsOptional()
	@IsEnum(NotificationFrequency)
	emailFrequency?: NotificationFrequency

	@Field(() => NotificationFrequency, { nullable: true })
	@IsOptional()
	@IsEnum(NotificationFrequency)
	pushFrequency?: NotificationFrequency

	// Quiet hours
	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	quietHoursEnabled?: boolean

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	quietHoursStart?: string | null

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	quietHoursEnd?: string | null
}
