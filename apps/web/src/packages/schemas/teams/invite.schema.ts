import { z } from 'zod';

/**
 * Схема валидации для кода приглашения
 * Код должен содержать ровно 8 символов (A-Z, 2-9, без I, O, 1, 0)
 */
export const inviteCodeSchema = z.object({
  code: z
    .string()
    .length(8, 'Код приглашения должен содержать ровно 8 символов')
    .regex(/^[A-Z2-9]{8}$/, {
      message: 'Код приглашения должен содержать только заглавные буквы (A-Z, кроме I и O) и цифры (2-9)',
    })
    .transform((val) => val.toUpperCase()),
});

/**
 * Схема валидации для генерации кода приглашения
 */
export const generateInviteCodeSchema = z.object({
  teamId: z.string().uuid('Некорректный ID команды'),
});

/**
 * Схема валидации для присоединения к команде по коду
 */
export const joinTeamByCodeSchema = z.object({
  code: z
    .string()
    .length(8, 'Код приглашения должен содержать ровно 8 символов')
    .regex(/^[A-Z2-9]{8}$/, {
      message: 'Код приглашения должен содержать только заглавные буквы (A-Z, кроме I и O) и цифры (2-9)',
    })
    .transform((val) => val.toUpperCase()),
});

/**
 * TypeScript типы из схем
 */
export type InviteCodeInput = z.infer<typeof inviteCodeSchema>;
export type GenerateInviteCodeInput = z.infer<typeof generateInviteCodeSchema>;
export type JoinTeamByCodeInput = z.infer<typeof joinTeamByCodeSchema>;
