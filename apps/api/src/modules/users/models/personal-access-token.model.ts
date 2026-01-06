import { ObjectType, Field, ID } from '@nestjs/graphql'

@ObjectType()
export class PersonalAccessToken {
  @Field(() => ID)
  id: string

  @Field()
  name: string

  @Field()
  tokenPrefix: string

  @Field(() => Date, { nullable: true })
  lastUsedAt: Date | null

  @Field({ nullable: true })
  lastUsedIp: string | null

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date, { nullable: true })
  expiresAt: Date | null

  @Field()
  isExpired: boolean
}

/**
 * Returned only when generating a new token
 * Contains the plaintext token that can only be seen once
 */
@ObjectType()
export class GeneratedToken {
  @Field(() => ID)
  id: string

  @Field()
  name: string

  @Field({ description: 'The plaintext token. Store it securely - it cannot be retrieved again!' })
  token: string

  @Field()
  tokenPrefix: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date, { nullable: true })
  expiresAt: Date | null
}
