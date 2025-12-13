import { registerEnumType } from '@nestjs/graphql';

export enum SettingValueType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
  ENCRYPTED = 'ENCRYPTED',
}

registerEnumType(SettingValueType, {
  name: 'SettingValueType',
  description: 'System setting value types',
});
