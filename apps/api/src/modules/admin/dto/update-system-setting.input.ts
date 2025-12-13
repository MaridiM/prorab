import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateSystemSettingInput {
  @Field()
  key: string;

  @Field()
  value: string;
}

@InputType()
export class BulkUpdateSystemSettingsInput {
  @Field(() => [UpdateSystemSettingInput])
  settings: UpdateSystemSettingInput[];
}
