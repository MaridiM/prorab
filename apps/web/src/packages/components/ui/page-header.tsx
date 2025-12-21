'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

import { UserMenu } from './user-menu'
import { cn } from '@/packages/utils'

interface PageHeaderProps {
	title: string
	subtitle?: string
	icon?: React.ReactNode
	backHref?: string
	onBack?: () => void
	showUserMenu?: boolean
	actions?: React.ReactNode
	className?: string
	children?: React.ReactNode
}

export function PageHeader({
	title,
	subtitle,
	icon,
	backHref,
	onBack,
	showUserMenu = true,
	actions,
	className,
	children,
}: PageHeaderProps) {
	const router = useRouter()

	const handleBack = () => {
		if (onBack) {
			onBack()
		} else if (backHref) {
			router.push(backHref)
		} else {
			router.back()
		}
	}

	const showBackButton = backHref || onBack

	return (
		<motion.header
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className={cn(
				'sticky top-0 z-40 border-b border-border/30 bg-card/80 backdrop-blur-xl',
				className
			)}
		>
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between gap-4">
					{/* Left side */}
					<div className="flex items-center gap-4 min-w-0 flex-1">
						{showBackButton && (
							<button
								onClick={handleBack}
								className="flex-shrink-0 p-2 rounded-xl hover:bg-secondary/50 transition-colors"
							>
								<ArrowLeft className="w-5 h-5" />
							</button>
						)}
						
						<div className="flex items-center gap-3 min-w-0">
							{icon && (
								<div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
									{icon}
								</div>
							)}
							<div className="min-w-0">
								<h1 className="text-xl font-bold truncate">{title}</h1>
								{subtitle && (
									<p className="text-sm text-muted-foreground truncate">{subtitle}</p>
								)}
							</div>
						</div>
					</div>

					{/* Right side */}
					<div className="flex items-center gap-3 flex-shrink-0">
						{actions}
						{children}
						{showUserMenu && <UserMenu avatarSize="sm" />}
					</div>
				</div>
			</div>
		</motion.header>
	)
}












