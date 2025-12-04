'use client'

import { cn } from '@/packages/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'

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

// Предустановленные цвета фона (пастельные)
const BACKGROUND_COLORS = [
	{ id: 'orange', color: 'hsl(25, 85%, 75%)', label: 'Оранжевый' },
	{ id: 'blue', color: 'hsl(217, 70%, 80%)', label: 'Синий' },
	{ id: 'green', color: 'hsl(142, 60%, 75%)', label: 'Зелёный' },
	{ id: 'red', color: 'hsl(0, 65%, 75%)', label: 'Красный' },
	{ id: 'purple', color: 'hsl(271, 65%, 80%)', label: 'Фиолетовый' },
	{ id: 'yellow', color: 'hsl(48, 85%, 80%)', label: 'Жёлтый' },
	{ id: 'pink', color: 'hsl(330, 70%, 82%)', label: 'Розовый' },
	{ id: 'teal', color: 'hsl(173, 60%, 75%)', label: 'Бирюзовый' },
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

	const handlePreviewClick = () => {
		if (onLogoUpload) {
			fileInputRef.current?.click()
		}
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file && onLogoUpload) {
			onLogoUpload(file)
		}
	}

	const handleRemoveLogo = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (onLogoUpload) {
			onLogoUpload(null)
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	// Generate preview URL for uploaded logo
	const previewUrl = uploadedLogo
		? typeof uploadedLogo === 'string'
			? uploadedLogo
			: URL.createObjectURL(uploadedLogo)
		: null

	return (
		<div className={cn('space-y-5', className)}>
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

			{/* Preview */}
			<div className="flex justify-center">
				<motion.div
					onClick={handlePreviewClick}
					className={cn(
						"relative flex h-24 w-24 items-center justify-center rounded-2xl text-5xl shadow-lg overflow-hidden",
						onLogoUpload && !previewUrl && "cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all"
					)}
					style={{
						backgroundColor: previewUrl ? 'hsl(0, 0%, 100%)' : currentColor, // White background for uploaded logo
					}}
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ type: 'spring', stiffness: 200, damping: 15 }}
					key={`${selectedIcon}-${selectedColor}-${previewUrl}`}
				>
					{previewUrl ? (
						<>
							<Image
								src={previewUrl}
								alt="Uploaded logo"
								fill
								className="object-cover"
								sizes="96px"
							/>
							{/* Remove button */}
							{onLogoUpload && (
								<button
									type="button"
									onClick={handleRemoveLogo}
									className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur-sm shadow-md transition-all hover:bg-destructive hover:text-destructive-foreground active:scale-95 z-10"
									aria-label="Удалить логотип"
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</>
					) : (
						TEAM_ICONS.find((i) => i.id === selectedIcon)?.emoji || '🔨'
					)}

					{/* Upload overlay on hover */}
					{onLogoUpload && !previewUrl && (
						<div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
							<Upload className="w-8 h-8 text-white" />
						</div>
					)}
				</motion.div>
			</div>

			{/* Icon Grid - Hidden when logo is uploaded */}
			<AnimatePresence>
				{!previewUrl && (
					<motion.div
						key="icon-grid"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="space-y-3"
					>
						<h3 className="text-sm font-semibold text-foreground">
							Выберите иконку
						</h3>
						<div className="grid grid-cols-5 gap-2">
							{TEAM_ICONS.map((icon, index) => (
								<motion.button
									key={icon.id}
									type="button"
									onClick={() => onIconSelect(icon.id)}
									className={cn(
										'relative flex h-12 w-12 items-center justify-center rounded-xl border-2 text-2xl transition-all duration-200',
										{
											'border-primary bg-primary/10 shadow-md shadow-primary/20': selectedIcon === icon.id,
											'border-border/50 bg-background hover:border-primary/30 hover:bg-secondary/50':
												selectedIcon !== icon.id,
										}
									)}
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ delay: index * 0.02, duration: 0.2 }}
									whileHover={{ scale: 1.05, y: -2 }}
									whileTap={{ scale: 0.95 }}
									aria-label={icon.label}
								>
									{icon.emoji}
									{selectedIcon === icon.id && (
										<motion.div
											className="absolute -inset-0.5 rounded-xl border-2 border-primary/50"
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ duration: 0.2 }}
										/>
									)}
								</motion.button>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Color Grid - Hidden when logo is uploaded */}
			<AnimatePresence>
				{!previewUrl && (
					<motion.div
						key="color-grid"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="space-y-3"
					>
						<h3 className="text-sm font-semibold text-foreground">
							Выберите цвет
						</h3>
						<div className="grid grid-cols-9 gap-4">
							{BACKGROUND_COLORS.map((color, index) => (
								<motion.button
									key={color.id}
									type="button"
									onClick={() => onColorSelect(color.id)}
									className={cn(
										'h-10 w-10 rounded-full border-2 transition-all duration-200 relative',
										{
											'border-foreground shadow-md': selectedColor === color.id,
											'border-border/50 hover:border-primary/30': selectedColor !== color.id,
										}
									)}
									style={{
										backgroundColor: color.color,
										boxShadow: selectedColor === color.id 
											? '0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--primary)), 0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
											: undefined,
									}}
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ delay: index * 0.03, duration: 0.2 }}
									whileHover={{ scale: 1.1, y: -2 }}
									whileTap={{ scale: 0.95 }}
									aria-label={color.label}
								/>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export { TEAM_ICONS, BACKGROUND_COLORS }
