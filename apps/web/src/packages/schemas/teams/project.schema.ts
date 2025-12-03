import { z } from 'zod';

/**
 * Схема валидации для создания проекта (первого объекта)
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Название объекта должно содержать минимум 2 символа')
    .max(100, 'Название объекта должно содержать максимум 100 символов')
    .trim()
    .refine((val) => val.length > 0, {
      message: 'Название объекта обязательно',
    }),
  address: z
    .string()
    .min(5, 'Адрес должен содержать минимум 5 символов')
    .max(200, 'Адрес должен содержать максимум 200 символов')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Описание должно содержать максимум 500 символов')
    .trim()
    .optional(),
});

/**
 * Схема валидации для обновления проекта
 */
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Название объекта должно содержать минимум 2 символа')
    .max(100, 'Название объекта должно содержать максимум 100 символов')
    .trim()
    .optional(),
  address: z
    .string()
    .min(5, 'Адрес должен содержать минимум 5 символов')
    .max(200, 'Адрес должен содержать максимум 200 символов')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Описание должно содержать максимум 500 символов')
    .trim()
    .optional(),
  isActive: z.boolean().optional(),
});

/**
 * TypeScript типы из схем
 */
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
