import { Field, InputType } from '@nestjs/graphql';
import { SupportTicketStatus, SupportTicketPriority } from '../models/admin-support-ticket.model';

@InputType()
export class AdminSupportTicketFilterInput {
  @Field({ nullable: true })
  search?: string;

  @Field(() => SupportTicketStatus, { nullable: true })
  status?: SupportTicketStatus;

  @Field(() => SupportTicketPriority, { nullable: true })
  priority?: SupportTicketPriority;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;
}

@InputType()
export class AdminUpdateSupportTicketInput {
  @Field(() => SupportTicketStatus, { nullable: true })
  status?: SupportTicketStatus;

  @Field(() => SupportTicketPriority, { nullable: true })
  priority?: SupportTicketPriority;

  @Field({ nullable: true })
  category?: string;
}

@InputType()
export class AdminSendMessageInput {
  @Field()
  ticketId: string;

  @Field()
  message: string;

  @Field({ defaultValue: false })
  fromUser: boolean;
}
