import { z } from 'zod';

/**
 * Схема валидации для создания команды
 */
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(2, 'Название бригады должно содержать минимум 2 символа')
    .max(50, 'Название бригады должно содержать максимум 50 символов')
    .trim()
    .refine((val) => val.length > 0, {
      message: 'Название бригады обязательно',
    }),
});

/**
 * Схема валидации для обновления логотипа команды
 */
export const updateTeamLogoSchema = z.object({
  logo: z
    .instanceof(File, { message: 'Выберите файл изображения' })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'Размер файла не должен превышать 5MB',
    })
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      {
        message: 'Поддерживаются только форматы: JPG, PNG, WEBP',
      }
    )
    .optional(),
  iconId: z.string().optional(),
});

/**
 * Схема валидации для обновления команды
 */
export const updateTeamSchema = z.object({
  name: z
    .string()
    .min(2, 'Название бригады должно содержать минимум 2 символа')
    .max(50, 'Название бригады должно содержать максимум 50 символов')
    .trim()
    .optional(),
});

/**
 * TypeScript типы из схем
 */
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamLogoInput = z.infer<typeof updateTeamLogoSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
