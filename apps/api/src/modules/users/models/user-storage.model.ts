/**
 * User Storage GraphQL Models
 *
 * Models for user storage preference management
 */

import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

/**
 * Storage Provider Type Enum
 */
export enum UserStorageProviderType {
  LOCAL = 'local',
  CLOUDINARY = 'cloudinary',
  R2 = 'r2',
}

registerEnumType(UserStorageProviderType, {
  name: 'UserStorageProviderType',
  description: 'Available storage provider types for users',
});

/**
 * User Storage Preference Model
 */
@ObjectType()
export class UserStoragePreference {
  @Field(() => UserStorageProviderType, {
    nullable: true,
    description: 'User\'s preferred storage provider (null = use system default)',
  })
  preferredProvider: UserStorageProviderType | null;

  @Field(() => Boolean, {
    description: 'Whether user can change storage preference (admin allows user_choice)',
  })
  canChangeProvider: boolean;

  @Field(() => UserStorageProviderType, {
    description: 'Currently active storage provider for this user',
  })
  activeProvider: UserStorageProviderType;

  @Field(() => UserStorageProviderType, {
    nullable: true,
    description: 'Previous provider if migrated',
  })
  migratedFrom: UserStorageProviderType | null;

  @Field(() => Date, {
    nullable: true,
    description: 'Date of last migration',
  })
  migratedAt: Date | null;
}

/**
 * Available Storage Options
 */
@ObjectType()
export class StorageProviderOption {
  @Field(() => UserStorageProviderType, { description: 'Provider type' })
  provider: UserStorageProviderType;

  @Field(() => String, { description: 'Provider display name' })
  name: string;

  @Field(() => String, { description: 'Provider description' })
  description: string;

  @Field(() => Boolean, { description: 'Whether this provider is available' })
  available: boolean;

  @Field(() => Boolean, { description: 'Whether this is currently selected' })
  current: boolean;
}
