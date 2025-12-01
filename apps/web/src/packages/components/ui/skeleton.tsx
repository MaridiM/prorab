"use client"

import { cn } from "@/packages/utils"
import { motion } from "framer-motion"

interface SkeletonProps {
    className?: string
    variant?: "default" | "circular" | "rounded" | "text"
    animate?: boolean
}

function Skeleton({ className, variant = "default", animate = true }: SkeletonProps) {
    const baseStyles = "bg-secondary/50"
    
    const variantStyles = {
        default: "rounded-lg",
        circular: "rounded-full",
        rounded: "rounded-xl",
        text: "rounded-md h-4",
    }

    if (animate) {
        return (
            <motion.div
                className={cn(baseStyles, variantStyles[variant], className)}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
        )
    }

    return (
        <div className={cn(baseStyles, variantStyles[variant], "animate-pulse", className)} />
    )
}

// Pre-built skeleton components
function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn("p-6 rounded-3xl bg-card border border-border/30", className)}>
            <div className="flex gap-4">
                <Skeleton className="w-16 h-16" variant="rounded" />
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-3/4" variant="text" />
                    <Skeleton className="h-4 w-1/2" variant="text" />
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-full" variant="text" />
                <Skeleton className="h-3 w-5/6" variant="text" />
            </div>
        </div>
    )
}

function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeStyles = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
    }
    return <Skeleton className={sizeStyles[size]} variant="circular" />
}

function SkeletonButton({ className }: { className?: string }) {
    return <Skeleton className={cn("h-12 w-32", className)} variant="rounded" />
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton 
                    key={i} 
                    className={cn("h-4", i === lines - 1 ? "w-4/5" : "w-full")} 
                    variant="text" 
                />
            ))}
        </div>
    )
}

function SkeletonImage({ className }: { className?: string }) {
    return (
        <div className={cn("relative overflow-hidden rounded-xl bg-secondary/30", className)}>
            <Skeleton className="absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-muted-foreground/30" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
            </div>
        </div>
    )
}

export { 
    Skeleton, 
    SkeletonCard, 
    SkeletonAvatar, 
    SkeletonButton, 
    SkeletonText,
    SkeletonImage 
}

