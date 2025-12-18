import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

export enum SupportTicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_USER = 'WAITING_USER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum SupportTicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

registerEnumType(SupportTicketStatus, {
  name: 'SupportTicketStatus',
  description: 'Status of a support ticket',
});

registerEnumType(SupportTicketPriority, {
  name: 'SupportTicketPriority',
  description: 'Priority level of a support ticket',
});

@ObjectType()
export class SupportMessage {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  ticketId: string;

  @Field()
  fromUser: boolean;

  @Field()
  message: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class AdminSupportTicket {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field({ nullable: true, description: 'User email (populated from relation)' })
  userEmail?: string;

  @Field({ nullable: true, description: 'User full name (populated from relation)' })
  userFullName?: string;

  @Field()
  telegramChatId: string;

  @Field({ nullable: true })
  subject?: string;

  @Field(() => SupportTicketStatus)
  status: SupportTicketStatus;

  @Field(() => SupportTicketPriority)
  priority: SupportTicketPriority;

  @Field({ nullable: true })
  category?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  closedAt?: Date;

  @Field(() => [SupportMessage], { nullable: true })
  messages?: SupportMessage[];

  @Field(() => Int, { nullable: true, description: 'Count of messages in ticket' })
  messageCount?: number;
}

@ObjectType()
export class AdminSupportTicketsResult {
  @Field(() => [AdminSupportTicket])
  tickets: AdminSupportTicket[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;
}

@ObjectType()
export class AdminSupportStatistics {
  @Field(() => Int)
  totalTickets: number;

  @Field(() => Int)
  openTickets: number;

  @Field(() => Int)
  inProgressTickets: number;

  @Field(() => Int)
  resolvedTickets: number;

  @Field(() => Int)
  closedTickets: number;

  @Field(() => GraphQLJSON)
  ticketsByPriority: Record<string, number>;

  @Field(() => GraphQLJSON)
  ticketsByCategory: Record<string, number>;
}
