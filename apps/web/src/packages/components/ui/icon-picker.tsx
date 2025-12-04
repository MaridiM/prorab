'use client'

import { cn } from '@/packages/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, ImageIcon } from 'lucide-react'
import { Button } from './button'

// Предустановленные иконки-эмодзи для команд
const TEAM_ICONS = [
	{ id: 'hammer', emoji: '🔨', label: 'Молоток' },
	{ id: 'wrench', emoji: '🔧', label: 'Гаечный ключ' },
	{ id: 'construction', emoji: '🏗️', label: 'Стройка' },
	{ id: 'hardhat', emoji: '👷', label: 'Строитель' },
	{ id: 'brick', emoji: '🧱', label: 'Кирпич' },
	{ id: 'tools', emoji: '🛠️', label: 'Инструменты' },
	{ id: 'house', emoji: '🏠', label: 'Дом' },
	{ id: 'building', emoji: '🏢', label: 'Здание' },
	{ id: 'crane', emoji: '🏗️', label: 'Кран' },
	{ id: 'truck', emoji: '🚚', label: 'Грузовик' },
]

// Предустановленные цвета фона (пастельные, легкие и светлые)
const BACKGROUND_COLORS = [
	{ id: 'orange', color: 'hsl(25, 40%, 90%)', label: 'Оранжевый' },
	{ id: 'blue', color: 'hsl(217, 35%, 88%)', label: 'Синий' },
	{ id: 'green', color: 'hsl(142, 30%, 87%)', label: 'Зелёный' },
	{ id: 'red', color: 'hsl(0, 35%, 88%)', label: 'Красный' },
	{ id: 'purple', color: 'hsl(271, 35%, 89%)', label: 'Фиолетовый' },
	{ id: 'yellow', color: 'hsl(48, 45%, 92%)', label: 'Жёлтый' },
	{ id: 'pink', color: 'hsl(330, 35%, 90%)', label: 'Розовый' },
	{ id: 'teal', color: 'hsl(173, 30%, 86%)', label: 'Бирюзовый' },
	{ id: 'white', color: 'hsl(0, 0%, 100%)', label: 'Белый' },
]

interface IconPickerProps {
	selectedIcon?: string
	selectedColor?: string
	uploadedLogo?: File | string | null
	onIconSelect: (iconId: string) => void
	onColorSelect: (colorId: string) => void
	onLogoUpload?: (file: File | null) => void
	className?: string
}

