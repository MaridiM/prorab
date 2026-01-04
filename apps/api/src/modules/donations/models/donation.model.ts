import { Field, ObjectType, ID, Float, Int, registerEnumType } from '@nestjs/graphql'
import { DonationStatus, PaymentProviderType } from '@prisma/generated/client'

// Register enums for GraphQL
registerEnumType(DonationStatus, {
  name: 'DonationStatus',
  description: 'Status of a donation',
})

registerEnumType(PaymentProviderType, {
  name: 'PaymentProviderType',
  description: 'Payment provider type',
})

/**
 * Donation GraphQL model
 */
@ObjectType()
export class Donation {
  @Field(() => ID)
  id: string

  @Field(() => String)
  userId: string

  @Field(() => Float)
  amount: number

  @Field(() => String)
  currency: string

  @Field(() => PaymentProviderType)
  providerType: PaymentProviderType

  @Field(() => String)
  providerPaymentId: string

  @Field(() => DonationStatus)
  status: DonationStatus

  @Field(() => String, { nullable: true })
  message?: string

  @Field(() => String, { nullable: true })
  donorName?: string

  @Field(() => Boolean)
  isAnonymous: boolean

  @Field(() => Date, { nullable: true })
  paidAt?: Date

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}

/**
 * Donation URL result (for payment redirection)
 */
@ObjectType()
export class DonationUrl {
  @Field(() => String)
  url: string

  @Field(() => String)
  donationId: string
}

/**
 * Donation stats
 */
@ObjectType()
export class DonationStats {
  @Field(() => Float)
  totalAmount: number

  @Field(() => Int)
  totalCount: number

  @Field(() => Int)
  successfulCount: number

  @Field(() => Float)
  averageAmount: number
}
