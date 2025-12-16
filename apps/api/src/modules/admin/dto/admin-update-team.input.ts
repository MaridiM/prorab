import { InputType, Field } from '@nestjs/graphql'
import { IsOptional, IsString } from 'class-validator'

@InputType()
export class AdminUpdateTeamInput {
	@Field(() => String, { nullable: true, description: 'Team name' })
	@IsOptional()
	@IsString()
	name?: string

	@Field(() => String, { nullable: true, description: 'Team logo URL' })
	@IsOptional()
	@IsString()
	logoUrl?: string
}
