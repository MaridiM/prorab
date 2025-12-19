import { ObjectType, Field, Int, ID, Float, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { GraphQLJSON } from 'graphql-scalars';
import { PageInfo } from './shared/page-info.model';

@InputType()
export class AdminPaymentFilters {
  @Field(() => String, { nullable: true, description: 'Search by team name, owner email, or payment ID' })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true, description: 'Filter by status (PENDING, SUCCEEDED, FAILED, CANCELLED)' })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => Date, { nullable: true, description: 'Created after date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAfter?: Date;

  @Field(() => Date, { nullable: true, description: 'Created before date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdBefore?: Date;

  @Field(() => Float, { nullable: true, description: 'Minimum amount' })
  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @Field(() => Float, { nullable: true, description: 'Maximum amount' })
  @IsOptional()
  @IsNumber()
  maxAmount?: number;
}

@ObjectType()
export class AdminPayment {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  subscriptionId: string;

  @Field(() => Float)
  amount: number;

  @Field(() => String)
  currency: string;

  @Field(() => String)
  status: string;

  @Field(() => String, { nullable: true })
  yookassaPaymentId?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Subscription with team and owner details' })
  subscription?: any;
}

@ObjectType()
export class AdminPaymentsConnection {
  @Field(() => [AdminPayment], { description: 'List of payments' })
  nodes: AdminPayment[];

  @Field(() => Int, { description: 'Total count of payments' })
  totalCount: number;

  @Field(() => PageInfo, { description: 'Pagination information' })
  pageInfo: PageInfo;
}

@ObjectType()
export class PaymentsByStatus {
  @Field(() => Int, { description: 'Number of PENDING payments' })
  PENDING: number;

  @Field(() => Int, { description: 'Number of SUCCEEDED payments' })
  SUCCEEDED: number;

  @Field(() => Int, { description: 'Number of FAILED payments' })
  FAILED: number;

  @Field(() => Int, { description: 'Number of CANCELLED payments' })
  CANCELLED: number;
}

@ObjectType()
export class PaymentStats {
  @Field(() => Int, { description: 'Total number of payments' })
  totalPayments: number;

  @Field(() => Int, { description: 'Number of succeeded payments' })
  succeededPayments: number;

  @Field(() => Int, { description: 'Number of pending payments' })
  pendingPayments: number;

  @Field(() => Int, { description: 'Number of failed payments' })
  failedPayments: number;

  @Field(() => Float, { description: 'Total revenue from succeeded payments' })
  totalRevenue: number;

  @Field(() => Float, { description: 'Average payment amount' })
  averagePayment: number;

  @Field(() => PaymentsByStatus, { description: 'Payments count by status' })
  byStatus: PaymentsByStatus;
}

@InputType()
export class RefundPaymentInput {
  @Field(() => Float, { description: 'Refund amount' })
  amount: number;

  @Field(() => String, { description: 'Refund reason' })
  reason: string;
}
