'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { validatePhotoFile } from '@/packages/schemas/photo-reports';
import type { ProjectPhotoReportsQuery } from '@/packages/api/graphql/__generated__/output';

type PhotoReportWithPhotos = ProjectPhotoReportsQuery['projectPhotoReports'][0];

interface PhotoUploaderNewProps {
  report: PhotoReportWithPhotos;
  onUpload: (file: File, caption?: string) => Promise<void>;
  onDeletePhoto: (photoId: string) => Promise<void>;
  maxFiles?: number;
  disabled?: boolean;
}

interface PendingPhoto {
  id: string;
  file: File;
  preview: string;
  caption: string;
  error?: string;
  uploading: boolean;
}

export function PhotoUploaderNew({
  report,
  onUpload,
  onDeletePhoto,
  maxFiles = 20,
  disabled = false,
}: PhotoUploaderNewProps) {
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate how many more photos can be added
  const reportPhotos = report.photos || [];
  const currentCount = reportPhotos.length + pendingPhotos.length;
  const remainingSlots = maxFiles - currentCount;
  const canAddMore = remainingSlots > 0 && !disabled;

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !canAddMore) return;

      const fileArray = Array.from(files).slice(0, remainingSlots);
      const newPending: PendingPhoto[] = [];

      fileArray.forEach((file) => {
        const validation = validatePhotoFile(file);
        const preview = validation.valid ? URL.createObjectURL(file) : '';

        newPending.push({
          id: `pending-${Date.now()}-${Math.random()}`,
          file,
          preview,
          caption: '',
          error: validation.error,
          uploading: false,
        });
      });

      setPendingPhotos((prev) => [...prev, ...newPending]);

      // Reset file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Auto-upload valid photos
      newPending.forEach((photo) => {
        if (!photo.error) {
          handleUploadPhoto(photo.id, photo.file);
        }
      });
    },
    [canAddMore, remainingSlots]
  );

  const handleUploadPhoto = useCallback(
    async (pendingId: string, file: File) => {
      // Set uploading state
      setPendingPhotos((prev) =>
        prev.map((p) => (p.id === pendingId ? { ...p, uploading: true, error: undefined } : p))
      );

      try {
        await onUpload(file); // Use the file passed directly

        // Remove from pending after successful upload
        setPendingPhotos((prev) => {
          const photo = prev.find((p) => p.id === pendingId);
          // Cleanup preview URL
          if (photo?.preview) {
            URL.revokeObjectURL(photo.preview);
          }
          return prev.filter((p) => p.id !== pendingId);
        });
      } catch (error) {
        setPendingPhotos((prev) =>
          prev.map((p) =>
            p.id === pendingId
              ? {
                  ...p,
                  uploading: false,
                  error: error instanceof Error ? error.message : 'Ошибка загрузки',
                }
              : p
          )
        );
      }
    },
    [onUpload]
  );

  const handleRemovePending = useCallback((pendingId: string) => {
    setPendingPhotos((prev) => {
      const photo = prev.find((p) => p.id === pendingId);
      if (photo?.preview) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== pendingId);
    });
  }, []);

  const handleDeleteUploaded = useCallback(
    async (e: React.MouseEvent, photoId: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm('Удалить это фото?')) return;
      try {
        await onDeletePhoto(photoId);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Ошибка удаления');
      }
    },
    [onDeletePhoto]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (canAddMore) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [canAddMore, handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (canAddMore) {
      fileInputRef.current?.click();
    }
  }, [canAddMore]);

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border hover:border-primary/50 hover:bg-secondary/30'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Перетащите фото или кликните для выбора
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WEBP до 5MB • Осталось мест: {remainingSlots}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      {(reportPhotos.length > 0 || pendingPhotos.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Uploaded Photos */}
          {reportPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-secondary border border-border group"
            >
              <img
                src={photo.thumbnailUrl || photo.photoUrl}
                alt={photo.caption || ''}
                className="w-full h-full object-contain"
                loading="lazy"
              />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white line-clamp-2">{photo.caption}</p>
                </div>
              )}
              <button
                onClick={(e) => handleDeleteUploaded(e, photo.id)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
                title="Удалить"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Pending Photos */}
          {pendingPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-secondary border-2 border-dashed border-border"
            >
              {photo.preview && (
                <img
                  src={photo.preview}
                  alt="Preview"
                  className={`w-full h-full object-contain ${photo.uploading ? 'opacity-50' : ''}`}
                />
              )}

              {photo.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              )}

              {photo.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 backdrop-blur-sm p-2">
                  <AlertCircle className="h-5 w-5 text-destructive mb-1" />
                  <p className="text-xs text-destructive text-center line-clamp-2">{photo.error}</p>
                </div>
              )}

              {!photo.uploading && (
                <button
                  onClick={() => handleRemovePending(photo.id)}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
                  title="Отменить"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {reportPhotos.length === 0 && pendingPhotos.length === 0 && !canAddMore && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Достигнут лимит фотографий</p>
        </div>
      )}
    </div>
  );
}
