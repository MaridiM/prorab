'use client'

import Image from 'next/image'
import { cn } from  '@/packages/utils'
import { TEAM_ICONS, BACKGROUND_COLORS } from './icon-picker'

interface TeamLogoProps {
	name: string
	logo?: string | null
	iconId?: string | null
	size?: 'sm' | 'md' | 'lg' | 'xl'
	className?: string
}

const sizeMap = {
	sm: {
		container: 'h-8 w-8 text-sm',
		emoji: 'text-lg',
		initials: 'text-xs',
	},
	md: {
		container: 'h-12 w-12 text-base',
		emoji: 'text-2xl',
		initials: 'text-sm',
	},
	lg: {
		container: 'h-16 w-16 text-lg',
		emoji: 'text-3xl',
		initials: 'text-base',
	},
	xl: {
		container: 'h-24 w-24 text-2xl',
		emoji: 'text-5xl',
		initials: 'text-xl',
	},
}

export function TeamLogo({
	name,
	logo,
	iconId,
	size = 'md',
	className,
}: TeamLogoProps) {
	const sizes = sizeMap[size]

	// Если есть загруженное изображение
	if (logo) {
		return (
			<div
				className={cn(
					'relative overflow-hidden rounded-xl',
					sizes.container,
					className
				)}
			>
				<Image
					src={logo}
					alt={name}
					fill
					className="object-cover"
					sizes={`(max-width: 768px) ${sizes.container}, ${sizes.container}`}
				/>
			</div>
		)
	}

	// Если выбрана иконка-эмодзи
	if (iconId) {
		const icon = TEAM_ICONS.find((i) => i.id === iconId)
		// Используем первый цвет как дефолтный
		const bgColor = BACKGROUND_COLORS[0].color

		return (
			<div
				className={cn(
					'flex items-center justify-center rounded-xl',
					sizes.container,
					sizes.emoji,
					className
				)}
				style={{ backgroundColor: bgColor }}
			>
				{icon?.emoji || '🔨'}
			</div>
		)
	}

	// Fallback: инициалы из названия команды
	const getInitials = (teamName: string) => {
		const words = teamName.trim().split(/\s+/)
		if (words.length >= 2) {
			return (words[0][0] + words[1][0]).toUpperCase()
		}
		return teamName.substring(0, 2).toUpperCase()
	}

	const initials = getInitials(name)
	const bgColor = BACKGROUND_COLORS[0].color

	return (
		<div
			className={cn(
				'flex items-center justify-center rounded-xl font-semibold text-white',
				sizes.container,
				sizes.initials,
				className
			)}
			style={{ backgroundColor: bgColor }}
		>
			{initials}
		</div>
	)
}
