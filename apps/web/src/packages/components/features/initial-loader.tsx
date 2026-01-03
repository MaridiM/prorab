"use client"

import { useState, useEffect } from "react"
import { PageLoader } from "@/packages/components/ui/spinner"

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

    // Используем fullScreen={false}, чтобы PageLoader не создавал свой fixed overlay
    // InitialLoader сам создает fixed overlay с правильным z-index
    return (
        <div
            className={`fixed inset-0 z-[10000] bg-background/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-500 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <PageLoader text="Загрузка..." fullScreen={false} />
        </div>
    )
}
