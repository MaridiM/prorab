import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { AdminRoleDetail } from '../../admin/models/admin-role-detail.model'

// Define enum values for GraphQL (must match Prisma enum exactly)
export enum BusinessRole {
	FOREMAN = 'FOREMAN',
	WORKER = 'WORKER',
}

// Register enum with GraphQL
registerEnumType(BusinessRole, {
	name: 'BusinessRole',
	description: 'Глобальная бизнес-роль пользователя',
	valuesMap: {
		FOREMAN: {
			description: 'Бригадир - владелец команды, не может присоединяться к другим командам',
		},
		WORKER: {
			description: 'Работник - член команды, не может создавать команды',
		},
	},
})

@ObjectType()
export class User {
	@Field(() => ID)
	id: string

	@Field()
	email: string

	@Field()
	fullName: string

	@Field({ nullable: true })
	phone?: string

	@Field({ nullable: true, description: 'URL аватарки пользователя' })
	avatarUrl?: string

	@Field({ nullable: true, description: 'Telegram Chat ID пользователя' })
	telegramChatId?: string

	@Field({ nullable: true, description: 'Telegram Username пользователя' })
	telegramUsername?: string

	@Field({ nullable: true, description: 'URL фото из Telegram' })
	telegramPhotoUrl?: string

	@Field()
	emailVerified: boolean

	@Field()
	hasCompletedOnboarding: boolean

	@Field(() => BusinessRole, {
		nullable: true,
		description: 'Глобальная бизнес-роль: FOREMAN или WORKER',
	})
	businessRole?: BusinessRole | null

	@Field(() => Date, { nullable: true })
	businessRoleAssignedAt?: Date | null

	@Field(() => Boolean, {
		description: 'Имеет ли пользователь бейдж донатора',
	})
	hasDonatorBadge: boolean

	@Field(() => [String], {
		description: 'ID планов, для которых пользователь уже использовал тестовый период',
		defaultValue: [],
	})
	trialedPlanIds: string[]

	@Field()
	createdAt: Date

	@Field()
	updatedAt: Date

	@Field(() => AdminRoleDetail, { nullable: true })
	adminRole?: AdminRoleDetail
}

