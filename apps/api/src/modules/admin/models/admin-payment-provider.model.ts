import { ObjectType, Field, ID, InputType, registerEnumType } from '@nestjs/graphql';
import { PaymentProviderType } from '@prisma/generated/client';

// Register PaymentProviderType enum for GraphQL
registerEnumType(PaymentProviderType, {
  name: 'PaymentProviderType',
  description: 'Payment provider types',
});

// ==================== OBJECT TYPES ====================

@ObjectType({ description: 'Payment provider configuration status' })
export class PaymentProviderConfigStatus {
  @Field(() => Boolean, { nullable: true, description: 'Whether shop ID is configured (Yookassa)' })
  hasShopId?: boolean;

  @Field(() => Boolean, { description: 'Whether secret key is configured' })
  hasSecretKey: boolean;

  @Field(() => Boolean, { description: 'Whether webhook secret is configured' })
  hasWebhookSecret: boolean;

  @Field(() => Boolean, { nullable: true, description: 'Whether publishable key is configured (Stripe)' })
  hasPublishableKey?: boolean;
}

@ObjectType({ description: 'Payment provider' })
export class AdminPaymentProviderModel {
  @Field(() => ID)
  id: string;

  @Field(() => PaymentProviderType, { description: 'Provider type (YOOKASSA, STRIPE)' })
  type: PaymentProviderType;

  @Field(() => String, { description: 'Display name of the provider' })
  name: string;

  @Field(() => Boolean, { description: 'Whether the provider is currently active' })
  isActive: boolean;

  @Field(() => Boolean, { description: 'Whether this is the primary provider' })
  isPrimary: boolean;

  @Field(() => String, { nullable: true, description: 'Webhook URL for this provider' })
  webhookUrl?: string;

  @Field(() => PaymentProviderConfigStatus, { nullable: true, description: 'Configuration status' })
  configStatus?: PaymentProviderConfigStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType({ description: 'Payment provider configuration (safe for admin viewing)' })
export class PaymentProviderConfig {
  @Field(() => String, { nullable: true, description: 'Shop ID (Yookassa only, not sensitive)' })
  shopId?: string;

  @Field(() => Boolean, { description: 'Whether secret key is configured (value not exposed)' })
  hasSecretKey: boolean;

  @Field(() => Boolean, { description: 'Whether webhook secret is configured (value not exposed)' })
  hasWebhookSecret: boolean;

  @Field(() => Boolean, { nullable: true, description: 'Whether publishable key is configured (Stripe only)' })
  hasPublishableKey?: boolean;
}

@ObjectType({ description: 'Test connection result' })
export class TestConnectionResult {
  @Field(() => Boolean, { description: 'Whether the connection test was successful' })
  success: boolean;

  @Field(() => String, { nullable: true, description: 'Success or informational message' })
  message?: string;

  @Field(() => String, { nullable: true, description: 'Error message if failed' })
  error?: string;
}

// ==================== INPUT TYPES ====================

@InputType({ description: 'Payment provider configuration input' })
export class PaymentProviderConfigInput {
  @Field(() => String, { nullable: true, description: 'Shop ID (Yookassa only)' })
  shopId?: string;

  @Field(() => String, { nullable: true, description: 'Secret key (API key)' })
  secretKey?: string;

  @Field(() => String, { nullable: true, description: 'Webhook secret for signature verification' })
  webhookSecret?: string;

  @Field(() => String, { nullable: true, description: 'Publishable key (Stripe only)' })
  publishableKey?: string;
}

@InputType({ description: 'Input for updating payment provider settings' })
export class UpdatePaymentProviderInput {
  @Field(() => Boolean, { nullable: true, description: 'Whether the provider is active' })
  isActive?: boolean;

  @Field(() => Boolean, { nullable: true, description: 'Whether this is the primary provider (only one can be primary)' })
  isPrimary?: boolean;

  @Field(() => PaymentProviderConfigInput, { nullable: true, description: 'Provider configuration (credentials)' })
  config?: PaymentProviderConfigInput;
}
