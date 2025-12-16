'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Crown, Users } from 'lucide-react'
import { cn } from '@/packages/utils'

interface Team {
	id: string
	name: string
	logoUrl?: string | null
	iconId?: string | null
	colorId?: string | null
	ownerId: string
}

interface TeamSwitcherProps {
	teams: Team[]
	currentTeamId: string
	userId: string
	onTeamChange: (teamId: string) => void
	className?: string
}

// Цвета для иконок (должны совпадать с IconPicker)
const COLORS: Record<string, string> = {
	orange: 'hsl(25, 40%, 90%)',
	blue: 'hsl(217, 35%, 88%)',
	green: 'hsl(142, 30%, 87%)',
	red: 'hsl(0, 35%, 88%)',
	purple: 'hsl(271, 35%, 89%)',
	yellow: 'hsl(48, 45%, 92%)',
	pink: 'hsl(330, 35%, 90%)',
	white: 'hsl(0, 0%, 98%)',
}

// Эмодзи для иконок
const ICONS: Record<string, string> = {
	hammer: '🔨',
	wrench: '🔧',
	construction: '🏗️',
	hardhat: '👷',
	brick: '🧱',
	tools: '🛠️',
	house: '🏠',
	building: '🏢',
	construction_zone: '🚧',
	bolt: '🔩',
}

export function TeamSwitcher({
	teams,
	currentTeamId,
	userId,
	onTeamChange,
	className,
}: TeamSwitcherProps) {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const currentTeam = teams.find(t => t.id === currentTeamId)
	const isOwner = currentTeam?.ownerId === userId

	// Закрытие при клике вне
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const renderTeamLogo = (team: Team, size: 'sm' | 'md' = 'sm') => {
		const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
		const textSize = size === 'sm' ? 'text-base' : 'text-lg'

		if (team.logoUrl) {
			return (
				<div className={cn(sizeClasses, 'rounded-xl overflow-hidden')}>
					<img
						src={team.logoUrl}
						alt={team.name}
						className="w-full h-full object-cover"
					/>
				</div>
			)
		}

		const bgColor = team.colorId ? COLORS[team.colorId] : COLORS.blue
		const emoji = team.iconId ? ICONS[team.iconId] : '🏗️'

		return (
			<div
				className={cn(sizeClasses, 'rounded-xl flex items-center justify-center')}
				style={{ backgroundColor: bgColor }}
			>
				<span className={textSize}>{emoji}</span>
			</div>
		)
	}

	// Если только одна команда - не показываем switcher
	if (teams.length <= 1) {
		return (
			<div className={cn('flex items-center gap-3', className)}>
				{currentTeam && renderTeamLogo(currentTeam, 'md')}
				<div>
					<div className="flex items-center gap-2">
						<span className="font-semibold text-lg">{currentTeam?.name}</span>
						{isOwner && (
							<Crown className="w-4 h-4 text-amber-500" />
						)}
					</div>
					<span className="text-xs text-muted-foreground">
						{isOwner ? 'Владелец' : 'Участник'}
					</span>
				</div>
			</div>
		)
	}

	return (
		<div ref={dropdownRef} className={cn('relative', className)}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-200 group"
			>
				{currentTeam && renderTeamLogo(currentTeam, 'md')}
				<div className="text-left">
					<div className="flex items-center gap-2">
						<span className="font-semibold">{currentTeam?.name}</span>
						{isOwner && (
							<Crown className="w-4 h-4 text-amber-500" />
						)}
					</div>
					<span className="text-xs text-muted-foreground">
						{isOwner ? 'Владелец' : 'Участник'}
					</span>
				</div>
				<ChevronDown
					className={cn(
						'w-5 h-5 text-muted-foreground transition-transform duration-200',
						isOpen && 'rotate-180'
					)}
				/>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.15 }}
						className="absolute top-full left-0 mt-2 w-72 bg-card border border-border/50 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden z-50"
					>
						<div className="p-2">
							<div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Ваши бригады
							</div>
							{teams.map(team => {
								const isTeamOwner = team.ownerId === userId
								const isSelected = team.id === currentTeamId

								return (
									<button
										key={team.id}
										onClick={() => {
											onTeamChange(team.id)
											setIsOpen(false)
										}}
										className={cn(
											'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
											isSelected
												? 'bg-primary/10 text-primary'
												: 'hover:bg-secondary/50'
										)}
									>
										{renderTeamLogo(team)}
										<div className="flex-1 text-left">
											<div className="flex items-center gap-2">
												<span className="font-medium">{team.name}</span>
												{isTeamOwner && (
													<Crown className="w-3.5 h-3.5 text-amber-500" />
												)}
											</div>
											<span className="text-xs text-muted-foreground">
												{isTeamOwner ? 'Владелец' : 'Участник'}
											</span>
										</div>
										{isSelected && (
											<Check className="w-5 h-5 text-primary" />
										)}
									</button>
								)
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}













