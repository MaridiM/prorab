'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/packages/utils'

interface ImageUploadProps {
	value?: File | string | null
	onChange: (file: File | null) => void
	maxSize?: number // in MB
	accept?: string
	className?: string
	previewClassName?: string
}

export function ImageUpload({
	value,
	onChange,
	maxSize = 5,
	accept = 'image/jpeg,image/png,image/webp',
	className,
	previewClassName,
}: ImageUploadProps) {
	const [isDragging, setIsDragging] = useState(false)
	const [preview, setPreview] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Generate preview URL
	const generatePreview = useCallback((file: File) => {
		const reader = new FileReader()
		reader.onloadend = () => {
			setPreview(reader.result as string)
		}
		reader.readAsDataURL(file)
	}, [])

	// Validate file
	const validateFile = useCallback(
		(file: File): string | null => {
			// Check file size
			if (file.size > maxSize * 1024 * 1024) {
				return `Размер файла не должен превышать ${maxSize}MB`
			}

			// Check file type
			const acceptedTypes = accept.split(',').map((type) => type.trim())
			const fileType = file.type
			if (!acceptedTypes.includes(fileType)) {
				return 'Неподдерживаемый формат файла. Используйте JPG, PNG или WEBP'
			}

			return null
		},
		[maxSize, accept]
	)

	// Handle file selection
	const handleFileSelect = useCallback(
		(file: File) => {
			const validationError = validateFile(file)
			if (validationError) {
				setError(validationError)
				return
			}

			setError(null)
			generatePreview(file)
			onChange(file)
		},
		[validateFile, generatePreview, onChange]
	)

	// Handle drag events
	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(true)
	}, [])

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(false)
	}, [])

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
	}, [])

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault()
			e.stopPropagation()
			setIsDragging(false)

			const files = Array.from(e.dataTransfer.files)
			if (files.length > 0) {
				handleFileSelect(files[0])
			}
		},
		[handleFileSelect]
	)

	// Handle file input change
	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files
			if (files && files.length > 0) {
				handleFileSelect(files[0])
			}
		},
		[handleFileSelect]
	)

	// Handle remove
	const handleRemove = useCallback(() => {
		setPreview(null)
		setError(null)
		onChange(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}, [onChange])

	// Handle click to upload
	const handleClick = useCallback(() => {
		fileInputRef.current?.click()
	}, [])

	// Get display preview (from value or preview state)
	const displayPreview = preview || (typeof value === 'string' ? value : null)

	return (
		<div className={cn('space-y-3', className)}>
			{/* Upload Area */}
			<div
				onClick={handleClick}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				className={cn(
					'relative overflow-hidden rounded-xl border-2 border-dashed transition-all cursor-pointer',
					{
						'border-primary bg-primary/5': isDragging,
						'border-border hover:border-primary/50 hover:bg-secondary/30':
							!isDragging,
					}
				)}
			>
				<input
					ref={fileInputRef}
					type="file"
					accept={accept}
					onChange={handleInputChange}
					className="hidden"
				/>

				<AnimatePresence mode="wait">
					{displayPreview ? (
						// Preview
						<motion.div
							key="preview"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							transition={{ duration: 0.2 }}
							className={cn(
								'relative aspect-video w-full overflow-hidden rounded-lg',
								previewClassName
							)}
						>
							<Image
								src={displayPreview}
								alt="Preview"
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, 50vw"
							/>

							{/* Remove button */}
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation()
									handleRemove()
								}}
								className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-all hover:bg-destructive hover:text-destructive-foreground active:scale-95"
							>
								<X className="h-4 w-4" />
							</button>
						</motion.div>
					) : (
						// Upload prompt
						<motion.div
							key="upload"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className="flex flex-col items-center justify-center py-12 px-6 text-center"
						>
							<motion.div
								className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
								animate={
									isDragging
										? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
										: {}
								}
								transition={{ duration: 0.3 }}
							>
								{isDragging ? (
									<Upload className="h-8 w-8" />
								) : (
									<ImageIcon className="h-8 w-8" />
								)}
							</motion.div>

							<p className="mb-1 text-sm font-medium text-foreground">
								{isDragging
									? 'Отпустите файл'
									: 'Перетащите изображение или нажмите'}
							</p>
							<p className="text-xs text-muted-foreground">
								JPG, PNG, WEBP до {maxSize}MB
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Error message */}
			<AnimatePresence>
				{error && (
					<motion.p
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="text-xs text-destructive"
					>
						{error}
					</motion.p>
				)}
			</AnimatePresence>
		</div>
	)
}
