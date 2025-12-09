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
import type { ProjectPhotoReportsQuery } from '@/packages/api/graphql/__generated__/output';
import { PhotoUploaderNew } from './PhotoUploaderNew';

type PhotoReportWithPhotos = ProjectPhotoReportsQuery['projectPhotoReports'][0];

interface PhotoReportFormProps {
  projectId: string;
  report?: PhotoReportWithPhotos;
  onSubmit: (data: CreatePhotoReportInput | UpdatePhotoReportInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  onUploadPhoto?: (file: File, caption?: string) => Promise<void>;
  onDeletePhoto?: (photoId: string) => Promise<void>;
}

export function PhotoReportForm({
  projectId,
  report,
  onSubmit,
  onCancel,
  isLoading = false,
  onUploadPhoto,
  onDeletePhoto,
}: PhotoReportFormProps) {
  const isEditMode = !!report;
  const [error, setError] = useState<string | null>(null);

  // Local state for transactional editing
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<Set<string>>(new Set());
  const [newPhotos, setNewPhotos] = useState<Array<{ id: string; file: File; preview: string; name: string }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<any>({
    resolver: zodResolver(isEditMode ? updatePhotoReportSchema : createPhotoReportSchema) as any,
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

  // Derived state for display
  const currentPhotos = [
    ...(report?.photos || [])
      .filter((p) => !deletedPhotoIds.has(p.id))
      .map((p) => ({ ...p, isNew: false })),
    ...newPhotos.map((p) => ({
      id: p.id,
      photoUrl: p.preview,
      thumbnailUrl: p.preview,
      caption: null,
      orderIndex: 0,
      width: 0,
      height: 0,
      fileSize: p.file.size,
      createdAt: new Date().toISOString(),
      __typename: 'ReportPhoto' as const,
      isNew: true,
    })),
  ];

  // Combined report object for PhotoUploader
  const displayReport = report
    ? { ...report, photos: currentPhotos }
    : {
        id: 'draft',
        photos: currentPhotos,
        projectId,
        title: '',
        description: '',
        isPublic: true,
        slug: '',
        createdById: '',
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
        viewCount: 0,
        __typename: 'PhotoReport' as const,
      };

  const handleLocalUpload = async (file: File, caption?: string) => {
    // Create preview
    const preview = URL.createObjectURL(file);
    const id = `new-${Date.now()}-${Math.random()}`;
    
    setNewPhotos((prev) => [...prev, { id, file, preview, name: file.name }]);
  };

  const handleLocalDelete = async (photoId: string) => {
    if (photoId.startsWith('new-')) {
      // It's a new photo, just remove from local state
      setNewPhotos((prev) => {
        const photo = prev.find((p) => p.id === photoId);
        if (photo) {
          URL.revokeObjectURL(photo.preview);
        }
        return prev.filter((p) => p.id !== photoId);
      });
    } else {
      // It's an existing photo, mark for deletion
      setDeletedPhotoIds((prev) => {
        const next = new Set(prev);
        next.add(photoId);
        return next;
      });
    }
  };

  const handleFormSubmit = async (data: CreatePhotoReportInput | UpdatePhotoReportInput) => {
    setError(null);
    try {
      // 1. Process deletions
      if (onDeletePhoto && deletedPhotoIds.size > 0) {
        await Promise.all(Array.from(deletedPhotoIds).map((id) => onDeletePhoto(id)));
      }

      // 2. Process uploads
      if (onUploadPhoto && newPhotos.length > 0) {
        // Sequentially upload to preserve order or just Promise.all
        // For now Promise.all is fine, or we can do sequential if needed
        for (const photo of newPhotos) {
          await onUploadPhoto(photo.file);
        }
      }

      // 3. Save form data
      await onSubmit(data);

      if (!isEditMode) {
        reset();
      }
      
      // Reset local state on success (if we stay on page, e.g. edit mode)
      setDeletedPhotoIds(new Set());
      setNewPhotos([]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при сохранении');
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
          <p className="mt-1 text-sm text-red-600">{errors.title?.message as string}</p>
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
          <p className="mt-1 text-sm text-red-600">{errors.description?.message as string}</p>
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

      {/* Photo Uploader - Always show if we have handlers, to allow adding photos to draft */}
      {(isEditMode || (onUploadPhoto && onDeletePhoto)) && (
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Фотографии ({currentPhotos.length})
          </h3>
          <PhotoUploaderNew
            report={displayReport}
            onUpload={handleLocalUpload}
            onDeletePhoto={handleLocalDelete}
            disabled={isLoading}
          />
        </div>
      )}

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
          disabled={isLoading}
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
