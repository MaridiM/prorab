import { ObjectType, Field, ID, registerEnumType, InputType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

/**
 * Admin Role Types
 */
export enum AdminRoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SUPPORT = 'SUPPORT',
}

registerEnumType(AdminRoleType, {
  name: 'AdminRoleType',
  description: 'Admin role types with different permission levels',
});

/**
 * Admin Role Detail - Full admin role information with user details
 */
@ObjectType()
export class AdminRoleDetail {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => User)
  user: User;

  @Field(() => AdminRoleType)
  role: AdminRoleType;

  @Field(() => [String])
  permissions: string[];

  @Field()
  twoFactorEnforced: boolean;

  @Field(() => [String])
  ipWhitelist: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

/**
 * Input for assigning admin role
 */
@InputType()
export class AssignAdminRoleInput {
  @Field()
  userId: string;

  @Field(() => AdminRoleType)
  role: AdminRoleType;

  @Field(() => [String], { nullable: true })
  permissions?: string[];

  @Field({ nullable: true })
  twoFactorEnforced?: boolean;

  @Field(() => [String], { nullable: true })
  ipWhitelist?: string[];
}

/**
 * Input for updating admin permissions
 */
@InputType()
export class UpdateAdminPermissionsInput {
  @Field()
  roleId: string;

  @Field(() => [String])
  permissions: string[];
}

/**
 * Input for updating two-factor enforcement
 */
@InputType()
export class UpdateTwoFactorInput {
  @Field()
  roleId: string;

  @Field()
  enforced: boolean;
}

/**
 * Input for updating IP whitelist
 */
@InputType()
export class UpdateIpWhitelistInput {
  @Field()
  roleId: string;

  @Field(() => [String])
  ipAddresses: string[];
}
