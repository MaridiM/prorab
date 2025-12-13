import { Field, InputType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { SettingCategory } from '@prisma/generated/client';
import { SettingValueType } from '@prisma/generated/client';

@InputType()
export class CreateSystemSettingInput {
  @Field()
  key: string;

  @Field(() => SettingCategory)
  category: SettingCategory;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => SettingValueType)
  valueType: SettingValueType;

  @Field({ nullable: true })
  value?: string;

  @Field({ nullable: true })
  defaultValue?: string;

  @Field({ defaultValue: false })
  isEncrypted?: boolean;

  @Field({ defaultValue: false })
  isRequired?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  validationRules?: any;
}
