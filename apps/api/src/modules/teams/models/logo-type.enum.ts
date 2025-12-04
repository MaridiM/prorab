import { registerEnumType } from '@nestjs/graphql';

/**
 * Тип логотипа команды
 */
export enum LogoType {
  /** Пользователь загрузил файл изображения */
  UPLOADED = 'UPLOADED',
  /** Используется иконка + цвет из пресетов */
  GENERATED = 'GENERATED',
  /** Дефолтный логотип системы */
  DEFAULT = 'DEFAULT',
}

registerEnumType(LogoType, {
  name: 'LogoType',
  description: 'Тип логотипа команды',
});
