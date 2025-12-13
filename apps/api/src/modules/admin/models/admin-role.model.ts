import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AdminRoleType } from '@prisma/generated/client';

registerEnumType(AdminRoleType, {
  name: 'AdminRoleType',
  description: 'Admin role types',
});

@ObjectType()
export class AdminRole {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => AdminRoleType)
  role: AdminRoleType;

  @Field(() => [String])
  permissions: string[];

  @Field(() => String, { nullable: true })
  assignedBy?: string;

  @Field()
  assignedAt: Date;

  @Field()
  twoFactorEnforced: boolean;

  @Field(() => [String])
  ipWhitelist: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
