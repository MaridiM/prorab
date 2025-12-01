import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class CreateProjectInput {
	@Field()
	name: string

	@Field(() => String, { nullable: true })
	description?: string
}
