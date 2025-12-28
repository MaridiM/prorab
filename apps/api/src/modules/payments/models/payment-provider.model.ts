import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { PaymentProviderType } from '@prisma/generated/client';

// Register enum for GraphQL
registerEnumType(PaymentProviderType, {
  name: 'PaymentProviderType',
  description: 'Payment provider type (YOOKASSA or STRIPE)',
});

@ObjectType({ description: 'Payment provider for user selection' })
export class PaymentProviderModel {
  @Field()
  id: string;

  @Field(() => PaymentProviderType)
  type: PaymentProviderType;

  @Field()
  name: string;

  @Field()
  isActive: boolean;

  @Field()
  isPrimary: boolean;
}
