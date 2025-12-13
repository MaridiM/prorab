'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import { PhotoGallery } from '@/packages/components/photo-reports/PhotoGallery'
import { Lightbox } from '@/packages/components/photo-reports/Lightbox'
import type { PublicPhotoReport } from '@/packages/api/graphql/__generated__/output'

interface PublicReportViewProps {
	report: PublicPhotoReport
}

export function PublicReportView({ report }: PublicReportViewProps) {
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

	const handleNext = () => {
		if (lightboxIndex === null) return
		setLightboxIndex((lightboxIndex + 1) % report.photos.length)
	}

	const handlePrev = () => {
		if (lightboxIndex === null) return
		setLightboxIndex((lightboxIndex - 1 + report.photos.length) % report.photos.length)
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<motion.header
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="border-b border-border/30 bg-card/80 backdrop-blur-xl"
			>
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-4xl mx-auto">
						<h1 className="text-4xl font-bold mb-4">{report.title}</h1>

						<div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
							<div className="flex items-center gap-2">
								<MapPin className="w-4 h-4" />
								<span>{report.project.name}</span>
							</div>

							{report.project.address && (
								<div className="flex items-center gap-2">
									<span>•</span>
									<span>{report.project.address}</span>
								</div>
							)}

							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4" />
								<span>{format(new Date(report.createdAt), 'd MMMM yyyy', { locale: ru })}</span>
							</div>

							<div className="flex items-center gap-2">
								<Eye className="w-4 h-4" />
								<span>{report.viewCount} просмотров</span>
							</div>
						</div>

						{report.description && (
							<p className="text-lg text-muted-foreground">{report.description}</p>
						)}
					</div>
				</div>
			</motion.header>

			{/* Gallery */}
			<main className="container mx-auto px-4 py-12">
				<div className="max-w-7xl mx-auto">
					<PhotoGallery photos={report.photos} onPhotoClick={setLightboxIndex} />
				</div>
			</main>

			{/* Lightbox */}
			<Lightbox
				photos={report.photos}
				currentIndex={lightboxIndex ?? 0}
				isOpen={lightboxIndex !== null}
				onClose={() => setLightboxIndex(null)}
				onNext={handleNext}
				onPrev={handlePrev}
			/>

			{/* Footer */}
			<footer className="border-t border-border/30 bg-card mt-20">
				<div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
					<p>Создано с помощью ProRab.space</p>
				</div>
			</footer>
		</div>
	)
}
