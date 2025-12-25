import { registerEnumType } from '@nestjs/graphql';

export enum SettingCategory {
  PAYMENT = 'PAYMENT',
  EMAIL = 'EMAIL',
  TELEGRAM = 'TELEGRAM',
  STORAGE = 'STORAGE',
  SMS = 'SMS',
  SOCIAL = 'SOCIAL',
  ANALYTICS = 'ANALYTICS',
  AI = 'AI',
  SECURITY = 'SECURITY',
  GENERAL = 'GENERAL',
}

registerEnumType(SettingCategory, {
  name: 'SettingCategory',
  description: 'System setting categories',
});