export function IconPicker({
	selectedIcon = 'hammer',
	selectedColor = 'white',
	uploadedLogo,
	onIconSelect,
	onColorSelect,
	onLogoUpload,
	className,
}: IconPickerProps) {
	const currentColor =
		BACKGROUND_COLORS.find((c) => c.id === selectedColor)?.color ||
		BACKGROUND_COLORS[BACKGROUND_COLORS.length - 1].color // Default to white (last in array)

	const fileInputRef = useRef<HTMLInputElement>(null)
	const [showIconPicker, setShowIconPicker] = useState(false)

	const handlePreviewClick = () => {
		if (previewUrl) {
			// If logo is uploaded, allow changing it
			setShowIconPicker(true)
		} else {
			// If no logo, toggle icon picker
			setShowIconPicker(!showIconPicker)
		}
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file && onLogoUpload) {
			onLogoUpload(file)
			setShowIconPicker(false)
		}
	}

	const handleRemoveLogo = () => {
		if (onLogoUpload) {
			onLogoUpload(null)
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
		// Set random icon and color after removing logo
		const randomIcon = TEAM_ICONS[Math.floor(Math.random() * TEAM_ICONS.length)]
		const randomColor = BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)]
		onIconSelect(randomIcon.id)
		onColorSelect(randomColor.id)
		// Keep picker open to show icon selection
	}

	const handleIconSelect = (iconId: string) => {
		onIconSelect(iconId)
		// Don't close picker - let user also select color
	}

	const handleUploadClick = () => {
		fileInputRef.current?.click()
	}

	// Generate preview URL for uploaded logo
	const previewUrl = uploadedLogo
		? typeof uploadedLogo === 'string'
			? uploadedLogo
			: URL.createObjectURL(uploadedLogo)
		: null

	return (
		<div className={cn('space-y-4', className)}>
			{/* Hidden file input */}
			{onLogoUpload && (
				<input
					ref={fileInputRef}
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onChange={handleFileChange}
					className="hidden"
				/>
			)}

			{/* Preview with click to open picker */}
			<div className="flex flex-col items-center gap-3">
				<motion.div
					onClick={handlePreviewClick}
					className={cn(
						"relative flex h-24 w-24 items-center justify-center rounded-2xl text-5xl shadow-lg shadow-black/5 dark:shadow-black/20 overflow-hidden cursor-pointer border-2 transition-all duration-200",
						showIconPicker 
							? "border-primary ring-2 ring-primary/50 ring-offset-2 ring-offset-background shadow-xl shadow-primary/20" 
							: "border-border/30 hover:border-primary/50 hover:shadow-xl"
					)}
					style={{
						backgroundColor: previewUrl ? 'hsl(0, 0%, 100%)' : currentColor,
					}}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.98 }}
				>
					{previewUrl ? (
						<Image
							src={previewUrl}
							alt="Uploaded logo"
							fill
							className="object-cover"
							sizes="96px"
						/>
					) : (
						TEAM_ICONS.find((i) => i.id === selectedIcon)?.emoji || '🔨'
					)}
				</motion.div>

				<p className="text-xs font-medium text-muted-foreground">
					{previewUrl ? 'Нажмите, чтобы изменить' : 'Нажмите, чтобы выбрать'}
				</p>
			</div>

			{/* Icon Picker Modal - All options in one place */}
			<AnimatePresence>
				{showIconPicker && (
					<motion.div
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
						className="space-y-4 p-5 bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl shadow-black/5 dark:shadow-black/20"
					>
						{/* Icon Grid - Only show if no logo uploaded */}
						{!previewUrl && (
							<div className="space-y-3">
								<h3 className="text-sm font-semibold text-foreground">
									Выберите иконку
								</h3>
								<div className="grid grid-cols-5 gap-2">
									{TEAM_ICONS.map((icon, index) => (
										<motion.button
											key={icon.id}
											type="button"
											onClick={() => handleIconSelect(icon.id)}
											className={cn(
												'flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all duration-200 border-2',
												selectedIcon === icon.id
													? 'bg-primary/10 border-primary shadow-md shadow-primary/20 scale-105'
													: 'bg-background border-border/50 hover:border-primary/30 hover:bg-secondary/30 hover:scale-105'
											)}
											initial={{ scale: 0, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											transition={{ delay: index * 0.02, duration: 0.15 }}
											whileHover={{ scale: 1.08, y: -2 }}
											whileTap={{ scale: 0.95 }}
											aria-label={icon.label}
										>
											{icon.emoji}
										</motion.button>
									))}
								</div>
							</div>
						)}

						{/* Color Selection - Show when icon is selected and no logo uploaded */}
						{!previewUrl && selectedIcon && (
							<div className="space-y-3">
								<h3 className="text-sm font-semibold text-foreground">
									Выберите цвет
								</h3>
								<div className="flex gap-2.5 justify-center flex-wrap">
									{BACKGROUND_COLORS.map((color, index) => (
										<motion.button
											key={color.id}
											type="button"
											onClick={() => onColorSelect(color.id)}
											className={cn(
												'h-10 w-10 rounded-full border-2 transition-all duration-200',
												selectedColor === color.id
													? 'border-foreground shadow-lg shadow-primary/20 scale-110'
													: 'border-border/50 hover:border-primary/30 hover:scale-105'
											)}
											style={{
												backgroundColor: color.color,
												boxShadow: selectedColor === color.id
													? '0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--primary)), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
													: undefined,
											}}
											initial={{ scale: 0, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											transition={{ delay: index * 0.03, duration: 0.15 }}
											whileHover={{ scale: 1.1, y: -2 }}
											whileTap={{ scale: 0.95 }}
											aria-label={color.label}
										/>
									))}
								</div>
							</div>
						)}

						{/* Divider */}
						<div className="h-px bg-border/50" />

						{/* Upload Button */}
						{onLogoUpload && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleUploadClick}
								className="w-full h-10 text-sm gap-2 border-2 border-border/50 hover:border-primary/50 transition-all"
							>
								<ImageIcon className="h-4 w-4" />
								Загрузить изображение
							</Button>
						)}

						{/* Remove Button (if logo uploaded) */}
						{previewUrl && onLogoUpload && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleRemoveLogo}
								className="w-full h-10 text-sm gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
							>
								<X className="h-4 w-4" />
								Удалить логотип
							</Button>
						)}

						{/* Close Button */}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setShowIconPicker(false)}
							className="w-full h-9 text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
						>
							Готово
						</Button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export { TEAM_ICONS, BACKGROUND_COLORS }
