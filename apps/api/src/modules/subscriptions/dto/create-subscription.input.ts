import { Field, InputType } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { SubscriptionPlan } from '@prisma/generated/client';

@InputType()
export class CreateSubscriptionInput {
  @Field()
  @IsUUID()
  teamId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @Field({ nullable: true, description: 'Plan ID from database (new Plan model)' })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  useEarlyBird?: boolean;
}
