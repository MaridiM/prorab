'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, X } from 'lucide-react';
import {
  createPhotoReportSchema,
  updatePhotoReportSchema,
  type CreatePhotoReportInput,
  type UpdatePhotoReportInput,
} from '@/packages/schemas/photo-reports';
import type { PhotoReportFieldsFragment } from '@/packages/api/graphql/__generated__/output';

interface PhotoReportFormProps {
  projectId: string;
  report?: PhotoReportFieldsFragment;
  onSubmit: (data: CreatePhotoReportInput | UpdatePhotoReportInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function PhotoReportForm({
  projectId,
  report,
  onSubmit,
  onCancel,
  isLoading = false,
}: PhotoReportFormProps) {
  const isEditMode = !!report;
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<CreatePhotoReportInput | UpdatePhotoReportInput>({
    resolver: zodResolver(isEditMode ? updatePhotoReportSchema : createPhotoReportSchema),
    defaultValues: isEditMode
      ? {
          id: report.id,
          title: report.title,
          description: report.description || '',
          isPublic: report.isPublic,
        }
      : {
          projectId,
          title: '',
          description: '',
          isPublic: true,
        },
  });

  const handleFormSubmit = async (data: CreatePhotoReportInput | UpdatePhotoReportInput) => {
    setError(null);
    try {
      await onSubmit(data);
      if (!isEditMode) {
        reset();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Название фотоотчёта <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          disabled={isLoading}
          placeholder="Например: Этап 1 - Фундамент"
          className={`
            w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.title ? 'border-red-500' : 'border-gray-300'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Описание
        </label>
        <textarea
          id="description"
          {...register('description')}
          disabled={isLoading}
          placeholder="Опишите текущий этап работ или достижения..."
          rows={4}
          className={`
            w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
            ${errors.description ? 'border-red-500' : 'border-gray-300'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Public toggle */}
      <div className="flex items-center gap-3">
        <input
          id="isPublic"
          type="checkbox"
          {...register('isPublic')}
          disabled={isLoading}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isPublic" className="text-sm text-gray-700">
          Сделать отчёт публичным (доступен по ссылке без авторизации)
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="inline h-4 w-4 mr-2" />
            Отмена
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || (!isDirty && isEditMode)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEditMode ? 'Сохранить изменения' : 'Создать фотоотчёт'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
