'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, AlertCircle, Maximize2, GripVertical } from 'lucide-react';
import { validatePhotoFile } from '@/packages/schemas/photo-reports';
import type { ProjectPhotoReportsQuery } from '@/packages/api/graphql/__generated__/output';
import { Lightbox } from '@/packages/components/photo-reports/Lightbox';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type PhotoReportWithPhotos = ProjectPhotoReportsQuery['projectPhotoReports'][0];

interface PhotoUploaderNewProps {
  report: PhotoReportWithPhotos;
  onUpload: (file: File, caption?: string) => Promise<void>;
  onDeletePhoto: (photoId: string) => Promise<void>;
  onReorder: (newOrder: string[]) => void;
  onCaptionChange: (photoId: string, caption: string) => void;
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

// --- Sortable Item Component ---
interface SortablePhotoProps {
  photo: any;
  isPending?: boolean;
  disabled?: boolean;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onClick: (id: string) => void;
  onCaptionChange?: (id: string, caption: string) => void;
}

function SortablePhoto({ photo, isPending, disabled, onDelete, onClick, onCaptionChange }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id, disabled: disabled || isPending });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-secondary rounded-lg border border-border overflow-hidden flex flex-col ${
        isPending ? 'border-dashed border-2' : ''
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-black/5">
        <img
          src={isPending ? photo.preview : photo.thumbnailUrl || photo.photoUrl}
          alt={photo.caption || ''}
          className={`w-full h-full object-contain ${!isPending ? 'cursor-pointer' : ''} ${isPending && photo.uploading ? 'opacity-50' : ''}`}
          onClick={(e) => { if (!isPending) { e.preventDefault(); e.stopPropagation(); onClick(photo.id); } }}
        />
        
        {/* Pending Overlay */}
        {isPending && photo.uploading && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
             <Loader2 className="h-6 w-6 text-primary animate-spin" />
             <span className="text-xs font-medium mt-1">Загрузка...</span>
           </div>
        )}

        {isPending && photo.error && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 backdrop-blur-sm p-2">
             <AlertCircle className="h-5 w-5 text-destructive mb-1" />
             <p className="text-xs text-destructive text-center line-clamp-2">{photo.error}</p>
           </div>
        )}

        {/* Drag Handle */}
        {!disabled && !isPending && (
          <div 
            {...attributes} 
            {...listeners} 
            className="absolute top-2 left-2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        {/* Delete Button */}
        {!disabled && (
          <button
            onClick={(e) => onDelete(e, photo.id)}
            className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
            title={isPending ? "Отменить" : "Удалить"}
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {/* View Button */}
        {!isPending && (
          <button
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(photo.id); }}
             className="absolute bottom-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
             title="Просмотр в полноэкранном режиме"
          >
             <Maximize2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Caption Input */}
      <div className="p-2 bg-background border-t border-border">
        <input
          type="text"
          placeholder="Подпись..."
          value={photo.caption || ''}
          onChange={(e) => onCaptionChange && onCaptionChange(photo.id, e.target.value)}
          disabled={disabled}
          className="w-full text-xs px-2 py-1 rounded border border-border bg-muted/50 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          onKeyDown={(e) => e.stopPropagation()} // Allow typing space without triggering drag/nav
        />
      </div>
    </div>
  );
}

// --- Main Component ---

export function PhotoUploaderNew({
  report,
  onUpload,
  onDeletePhoto,
  onReorder,
  onCaptionChange,
  maxFiles = 20,
  disabled = false,
}: PhotoUploaderNewProps) {
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine uploaded and pending photos for unified display
  const uploadedPhotos = report.photos || [];
  
  // Only uploaded photos are sortable via dnd-kit context
  // Pending photos are displayed at the end
  const allPhotos = [...uploadedPhotos];
  const itemIds = allPhotos.map(p => p.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Requires movement for drag
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Handlers ---

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
       const oldIndex = itemIds.indexOf(active.id as string);
       const newIndex = itemIds.indexOf(over?.id as string);
       
       if (oldIndex !== -1 && newIndex !== -1) {
         // Create new sorted array of IDs
         const newOrder = arrayMove(itemIds, oldIndex, newIndex);
         onReorder(newOrder);
       }
    }
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
       if (!files || disabled) return;
       const remainingSlots = maxFiles - (uploadedPhotos.length + pendingPhotos.length);
       if (remainingSlots <= 0) return;

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
       if (fileInputRef.current) fileInputRef.current.value = '';

       // Auto-upload valid photos
       newPending.forEach((photo) => {
         if (!photo.error) {
           handleUploadPhoto(photo.id, photo.file);
         }
       });
    },
    [disabled, maxFiles, uploadedPhotos.length, pendingPhotos.length]
  );

  const handleUploadPhoto = useCallback(
    async (pendingId: string, file: File) => {
      setPendingPhotos((prev) =>
        prev.map((p) => (p.id === pendingId ? { ...p, uploading: true, error: undefined } : p))
      );

      try {
        await onUpload(file); // Parent handles API call
        
        // Remove from pending on success
        setPendingPhotos((prev) => {
          const photo = prev.find((p) => p.id === pendingId);
          if (photo?.preview) URL.revokeObjectURL(photo.preview);
          return prev.filter((p) => p.id !== pendingId);
        });
      } catch (error) {
        setPendingPhotos((prev) =>
          prev.map((p) =>
            p.id === pendingId
              ? { ...p, uploading: false, error: error instanceof Error ? error.message : 'Ошибка' }
              : p
          )
        );
      }
    },
    [onUpload]
  );

  const handleRemovePending = useCallback((id: string) => {
     setPendingPhotos(prev => {
        const p = prev.find(item => item.id === id);
        if (p?.preview) URL.revokeObjectURL(p.preview);
        return prev.filter(item => item.id !== id);
     });
  }, []);

  const handleDeleteUploaded = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if(confirm('Удалить фото?')) {
        await onDeletePhoto(id);
      }
    },
    [onDeletePhoto]
  );

  // File Drop Zone
  const onFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    handleFiles(e.dataTransfer.files);
  };

  const activePhoto = activeId ? allPhotos.find(p => p.id === activeId) : null;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!disabled && (
        <div
          onDrop={onFileDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
          onDragLeave={() => setIsDraggingFile(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
            transition-all duration-200 group
            ${isDraggingFile ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-secondary/30'}
          `}
        >
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Нажмите или перетащите фото</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP до 5MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Helper Text */}
      {uploadedPhotos.length > 0 && (
         <p className="text-xs text-muted-foreground flex items-center justify-between">
            <span>Всего фото: {uploadedPhotos.length + pendingPhotos.length} / {maxFiles}</span>
            <span>Перетаскивайте фото для сортировки</span>
         </p>
      )}

      {/* Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            
            {/* Uploaded Photos (Sortable) */}
            {uploadedPhotos.map((photo) => (
              <SortablePhoto
                key={photo.id}
                photo={photo}
                disabled={disabled}
                onDelete={handleDeleteUploaded}
                onClick={(id) => {
                   const idx = uploadedPhotos.findIndex(p => p.id === id);
                   if(idx !== -1) setLightboxIndex(idx);
                }}
                onCaptionChange={onCaptionChange}
              />
            ))}

            {/* Pending Photos (Not sortable yet) */}
            {pendingPhotos.map((photo) => (
              <SortablePhoto
                 key={photo.id}
                 photo={photo}
                 isPending
                 disabled={true} // Can't sort pending
                 onDelete={(e) => { e.preventDefault(); handleRemovePending(photo.id); }}
                 onClick={() => {}} 
              />
            ))}
            
          </div>
        </SortableContext>
            
        {/* Drag Overlay */}
        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
           {activePhoto ? (
             <SortablePhoto 
                photo={activePhoto} 
                disabled 
                onDelete={()=>{}} 
                onClick={()=>{}} 
                onCaptionChange={undefined}
             />
           ) : null}
        </DragOverlay>
      </DndContext>

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxIndex !== null}
        photos={uploadedPhotos.map(p => ({
            ...p,
            createdAt: p.createdAt || new Date().toISOString()
        } as any))} // Type cast for compatibility
        currentIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        onNext={() => setLightboxIndex(prev => (prev !== null && prev < uploadedPhotos.length - 1 ? prev + 1 : prev))}
        onPrev={() => setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))}
      />
    </div>
  );
}
