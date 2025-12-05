'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Eye, Image as ImageIcon, MoreVertical, Pencil, Trash2, ExternalLink } from 'lucide-react';
import type { PhotoReportFieldsFragment } from '@/packages/api/graphql/__generated__/output';

interface PhotoReportCardProps {
  report: PhotoReportFieldsFragment & {
    photos?: Array<{ id: string; thumbnailUrl?: string }>;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  apiUrl?: string;
}

export function PhotoReportCard({
  report,
  onEdit,
  onDelete,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
}: PhotoReportCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const photoCount = report.photos?.length || 0;
  const coverUrl = report.coverPhotoUrl
    ? `${apiUrl}${report.coverPhotoUrl}`
    : null;

  const publicUrl = `/r/${report.slug}`;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Cover image */}
      <div className="aspect-video bg-gray-100 relative">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={report.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-gray-300" />
          </div>
        )}

        {/* Public badge */}
        {report.isPublic && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
            Публичный
          </div>
        )}

        {/* Menu button */}
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </button>

            {menuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {onEdit && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Редактировать
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Удалить
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {report.title}
        </h3>

        {/* Description */}
        {report.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {report.description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <ImageIcon className="h-3.5 w-3.5" />
            <span>{photoCount} фото</span>
          </div>

          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{report.viewCount} просмотров</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(report.createdAt)}</span>
          </div>
        </div>

        {/* Public link */}
        {report.isPublic && (
          <Link
            href={publicUrl}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Открыть публичную ссылку
          </Link>
        )}
      </div>
    </div>
  );
}
