/**
 * Global handler for subscription limit errors from GraphQL
 * Shows toast notifications and redirects to billing page
 */

import { useToastStore } from '@/packages/libs/store';

export type LimitType = 'projects' | 'members' | 'storage';

export interface LimitError {
  limitType: LimitType;
  current: number;
  limit: number;
  required?: number;
  message: string;
}

const LIMIT_MESSAGES: Record<LimitType, string> = {
  projects: 'Достигнут лимит проектов',
  members: 'Достигнут лимит участников команды',
  storage: 'Недостаточно места в хранилище',
};

const LIMIT_DESCRIPTIONS: Record<LimitType, (limit: number, current: number) => string> = {
  projects: (limit, current) => `У вас активно ${current} из ${limit} проектов. Улучшите план для добавления новых проектов.`,
  members: (limit, current) => `В команде ${current} из ${limit} участников. Улучшите план для приглашения новых участников.`,
  storage: (limit, current) => `Использовано ${current.toFixed(2)} ГБ из ${limit} ГБ. Улучшите план для загрузки новых файлов.`,
};

/**
 * Show limit error notification and redirect to billing page
 */
export function handleLimitError(error: LimitError) {
  const title = LIMIT_MESSAGES[error.limitType];
  const description = LIMIT_DESCRIPTIONS[error.limitType](error.limit, error.current);

  // Show toast with action to upgrade
  const show = useToastStore.getState().show;
  const message = `${title}: ${description}`;
  show(message, 'error');

  // Redirect to billing settings after a short delay
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/settings?tab=billing';
    }
  }, 2000);

  // Log for debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Limit Error]', {
      type: error.limitType,
      current: error.current,
      limit: error.limit,
      required: error.required,
      message: error.message,
    });
  }
}

/**
 * Check if GraphQL error is a limit error
 */
export function isLimitError(extensions: any): boolean {
  return (
    extensions?.code === 'LIMIT_EXCEEDED' ||
    extensions?.code === 'FORBIDDEN' &&
    extensions?.limitType !== undefined
  );
}

/**
 * Extract limit error info from GraphQL error extensions
 */
export function extractLimitError(extensions: any): LimitError | null {
  if (!isLimitError(extensions)) {
    return null;
  }

  const { limitType, current, limit, required, message } = extensions;

  // Validate limit type
  if (!['projects', 'members', 'storage'].includes(limitType)) {
    return null;
  }

  return {
    limitType: limitType as LimitType,
    current: Number(current) || 0,
    limit: Number(limit) || 0,
    required: required !== undefined ? Number(required) : undefined,
    message: message || 'Limit exceeded',
  };
}
