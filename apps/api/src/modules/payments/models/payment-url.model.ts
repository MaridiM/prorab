import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('PaymentUrl')
export class PaymentUrlModel {
  @Field()
  url: string;

  @Field()
  paymentId: string;
}
