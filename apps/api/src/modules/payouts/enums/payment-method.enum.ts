import { registerEnumType } from '@nestjs/graphql';

/**
 * Enum для методов оплаты выплат
 */
export enum PaymentMethod {
  CASH = 'cash',           // Наличные
  CARD = 'card',           // Банковская карта
  TRANSFER = 'transfer',   // Банковский перевод
  SBP = 'sbp',             // Система быстрых платежей
}

// Регистрируем enum для использования в GraphQL
registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
  description: 'Метод оплаты для выплат персоналу',
  valuesMap: {
    CASH: {
      description: 'Наличные',
    },
    CARD: {
      description: 'Банковская карта',
    },
    TRANSFER: {
      description: 'Банковский перевод',
    },
    SBP: {
      description: 'Система быстрых платежей (СБП)',
    },
  },
});
