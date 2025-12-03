'use client'

import { cn } from '@/packages/utils'
import { motion } from 'framer-motion'

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

// Предустановленные цвета фона
const BACKGROUND_COLORS = [
	{ id: 'orange', color: 'hsl(var(--accent))', label: 'Оранжевый' },
	{ id: 'blue', color: 'hsl(217, 91%, 60%)', label: 'Синий' },
	{ id: 'green', color: 'hsl(142, 71%, 45%)', label: 'Зелёный' },
	{ id: 'red', color: 'hsl(0, 72%, 51%)', label: 'Красный' },
	{ id: 'purple', color: 'hsl(271, 81%, 56%)', label: 'Фиолетовый' },
	{ id: 'yellow', color: 'hsl(48, 96%, 53%)', label: 'Жёлтый' },
	{ id: 'pink', color: 'hsl(330, 81%, 60%)', label: 'Розовый' },
	{ id: 'teal', color: 'hsl(173, 80%, 40%)', label: 'Бирюзовый' },
	{ id: 'transparent', color: 'transparent', label: 'Прозрачный' },
]

interface IconPickerProps {
	selectedIcon?: string
	selectedColor?: string
	onIconSelect: (iconId: string) => void
	onColorSelect: (colorId: string) => void
	className?: string
}

export function IconPicker({
	selectedIcon = 'hammer',
	selectedColor = 'orange',
	onIconSelect,
	onColorSelect,
	className,
}: IconPickerProps) {
	const currentColor =
		BACKGROUND_COLORS.find((c) => c.id === selectedColor)?.color ||
		BACKGROUND_COLORS[0].color

	return (
		<div className={cn('space-y-6', className)}>
			{/* Preview */}
			<div className="flex justify-center">
				<motion.div
					className={cn(
						"flex h-24 w-24 items-center justify-center rounded-2xl text-5xl shadow-lg",
						selectedColor === 'transparent' && "bg-background"
					)}
					style={{ 
						backgroundColor: selectedColor === 'transparent' ? 'transparent' : currentColor,
						backgroundImage: selectedColor === 'transparent' 
							? 'linear-gradient(45deg, hsl(var(--border)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--border)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--border)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--border)) 75%)'
							: undefined,
						backgroundSize: selectedColor === 'transparent' ? '12px 12px' : undefined,
						backgroundPosition: selectedColor === 'transparent' ? '0 0, 0 6px, 6px -6px, -6px 0px' : undefined,
					}}
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ type: 'spring', stiffness: 200, damping: 15 }}
					key={`${selectedIcon}-${selectedColor}`}
				>
					{TEAM_ICONS.find((i) => i.id === selectedIcon)?.emoji || '🔨'}
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
				<div className="grid grid-cols-9 gap-2">
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
									'bg-background': color.id === 'transparent',
								}
							)}
							style={{ 
								backgroundColor: color.id === 'transparent' ? 'transparent' : color.color,
								backgroundImage: color.id === 'transparent' 
									? 'linear-gradient(45deg, hsl(var(--border)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--border)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--border)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--border)) 75%)'
									: undefined,
								backgroundSize: color.id === 'transparent' ? '8px 8px' : undefined,
								backgroundPosition: color.id === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined,
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
