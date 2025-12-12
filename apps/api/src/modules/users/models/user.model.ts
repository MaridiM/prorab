import { Field, ID, ObjectType } from '@nestjs/graphql'

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

	@Field()
	createdAt: Date

	@Field()
	updatedAt: Date
}

