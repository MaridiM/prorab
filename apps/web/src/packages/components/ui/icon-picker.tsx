'use client'

import { cn } from '@/packages/utils'
import { motion } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { Upload } from 'lucide-react'

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
	selectedColor = 'orange',
	uploadedLogo,
	onIconSelect,
	onColorSelect,
	onLogoUpload,
	className,
}: IconPickerProps) {
	const currentColor =
		BACKGROUND_COLORS.find((c) => c.id === selectedColor)?.color ||
		BACKGROUND_COLORS[0].color

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

	// Generate preview URL for uploaded logo
	const previewUrl = uploadedLogo
		? typeof uploadedLogo === 'string'
			? uploadedLogo
			: URL.createObjectURL(uploadedLogo)
		: null

	return (
		<div className={cn('space-y-6', className)}>
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
						onLogoUpload && "cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all"
					)}
					style={{
						backgroundColor: currentColor,
					}}
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ type: 'spring', stiffness: 200, damping: 15 }}
					key={`${selectedIcon}-${selectedColor}-${previewUrl}`}
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

					{/* Upload overlay on hover */}
					{onLogoUpload && !previewUrl && (
						<div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
							<Upload className="w-8 h-8 text-white" />
						</div>
					)}
				</motion.div>
			</div>

			{/* Icon Grid */}
			<div>
				<h3 className="mb-3 text-sm font-medium text-foreground">
					Выберите иконку
				</h3>
				<div className="grid grid-cols-5 gap-2">
					{TEAM_ICONS.map((icon, index) => (
						<motion.button
							key={icon.id}
							type="button"
							onClick={() => onIconSelect(icon.id)}
							className={cn(
								'flex h-12 w-12 items-center justify-center rounded-lg border-2 text-2xl transition-all hover:scale-105 active:scale-95',
								{
									'border-primary bg-primary/10': selectedIcon === icon.id,
									'border-border bg-background hover:border-primary/50':
										selectedIcon !== icon.id,
								}
							)}
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: index * 0.03 }}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							aria-label={icon.label}
						>
							{icon.emoji}
						</motion.button>
					))}
				</div>
			</div>

			{/* Color Grid */}
			<div>
				<h3 className="mb-3 text-sm font-medium text-foreground">
					Выберите цвет
				</h3>
				<div className="grid grid-cols-9 gap-3">
					{BACKGROUND_COLORS.map((color, index) => (
						<motion.button
							key={color.id}
							type="button"
							onClick={() => onColorSelect(color.id)}
							className={cn(
								'h-10 w-10 rounded-full border-2 transition-all hover:scale-110 active:scale-95',
								{
									'border-foreground ring-2 ring-primary ring-offset-2 ring-offset-background':
										selectedColor === color.id,
									'border-border': selectedColor !== color.id,
								}
							)}
							style={{
								backgroundColor: color.color,
							}}
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: index * 0.04 }}
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
							aria-label={color.label}
						/>
					))}
				</div>
			</div>
		</div>
	)
}

export { TEAM_ICONS, BACKGROUND_COLORS }
