import { registerEnumType } from '@nestjs/graphql';

/**
 * Статус проекта
 */
export enum ProjectStatus {
  /** Активный проект */
  ACTIVE = 'ACTIVE',
  /** Архивный проект */
  ARCHIVED = 'ARCHIVED',
  /** Завершённый проект */
  COMPLETED = 'COMPLETED',
}

// Регистрация в GraphQL
registerEnumType(ProjectStatus, {
  name: 'ProjectStatus',
  description: 'Статус проекта',
  valuesMap: {
    ACTIVE: {
      description: 'Активный проект',
    },
    ARCHIVED: {
      description: 'Архивный проект',
    },
    COMPLETED: {
      description: 'Завершённый проект',
    },
  },
});
