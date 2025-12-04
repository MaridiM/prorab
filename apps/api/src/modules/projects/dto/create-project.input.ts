import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class CreateProjectInput {
	@Field()
	name: string

	@Field(() => String, { nullable: true })
	description?: string

	@Field(() => String, { nullable: true })
	address?: string

	@Field()
	teamId: string

	@Field()
	createdById: string
}
