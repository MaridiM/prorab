import { Field, InputType, Float } from '@nestjs/graphql'
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, Min, Max, MaxLength } from 'class-validator'
import { PaymentProviderType } from '@prisma/generated/client'

/**
 * Input for creating a donation
 */
@InputType()
export class CreateDonationInput {
  @Field(() => Float)
  @IsNumber()
  @Min(50, { message: 'Минимальная сумма доната 50₽' })
  @Max(100000, { message: 'Максимальная сумма доната 100,000₽' })
  amount: number

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Сообщение не должно превышать 500 символов' })
  message?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Имя донатора не должно превышать 200 символов' })
  donorName?: string

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean

  @Field(() => PaymentProviderType, { nullable: true })
  @IsOptional()
  providerType?: PaymentProviderType
}
