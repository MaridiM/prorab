import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';

/**
 * Input для обновления метода оплаты и чека выплаты
 */
@InputType()
export class UpdatePayoutPaymentInput {
  @Field(() => ID, { description: 'ID выплаты' })
  @IsUUID()
  payoutId: string;

  @Field(() => PaymentMethod, { description: 'Метод оплаты' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field({ nullable: true, description: 'URL чека/квитанции об оплате' })
  @IsOptional()
  @IsUrl()
  receiptUrl?: string;
}
