import { registerEnumType } from '@nestjs/graphql';

export enum AdminRoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SUPPORT = 'SUPPORT',
}

registerEnumType(AdminRoleType, {
  name: 'AdminRoleType',
  description: 'Admin role types',
});
