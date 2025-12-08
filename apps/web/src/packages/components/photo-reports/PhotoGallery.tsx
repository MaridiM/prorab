'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { ReportPhoto } from '@/packages/api/graphql/__generated__/output'

interface PhotoGalleryProps {
	photos: ReportPhoto[]
	onPhotoClick: (index: number) => void
}

export function PhotoGallery({ photos, onPhotoClick }: PhotoGalleryProps) {
	if (!photos || photos.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">Нет фотографий в этом отчёте</p>
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{photos.map((photo, index) => (
				<motion.div
					key={photo.id}
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3, delay: index * 0.05 }}
					className="group relative aspect-square overflow-hidden rounded-2xl bg-secondary cursor-pointer"
					onClick={() => onPhotoClick(index)}
				>
					<Image
						src={photo.thumbnailUrl || photo.photoUrl}
						alt={photo.caption || `Фото ${index + 1}`}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-110"
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					/>

					{/* Overlay на hover */}
					<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300">
						<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
							<div className="text-white text-center p-4">
								{photo.caption && <p className="text-sm font-medium line-clamp-2">{photo.caption}</p>}
							</div>
						</div>
					</div>
				</motion.div>
			))}
		</div>
	)
}
