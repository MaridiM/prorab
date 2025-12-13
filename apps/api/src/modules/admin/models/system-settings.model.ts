import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { SettingCategory } from '@prisma/generated/client';
import { SettingValueType } from '@prisma/generated/client';

registerEnumType(SettingCategory, {
  name: 'SettingCategory',
  description: 'System setting categories',
});

registerEnumType(SettingValueType, {
  name: 'SettingValueType',
  description: 'System setting value types',
});

@ObjectType()
export class SystemSetting {
  @Field(() => ID)
  id: string;

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

  @Field()
  isEncrypted: boolean;

  @Field()
  isRequired: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  validationRules?: any;

  @Field({ nullable: true })
  updatedBy?: string;

  @Field()
  updatedAt: Date;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ConnectionTestResult {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
