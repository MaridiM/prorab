"use client"

import { useState, useEffect } from "react"

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
            <div className="flex flex-col items-center">
                {/* Logo with pulse */}
                <div className="relative">
                    {/* Pulse rings */}
                    <div className="absolute inset-0 rounded-2xl bg-accent/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                    <div className="absolute inset-0 rounded-2xl bg-accent/20 animate-pulse" />
                    
                    {/* Logo */}
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30 animate-pulse">
                        <span className="font-bold text-2xl text-white">PR</span>
                    </div>
                </div>

                {/* Bouncing dots */}
                <div className="mt-8 flex items-center gap-2">
                    <div 
                        className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" 
                        style={{ animationDelay: '0ms', animationDuration: '0.6s' }} 
                    />
                    <div 
                        className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" 
                        style={{ animationDelay: '150ms', animationDuration: '0.6s' }} 
                    />
                    <div 
                        className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" 
                        style={{ animationDelay: '300ms', animationDuration: '0.6s' }} 
                    />
                </div>

                {/* Text */}
                <p className="mt-6 text-sm text-muted-foreground animate-pulse">
                    Загрузка...
                </p>
            </div>
        </div>
    )
}
