"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Home, RefreshCw, AlertTriangle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const router = useRouter()

    useEffect(() => {
        console.error(error)
        
        // Check if error is authentication-related
        const errorMessage = error.message || String(error);
        const isAuthError = 
            errorMessage.includes('User not authenticated') ||
            errorMessage.includes('Требуется авторизация') ||
            errorMessage.includes('Сессия истекла') ||
            errorMessage.includes('Unauthorized') ||
            errorMessage.toLowerCase().includes('unauthorized') ||
            error.digest?.includes('401') ||
            error.digest?.includes('UNAUTHENTICATED');

        if (isAuthError) {
            // Clear session token
            document.cookie.split(";").forEach((c) => {
                if (c.trim().startsWith('session_token=')) {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                }
            });
            // Redirect to login
            router.push('/auth/login');
        }
    }, [error, router])

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-destructive/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse-slow" />
            </div>

            <div className="relative z-10 text-center max-w-lg">
                {/* Icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="mb-8"
                >
                    <div className="w-32 h-32 mx-auto rounded-3xl bg-linear-to-br from-destructive to-rose-600 flex items-center justify-center shadow-2xl shadow-destructive/30">
                        <AlertTriangle className="w-16 h-16 text-white" />
                    </div>
                </motion.div>

                {/* Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                        Что-то пошло не так
                    </h1>
                    <p className="text-muted-foreground text-lg mb-2">
                        Произошла непредвиденная ошибка. Мы уже работаем над её исправлением.
                    </p>
                    {error.digest && (
                        <p className="text-sm text-muted-foreground/60 mb-8 font-mono">
                            Код ошибки: {error.digest}
                        </p>
                    )}
                </motion.div>

                {/* Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-linear-to-r from-primary to-blue-600 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Попробовать снова
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 font-semibold transition-all"
                    >
                        <Home className="w-5 h-5" />
                        На главную
                    </Link>
                </motion.div>

                {/* Support */}
                <motion.p
                    className="mt-12 text-sm text-muted-foreground/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    Если проблема повторяется, напишите в{" "}
                    <a href="#" className="text-primary hover:underline">
                        поддержку
                    </a>
                </motion.p>
            </div>
        </div>
    )
}

