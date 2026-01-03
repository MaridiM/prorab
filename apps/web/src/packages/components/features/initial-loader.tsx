"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export function InitialLoader() {
    const [isVisible, setIsVisible] = useState(true)
    const [isFading, setIsFading] = useState(false)

    useEffect(() => {
        const handleLoad = () => {
            setIsFading(true)
            setTimeout(() => setIsVisible(false), 500)
        }

        if (document.readyState === "complete") {
            setTimeout(handleLoad, 300)
        } else {
            window.addEventListener("load", handleLoad)
        }

        const timeout = setTimeout(handleLoad, 2000)

        return () => {
            window.removeEventListener("load", handleLoad)
            clearTimeout(timeout)
        }
    }, [])

    if (!isVisible) return null

    return (
        <div
            className={`fixed inset-0 z-[10000] bg-background flex items-center justify-center transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}
        >
            <div className="flex flex-col items-center gap-6">
                {/* Logo with animated ring */}
                <div className="relative">
                    {/* Rotating gradient ring */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                            background: "conic-gradient(from 0deg, transparent 0%, hsl(var(--primary)) 50%, transparent 100%)",
                            padding: "2px",
                            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            WebkitMaskComposite: "xor",
                            maskComposite: "exclude"
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Pulsing glow */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl bg-amber-400/20"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Logo */}
                    <motion.div
                        className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-2xl shadow-amber-500/30"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <span className="font-bold text-2xl text-amber-950">PR</span>
                    </motion.div>
                </div>

                {/* Loading text */}
                <motion.p
                    className="text-sm font-medium text-muted-foreground"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    Загрузка...
                </motion.p>

                {/* Animated dots */}
                <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{ y: [0, -10, 0] }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
