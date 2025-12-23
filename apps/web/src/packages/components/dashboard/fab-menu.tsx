'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	Plus,
	X,
	FolderKanban,
	Wallet,
	Camera,
} from 'lucide-react'
import { cn } from '@/packages/utils'

interface FabAction {
	id: string
	icon: typeof Plus
	label: string
	gradient: string
	onClick: () => void
	disabled?: boolean
}

interface FabMenuProps {
	onCreateProject: () => void
	onCreateExpense: () => void
	onCreateReport: () => void
	hasActiveProject?: boolean
	className?: string
}

export function FabMenu({
	onCreateProject,
	onCreateExpense,
	onCreateReport,
	hasActiveProject = false,
	className,
}: FabMenuProps) {
	const [isOpen, setIsOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)

	// Закрытие при клике вне
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [isOpen])

	const actions: FabAction[] = [
		{
			id: 'project',
			icon: FolderKanban,
			label: 'Новый объект',
			gradient: 'from-blue-500 to-indigo-500',
			onClick: () => {
				onCreateProject()
				setIsOpen(false)
			},
		},
		{
			id: 'expense',
			icon: Wallet,
			label: 'Добавить расход',
			gradient: 'from-amber-500 to-orange-500',
			onClick: () => {
				onCreateExpense()
				setIsOpen(false)
			},
			disabled: !hasActiveProject,
		},
		{
			id: 'report',
			icon: Camera,
			label: 'Фотоотчёт',
			gradient: 'from-violet-500 to-purple-500',
			onClick: () => {
				onCreateReport()
				setIsOpen(false)
			},
			disabled: !hasActiveProject,
		},
	]

	return (
		<div ref={menuRef} className={cn('fixed bottom-6 right-6 z-50', className)}>
			{/* Действия */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="absolute bottom-16 right-0 flex flex-col gap-3 items-end mb-2"
					>
						{actions.map((action, index) => (
							<motion.button
								key={action.id}
								initial={{ opacity: 0, y: 20, scale: 0.8 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: 20, scale: 0.8 }}
								transition={{ delay: index * 0.05, duration: 0.2 }}
								onClick={action.onClick}
								disabled={action.disabled}
								className={cn(
									'flex items-center gap-3 pl-4 pr-2 py-2 rounded-full',
									'bg-card border border-border/50 shadow-xl shadow-black/10',
									'hover:shadow-2xl transition-all duration-200',
									action.disabled && 'opacity-50 cursor-not-allowed'
								)}
							>
								<span className="text-sm font-medium whitespace-nowrap">
									{action.label}
								</span>
								<div className={cn(
									'w-10 h-10 rounded-full flex items-center justify-center',
									'text-white bg-gradient-to-br shadow-lg',
									action.gradient
								)}>
									<action.icon className="w-5 h-5" />
								</div>
							</motion.button>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Основная кнопка */}
			<motion.button
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					'w-14 h-14 rounded-full flex items-center justify-center',
					'text-white shadow-xl hover:shadow-2xl',
					'transition-all duration-300',
					isOpen
						? 'bg-secondary text-foreground rotate-45'
						: 'bg-gradient-to-br from-primary to-blue-600 hover:scale-105'
				)}
				whileTap={{ scale: 0.95 }}
			>
				{isOpen ? (
					<X className="w-6 h-6" />
				) : (
					<Plus className="w-6 h-6" />
				)}
			</motion.button>
		</div>
	)
}


















