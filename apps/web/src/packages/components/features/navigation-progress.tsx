"use client"

import { useEffect, useState, useCallback } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function NavigationProgress() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isNavigating, setIsNavigating] = useState(false)
    const [progress, setProgress] = useState(0)

    const startNavigation = useCallback(() => {
        setIsNavigating(true)
        setProgress(0)
        
        // Simulate progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval)
                    return prev
                }
                return prev + Math.random() * 15
            })
        }, 100)

        return () => clearInterval(interval)
    }, [])

    const completeNavigation = useCallback(() => {
        setProgress(100)
        setTimeout(() => {
            setIsNavigating(false)
            setProgress(0)
        }, 200)
    }, [])

    useEffect(() => {
        completeNavigation()
    }, [pathname, searchParams, completeNavigation])

    // Listen for navigation start
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const anchor = target.closest("a")
            
            if (anchor && anchor.href && !anchor.target && !anchor.download) {
                const url = new URL(anchor.href)
                if (url.origin === window.location.origin && url.pathname !== pathname) {
                    startNavigation()
                }
            }
        }

        document.addEventListener("click", handleClick)
        return () => document.removeEventListener("click", handleClick)
    }, [pathname, startNavigation])

    return (
        <AnimatePresence>
            {isNavigating && (
                <motion.div
                    className="fixed top-0 left-0 right-0 z-[9999] h-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Background */}
                    <div className="absolute inset-0 bg-primary/10" />
                    
                    {/* Progress bar */}
                    <motion.div
                        className="h-full bg-linear-to-r from-primary via-blue-500 to-accent"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut" }}
                    />
                    
                    {/* Glow effect */}
                    <motion.div
                        className="absolute right-0 top-0 h-full w-24 bg-linear-to-r from-transparent to-primary/50 blur-sm"
                        style={{ left: `${Math.max(0, progress - 10)}%` }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}

