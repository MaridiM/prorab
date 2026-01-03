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

// Full page loader with branded style - единый прелоадер для всего приложения
function PageLoader({ 
    text = "Загрузка...", 
    fullScreen = true,
    className 
}: { 
    text?: string
    fullScreen?: boolean
    className?: string
}) {
    const content = (
        <div className={cn("flex flex-col items-center gap-8", className)}>
            {/* Main spinner container */}
            <div className="relative w-20 h-20">
                {/* Outer rotating ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-4 border-transparent"
                    style={{
                        borderTopColor: "hsl(var(--primary))",
                        borderRightColor: "hsl(var(--primary))",
                        borderBottomColor: "transparent",
                        borderLeftColor: "transparent",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ 
                        duration: 1.2, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                />

                {/* Middle pulsing ring */}
                <motion.div
                    className="absolute inset-2 rounded-full border-2"
                    style={{
                        borderColor: "hsl(var(--primary) / 0.3)",
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Inner logo container */}
                <motion.div
                    className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center backdrop-blur-sm"
                    animate={{
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <motion.span
                        className="font-bold text-xl text-primary"
                        animate={{
                            opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        PR
                    </motion.span>
                </motion.div>

                {/* Glow effect */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-primary/10 blur-xl"
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Loading text with fade animation */}
            <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.p
                    className="text-base font-medium text-foreground"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {text}
                </motion.p>

                {/* Minimal progress dots */}
                <div className="flex items-center gap-1.5 mt-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-primary/60"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.4, 1, 0.4]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
                {content}
            </div>
        )
    }

    return (
        <div className="relative flex items-center justify-center">
            {content}
        </div>
    )
}

// Button loader
function ButtonLoader({ className }: { className?: string }) {
    return <Spinner size="sm" variant="default" className={className} />
}

export { Spinner, PageLoader, ButtonLoader }

