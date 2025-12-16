/**
 * Update Storage Preference Input
 *
 * DTO for updating user's storage provider preference
 */

import { InputType, Field } from '@nestjs/graphql';
import { UserStorageProviderType } from '../models/user-storage.model';

@InputType()
export class UpdateStoragePreferenceInput {
  @Field(() => UserStorageProviderType, {
    description: 'Preferred storage provider (local, cloudinary, or r2)',
  })
  provider: UserStorageProviderType;
}
