"use client"

import { cn } from "@/packages/utils"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface SpinnerProps {
    size?: "sm" | "md" | "lg" | "xl"
    variant?: "default" | "dots" | "bars" | "ring" | "logo"
    className?: string
    color?: string
}

function Spinner({ size = "md", variant = "default", className, color }: SpinnerProps) {
    const sizeStyles = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12",
    }

    if (variant === "default") {
        return (
            <Loader2 className={cn(sizeStyles[size], "animate-spin text-primary", color, className)} />
        )
    }

    if (variant === "dots") {
        return (
            <div className={cn("flex items-center gap-1", className)}>
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className={cn(
                            "rounded-full bg-primary",
                            size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2 h-2" : size === "lg" ? "w-2.5 h-2.5" : "w-3 h-3",
                            color
                        )}
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
        )
    }

    if (variant === "bars") {
        return (
            <div className={cn("flex items-end gap-0.5", className)}>
                {[0, 1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        className={cn(
                            "rounded-full bg-primary",
                            size === "sm" ? "w-1" : size === "md" ? "w-1.5" : size === "lg" ? "w-2" : "w-2.5",
                            color
                        )}
                        animate={{ height: ["40%", "100%", "40%"] }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: "easeInOut"
                        }}
                        style={{ height: "100%" }}
                    />
                ))}
            </div>
        )
    }

    if (variant === "ring") {
        const ringSize = size === "sm" ? 20 : size === "md" ? 28 : size === "lg" ? 36 : 48
        return (
            <motion.svg
                className={cn(sizeStyles[size], className)}
                viewBox="0 0 50 50"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
                <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-secondary"
                />
                <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="url(#spinnerGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="31.4 94.2"
                />
                <defs>
                    <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                </defs>
            </motion.svg>
        )
    }

    if (variant === "logo") {
        return (
            <div className={cn("relative", sizeStyles[size], className)}>
                <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <svg className="w-full h-full" viewBox="0 0 50 50">
                        <circle
                            cx="25"
                            cy="25"
                            r="22"
                            fill="none"
                            stroke="url(#logoGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="35 105"
                        />
                        <defs>
                            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(var(--primary))" />
                                <stop offset="100%" stopColor="hsl(var(--accent))" />
                            </linearGradient>
                        </defs>
                    </svg>
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span 
                        className="font-bold text-xs text-primary"
                        animate={{ scale: [1, 0.9, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        PR
                    </motion.span>
                </div>
            </div>
        )
    }

    return null
}

// Full page loader
function PageLoader({ text = "Загрузка..." }: { text?: string }) {
    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Spinner size="xl" variant="ring" />
                <p className="text-sm text-muted-foreground">{text}</p>
            </div>
        </div>
    )
}

// Button loader
function ButtonLoader({ className }: { className?: string }) {
    return <Spinner size="sm" variant="default" className={className} />
}

export { Spinner, PageLoader, ButtonLoader }

