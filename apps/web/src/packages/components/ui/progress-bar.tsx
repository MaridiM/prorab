"use client"

import * as React from "react"

import { cn } from "@/packages/utils"

export interface ProgressBarProps {
	value: number // 0-100
	showLabel?: boolean
	size?: "sm" | "md" | "lg"
	variant?: "default" | "success" | "warning" | "danger"
	className?: string
	indicatorClassName?: string // Custom className for the progress indicator
	onClick?: React.MouseEventHandler<HTMLDivElement>
	onMouseEnter?: React.MouseEventHandler<HTMLDivElement>
	onMouseLeave?: React.MouseEventHandler<HTMLDivElement>
	style?: React.CSSProperties
	id?: string
	'data-testid'?: string
}

const variantStyles = {
	default: "bg-primary",
	success: "bg-green-500",
	warning: "bg-yellow-500",
	danger: "bg-red-500",
}

const sizeStyles = {
	sm: "h-1",
	md: "h-2",
	lg: "h-3",
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
	(
		{
			value,
			showLabel = false,
			size = "md",
			variant = "default",
			className,
			indicatorClassName,
			...props
		},
		ref
	) => {
		// Clamp value between 0 and 100
		const clampedValue = Math.min(Math.max(value, 0), 100)

		// Автоматически выбираем вариант на основе прогресса
		const autoVariant =
			variant === "default"
				? clampedValue === 100
					? "success"
					: clampedValue >= 75
						? "success"
						: clampedValue >= 50
							? "warning"
							: "default"
				: variant

		return (
			<div ref={ref} className={cn("w-full", className)} {...props}>
				{showLabel && (
					<div className="flex justify-between items-center mb-1">
						<span className="text-sm font-medium">Прогресс</span>
						<span className="text-sm font-medium">{clampedValue}%</span>
					</div>
				)}
				<div
					className={cn(
						"w-full bg-secondary rounded-full overflow-hidden",
						sizeStyles[size]
					)}
				>
					<div
						className={cn(
							"h-full transition-all duration-300 ease-in-out rounded-full",
							variantStyles[autoVariant],
							indicatorClassName
						)}
						style={{ width: `${clampedValue}%` }}
					/>
				</div>
			</div>
		)
	}
)
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }
