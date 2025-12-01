"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Sun } from "lucide-react"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    const isDark = resolvedTheme === "dark"

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-4 overflow-y-auto">
            {/* Animated background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div 
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                <motion.div 
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl"
                    animate={{
                        x: [0, -80, 0],
                        y: [0, -60, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>

            {/* Theme Toggle */}
            <motion.div 
                className="absolute top-6 right-6 z-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <button
                    onClick={toggleTheme}
                    className="relative w-12 h-12 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
                    aria-label="Toggle theme"
                >
                    <AnimatePresence mode="wait">
                        {mounted && (
                            <motion.div
                                key={isDark ? "moon" : "sun"}
                                initial={{ y: 20, opacity: 0, rotate: -90 }}
                                animate={{ y: 0, opacity: 1, rotate: 0 }}
                                exit={{ y: -20, opacity: 0, rotate: 90 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isDark ? (
                                    <Moon className="w-5 h-5" />
                                ) : (
                                    <Sun className="w-5 h-5" />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </motion.div>

            {/* Back to home */}
            <motion.div 
                className="absolute top-6 left-6 z-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Link 
                    href="/"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover:-translate-x-1 transition-transform"
                    >
                        <path d="m12 19-7-7 7-7"/>
                        <path d="M19 12H5"/>
                    </motion.svg>
                    На главную
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative z-10 w-full flex justify-center"
            >
                {children}
            </motion.div>

            {/* Footer Links */}
            <motion.div 
                className="mt-8 text-center text-xs text-muted-foreground/60 relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <Link href="#" className="hover:text-muted-foreground transition-colors">
                    Политика конфиденциальности
                </Link>{" "}
                <span className="mx-2">•</span>
                <Link href="#" className="hover:text-muted-foreground transition-colors">
                    Оферта
                </Link>
            </motion.div>
        </div>
    )
}
