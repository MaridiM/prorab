import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class User {
	@Field(() => ID)
	id: string

	@Field()
	email: string

	@Field({ nullable: true })
	name?: string

	@Field({ nullable: true })
	phone?: string

	@Field()
	emailVerified: boolean

	@Field()
	createdAt: Date

	@Field()
	updatedAt: Date
}

