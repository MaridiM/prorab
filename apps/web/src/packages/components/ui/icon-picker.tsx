'use client'

import { cn } from '@/packages/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImageIcon, X } from 'lucide-react'
import { Button } from './button'

// Предустановленные иконки-эмодзи для команд (10 иконок)
const TEAM_ICONS = [
	{ id: 'hammer', emoji: '🔨', label: 'Молоток' },
	{ id: 'wrench', emoji: '🔧', label: 'Гаечный ключ' },
	{ id: 'construction', emoji: '🏗️', label: 'Стройка' },
	{ id: 'hardhat', emoji: '👷', label: 'Строитель' },
	{ id: 'brick', emoji: '🧱', label: 'Кирпич' },
	{ id: 'tools', emoji: '🛠️', label: 'Инструменты' },
	{ id: 'house', emoji: '🏠', label: 'Дом' },
	{ id: 'building', emoji: '🏢', label: 'Здание' },
	{ id: 'construction_zone', emoji: '🚧', label: 'Дорожные работы' },
	{ id: 'bolt', emoji: '🔩', label: 'Болт' },
]

// Предустановленные цвета фона (пастельные, легкие и светлые) - 8 цветов
const BACKGROUND_COLORS = [
	{ id: 'orange', color: 'hsl(25, 40%, 90%)', label: 'Оранжевый' },
	{ id: 'blue', color: 'hsl(217, 35%, 88%)', label: 'Синий' },
	{ id: 'green', color: 'hsl(142, 30%, 87%)', label: 'Зелёный' },
	{ id: 'red', color: 'hsl(0, 35%, 88%)', label: 'Красный' },
	{ id: 'purple', color: 'hsl(271, 35%, 89%)', label: 'Фиолетовый' },
	{ id: 'yellow', color: 'hsl(48, 45%, 92%)', label: 'Жёлтый' },
	{ id: 'pink', color: 'hsl(330, 35%, 90%)', label: 'Розовый' },
	{ id: 'white', color: 'hsl(0, 0%, 98%)', label: 'Белый' },
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
		<div className={cn('space-y-3', className)}>
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
			<div className="flex flex-col items-center gap-2">
				<motion.div
					onClick={handlePreviewClick}
					className={cn(
						"relative flex h-20 w-20 items-center justify-center rounded-xl text-4xl overflow-hidden cursor-pointer border-2 transition-all duration-200",
						showIconPicker
							? "border-primary/50 ring-2 ring-primary/20 shadow-lg shadow-primary/10"
							: "border-border/50 hover:border-primary/30 shadow-md hover:shadow-lg"
					)}
					style={{
						backgroundColor: previewUrl ? 'hsl(0, 0%, 100%)' : currentColor,
					}}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					{previewUrl ? (
						<Image
							src={previewUrl}
							alt="Uploaded logo"
							fill
							className="object-contain p-1"
							sizes="80px"
						/>
					) : (
						TEAM_ICONS.find((i) => i.id === selectedIcon)?.emoji || '🔨'
					)}
				</motion.div>

				<p className="text-xs font-medium text-muted-foreground">
					{previewUrl ? 'Нажмите, чтобы изменить' : 'Нажмите, чтобы выбрать'}
				</p>
			</div>

			{/* Icon Picker Modal - Ultra Compact */}
			<AnimatePresence>
				{showIconPicker && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
						className="space-y-3 p-4 bg-secondary/30 backdrop-blur-xl rounded-xl border border-border/50"
					>
						{/* Icons and Colors Section */}
						{!previewUrl && (
							<div className="space-y-3">
								{/* Icons Section */}
								<div className="space-y-2">
									<h3 className="text-xs font-medium text-muted-foreground ml-0.5">
										Выберите иконку
									</h3>
									<div className="grid grid-cols-5 gap-1.5">
										{TEAM_ICONS.map((icon) => (
											<motion.button
												key={icon.id}
												type="button"
												onClick={() => handleIconSelect(icon.id)}
												className={cn(
													'flex h-11 items-center justify-center rounded-lg text-xl transition-all duration-200 border-2',
													selectedIcon === icon.id
														? 'bg-primary/10 border-primary/50 shadow-sm'
														: 'bg-background border-border/50 hover:border-primary/30 hover:bg-secondary/50'
												)}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												aria-label={icon.label}
											>
												{icon.emoji}
											</motion.button>
										))}
									</div>
								</div>

								{/* Colors Section */}
								{selectedIcon && (
									<div className="space-y-2">
										<h3 className="text-xs font-medium text-muted-foreground ml-0.5">
											Выберите цвет
										</h3>
										<div className="flex gap-1.5 justify-center flex-wrap">
											{BACKGROUND_COLORS.map((color) => (
												<motion.button
													key={color.id}
													type="button"
													onClick={() => onColorSelect(color.id)}
													className={cn(
														'h-9 w-9 rounded-full border-2 transition-all duration-200',
														selectedColor === color.id
															? 'border-primary/50 ring-2 ring-primary/20 ring-offset-1 ring-offset-background shadow-md'
															: 'border-border/50 hover:border-primary/30 hover:scale-110'
													)}
													style={{
														backgroundColor: color.color,
													}}
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.95 }}
													aria-label={color.label}
												/>
											))}
										</div>
									</div>
								)}
							</div>
						)}

						{/* Divider */}
						<div className="h-px bg-border/50" />

						{/* Actions - Compact */}
						<div className="space-y-1.5">
							{/* Upload Button */}
							{onLogoUpload && (
								<Button
									type="button"
									variant="outline"
									onClick={handleUploadClick}
									className="w-full h-9 text-xs rounded-lg bg-background border-2 border-border/50 hover:border-primary/50 transition-all"
								>
									<ImageIcon className="h-3.5 w-3.5 mr-1.5" />
									Загрузить изображение
								</Button>
							)}

							{/* Remove Button (if logo uploaded) */}
							{previewUrl && onLogoUpload && (
								<Button
									type="button"
									variant="ghost"
									onClick={handleRemoveLogo}
									className="w-full h-9 text-xs rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
								>
									<X className="h-3.5 w-3.5 mr-1.5" />
									Удалить логотип
								</Button>
							)}

							{/* Close Button */}
							<Button
								type="button"
								variant="ghost"
								onClick={() => setShowIconPicker(false)}
								className="w-full h-8 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
							>
								Готово
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export { TEAM_ICONS, BACKGROUND_COLORS }
