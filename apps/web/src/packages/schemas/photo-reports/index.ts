import { z } from 'zod';

/**
 * Schema for creating a new photo report
 */
export const createPhotoReportSchema = z.object({
  projectId: z.string().uuid({ message: 'Некорректный ID проекта' }),
  title: z
    .string()
    .min(3, { message: 'Название должно содержать минимум 3 символа' })
    .max(200, { message: 'Название не должно превышать 200 символов' }),
  description: z
    .string()
    .max(2000, { message: 'Описание не должно превышать 2000 символов' })
    .optional(),
  isPublic: z.boolean().default(true),
});

export type CreatePhotoReportInput = z.infer<typeof createPhotoReportSchema>;

/**
 * Schema for updating a photo report
 */
export const updatePhotoReportSchema = z.object({
  id: z.string().uuid({ message: 'Некорректный ID фотоотчёта' }),
  title: z
    .string()
    .min(3, { message: 'Название должно содержать минимум 3 символа' })
    .max(200, { message: 'Название не должно превышать 200 символов' })
    .optional(),
  description: z
    .string()
    .max(2000, { message: 'Описание не должно превышать 2000 символов' })
    .optional(),
  coverPhotoUrl: z.string().url().optional(),
  isPublic: z.boolean().optional(),
  publishedAt: z.date().optional(),
});

export type UpdatePhotoReportInput = z.infer<typeof updatePhotoReportSchema>;

/**
 * Schema for adding a photo to a report (manual URL)
 */
export const addPhotoSchema = z.object({
  reportId: z.string().uuid({ message: 'Некорректный ID фотоотчёта' }),
  photoUrl: z.string().url({ message: 'Некорректный URL фото' }),
  thumbnailUrl: z.string().url().optional(),
  caption: z
    .string()
    .max(1000, { message: 'Подпись не должна превышать 1000 символов' })
    .optional(),
  orderIndex: z.number().int().min(0).default(0),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  fileSize: z.number().int().positive().optional(),
});

export type AddPhotoInput = z.infer<typeof addPhotoSchema>;

/**
 * Schema for uploading a photo file
 */
export const uploadPhotoSchema = z.object({
  reportId: z.string().uuid({ message: 'Некорректный ID фотоотчёта' }),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'Размер файла не должен превышать 5MB',
    })
    .refine(
      (file) =>
        ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(
          file.type,
        ),
      {
        message: 'Допустимые форматы: PNG, JPG, JPEG, WEBP',
      },
    ),
  caption: z
    .string()
    .max(1000, { message: 'Подпись не должна превышать 1000 символов' })
    .optional(),
  orderIndex: z.number().int().min(0).default(0),
});

export type UploadPhotoInput = z.infer<typeof uploadPhotoSchema>;

/**
 * Client-side validation for photo files
 */
export const validatePhotoFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  if (file.size > maxSize) {
    return { valid: false, error: 'Размер файла не должен превышать 5MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Допустимые форматы: PNG, JPG, JPEG, WEBP' };
  }

  return { valid: true };
};
