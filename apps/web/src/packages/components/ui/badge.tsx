"use client"

import * as React from "react"

import { cn } from "@/packages/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "success" | "warning" | "danger" | "secondary"
}

const variantStyles = {
	default: "bg-primary text-primary-foreground",
	success: "bg-green-500 text-white",
	warning: "bg-yellow-500 text-white",
	danger: "bg-red-500 text-white",
	secondary: "bg-secondary text-secondary-foreground",
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
	({ className, variant = "default", ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
					variantStyles[variant],
					className
				)}
				{...props}
			/>
		)
	}
)
Badge.displayName = "Badge"

export { Badge }
