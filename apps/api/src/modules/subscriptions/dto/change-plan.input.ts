import { Field, InputType } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { SubscriptionPlan } from '@prisma/generated/client';

@InputType()
export class ChangePlanInput {
  @Field()
  @IsUUID()
  subscriptionId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  newPlan?: SubscriptionPlan;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  newPlanId?: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  immediate: boolean;
}
