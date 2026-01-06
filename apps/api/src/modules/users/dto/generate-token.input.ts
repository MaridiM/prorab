import { InputType, Field, Int } from '@nestjs/graphql'
import { IsString, IsOptional, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator'

@InputType()
export class GenerateTokenInput {
  @Field({ description: 'Name for the token (e.g., "Zapier Integration")' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string

  @Field(() => Int, {
    nullable: true,
    description: 'Token expiration in days. Leave empty for no expiration.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expiresInDays?: number
}
