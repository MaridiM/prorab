'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { validatePhotoFile } from '@/packages/schemas/photo-reports';

interface PhotoFile {
  file: File;
  preview: string;
  caption?: string;
  error?: string;
}

interface PhotoUploaderProps {
  reportId: string;
  onUpload: (file: File, caption?: string) => Promise<void>;
  maxFiles?: number;
  disabled?: boolean;
}

export function PhotoUploader({
  reportId,
  onUpload,
  maxFiles = 10,
  disabled = false,
}: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingIndexes, setUploadingIndexes] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;

      const newPhotos: PhotoFile[] = [];
      const fileArray = Array.from(files);

      // Limit total files
      const remainingSlots = maxFiles - photos.length;
      const filesToProcess = fileArray.slice(0, remainingSlots);

      filesToProcess.forEach((file) => {
        const validation = validatePhotoFile(file);

        if (!validation.valid) {
          newPhotos.push({
            file,
            preview: '',
            error: validation.error,
          });
          return;
        }

        // Create preview
        const preview = URL.createObjectURL(file);
        newPhotos.push({ file, preview });
      });

      setPhotos((prev) => [...prev, ...newPhotos]);
    },
    [photos.length, maxFiles, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const updated = [...prev];
      const removed = updated.splice(index, 1)[0];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  }, []);

  const handleCaptionChange = useCallback((index: number, caption: string) => {
    setPhotos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], caption };
      return updated;
    });
  }, []);

  const handleUploadPhoto = useCallback(
    async (index: number) => {
      const photo = photos[index];
      if (!photo || photo.error || uploadingIndexes.has(index)) return;

      setUploadingIndexes((prev) => new Set(prev).add(index));

      try {
        await onUpload(photo.file, photo.caption);

        // Remove from list after successful upload
        setPhotos((prev) => {
          const updated = [...prev];
          const removed = updated.splice(index, 1)[0];
          if (removed.preview) {
            URL.revokeObjectURL(removed.preview);
          }
          return updated;
        });
      } catch (error) {
        // Update error state
        setPhotos((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            error: error instanceof Error ? error.message : 'Ошибка загрузки',
          };
          return updated;
        });
      } finally {
        setUploadingIndexes((prev) => {
          const updated = new Set(prev);
          updated.delete(index);
          return updated;
        });
      }
    },
    [photos, uploadingIndexes, onUpload]
  );

  const handleUploadAll = useCallback(async () => {
    const validPhotos = photos
      .map((photo, index) => ({ photo, index }))
      .filter(({ photo }) => !photo.error);

    for (const { index } of validPhotos) {
      if (!uploadingIndexes.has(index)) {
        await handleUploadPhoto(index);
      }
    }
  }, [photos, uploadingIndexes, handleUploadPhoto]);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Перетащите фото сюда или кликните для выбора
        </p>
        <p className="mt-1 text-xs text-gray-500">
          PNG, JPG, WEBP до 5MB (макс. {maxFiles} фото)
        </p>
      </div>

      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Выбрано фото: {photos.length}
            </p>
            {photos.some((p) => !p.error) && (
              <button
                onClick={handleUploadAll}
                disabled={disabled || uploadingIndexes.size > 0}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingIndexes.size > 0 ? 'Загрузка...' : 'Загрузить всё'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className={`
                  relative border rounded-lg overflow-hidden
                  ${photo.error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                `}
              >
                {/* Preview image or error icon */}
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  {photo.preview ? (
                    <img
                      src={photo.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemovePhoto(index)}
                  disabled={uploadingIndexes.has(index)}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 disabled:opacity-50"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>

                {/* Upload overlay */}
                {uploadingIndexes.has(index) && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}

                {/* Caption input */}
                <div className="p-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Подпись к фото (необязательно)"
                    value={photo.caption || ''}
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    disabled={uploadingIndexes.has(index)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />

                  {/* Error message */}
                  {photo.error && (
                    <p className="text-xs text-red-600">{photo.error}</p>
                  )}

                  {/* File info */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate">{photo.file.name}</span>
                    <span>{(photo.file.size / 1024).toFixed(0)} KB</span>
                  </div>

                  {/* Upload button */}
                  {!photo.error && !uploadingIndexes.has(index) && (
                    <button
                      onClick={() => handleUploadPhoto(index)}
                      disabled={disabled}
                      className="w-full px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Загрузить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
