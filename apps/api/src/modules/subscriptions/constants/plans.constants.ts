import { SubscriptionPlan } from '@prisma/generated/client';

export interface PlanLimits {
  name: string;
  price: number;
  earlyBirdPrice: number;
  maxActiveProjects: number | null; // null = unlimited
  maxMembers: number;
  storageGB: number;
  features: string[];
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  LITE: {
    name: 'Лайт',
    price: 490,
    earlyBirdPrice: 290,
    maxActiveProjects: 1,
    maxMembers: 1,
    storageGB: 0.5, // 500 MB
    features: ['Базовый функционал', 'Email поддержка'],
  },
  FOREMAN: {
    name: 'Прораб',
    price: 990,
    earlyBirdPrice: 690,
    maxActiveProjects: 4,
    maxMembers: 3,
    storageGB: 2,
    features: ['Расчёты зарплаты', 'Фотоотчёты', 'Priority support'],
  },
  BRIGADE: {
    name: 'Бригада',
    price: 1990,
    earlyBirdPrice: 1490,
    maxActiveProjects: null, // unlimited
    maxMembers: 10,
    storageGB: 10,
    features: ['Все функции', 'API доступ', 'Dedicated support'],
  },
} as const;

export const TRIAL_DURATION_DAYS = 14;
export const BILLING_CYCLE_DAYS = 30;
export const EARLY_BIRD_LIMIT = 500;
