import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Project {
	@Field(() => Int)
	id: number

	@Field()
	name: string

	@Field(() => String, { nullable: true })
	description?: string | null

	@Field(() => GraphQLISODateTime)
	createdAt: Date

	@Field(() => GraphQLISODateTime)
	updatedAt: Date
}
