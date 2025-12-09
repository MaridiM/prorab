'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReportPhoto } from '@/packages/api/graphql/__generated__/output'

interface LightboxProps {
	photos: ReportPhoto[]
	currentIndex: number
	isOpen: boolean
	onClose: () => void
	onNext: () => void
	onPrev: () => void
}

export function Lightbox({ photos, currentIndex, isOpen, onClose, onNext, onPrev }: LightboxProps) {
	const currentPhoto = photos[currentIndex]

	// Keyboard navigation
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
			if (e.key === 'ArrowLeft') onPrev()
			if (e.key === 'ArrowRight') onNext()
		},
		[onClose, onNext, onPrev]
	)

	useEffect(() => {
		if (!isOpen) return

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, handleKeyDown])

	// Prevent body scroll when open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'auto'
		}
		return () => {
			document.body.style.overflow = 'auto'
		}
	}, [isOpen])

	if (!currentPhoto) return null

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onClose();
					}}
				>
					{/* Close button */}
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onClose();
						}}
						className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
						aria-label="Закрыть"
					>
						<X className="w-6 h-6 text-white" />
					</button>

					{/* Navigation buttons */}
					{photos.length > 1 && (
						<>
							<button
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onPrev();
								}}
								className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
								aria-label="Предыдущее фото"
							>
								<ChevronLeft className="w-8 h-8 text-white" />
							</button>

							<button
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onNext();
								}}
								className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
								aria-label="Следующее фото"
							>
								<ChevronRight className="w-8 h-8 text-white" />
							</button>
						</>
					)}

					{/* Image */}
					<div
						className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
					>
						<motion.div
							key={currentIndex}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							transition={{ duration: 0.2 }}
							className="relative max-w-7xl max-h-[90vh] w-full h-full"
						>
							<Image
								src={currentPhoto.photoUrl}
								alt={currentPhoto.caption || `Фото ${currentIndex + 1}`}
								fill
								className="object-contain"
								sizes="100vw"
								priority
							/>
						</motion.div>
					</div>

					{/* Caption & Counter */}
					<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 pointer-events-none">
						<div className="max-w-7xl mx-auto">
							<p className="text-white text-center text-sm mb-2">
								{currentIndex + 1} / {photos.length}
							</p>
							{currentPhoto.caption && (
								<p className="text-white text-center text-lg font-medium">{currentPhoto.caption}</p>
							)}
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
