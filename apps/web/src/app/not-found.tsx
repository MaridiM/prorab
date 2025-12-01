"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Home, ArrowLeft, Construction } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center max-w-2xl">
                {/* Animated 404 illustration */}
                <motion.div
                    className="relative mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Main 404 text with construction theme */}
                    <div className="relative flex items-center justify-center gap-2 sm:gap-4">
                        {/* 4 */}
                        <motion.div
                            className="relative"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                        >
                            <span className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-linear-to-b from-foreground/20 to-foreground/5">
                                4
                            </span>
                        </motion.div>

                        {/* 0 - replaced with animated construction cone */}
                        <motion.div
                            className="relative w-20 h-24 sm:w-28 sm:h-32"
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                        >
                            {/* Cone */}
                            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl">
                                {/* Cone body */}
                                <motion.path
                                    d="M50 10 L85 100 L15 100 Z"
                                    fill="url(#coneGradient)"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                />
                                {/* Stripes */}
                                <motion.path
                                    d="M30 70 L70 70"
                                    stroke="hsl(var(--background))"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 0.6, duration: 0.3 }}
                                />
                                <motion.path
                                    d="M38 50 L62 50"
                                    stroke="hsl(var(--background))"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 0.7, duration: 0.3 }}
                                />
                                {/* Base */}
                                <rect x="10" y="100" width="80" height="12" rx="3" fill="hsl(var(--muted))" />
                                <defs>
                                    <linearGradient id="coneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="hsl(var(--accent))" />
                                        <stop offset="100%" stopColor="#f97316" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            
                            {/* Animated warning light */}
                            <motion.div
                                className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400"
                                animate={{ 
                                    boxShadow: [
                                        "0 0 0 0 rgba(251, 191, 36, 0.4)",
                                        "0 0 20px 10px rgba(251, 191, 36, 0.2)",
                                        "0 0 0 0 rgba(251, 191, 36, 0.4)"
                                    ],
                                    opacity: [1, 0.6, 1]
                                }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        </motion.div>

                        {/* 4 */}
                        <motion.div
                            className="relative"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                        >
                            <span className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-linear-to-b from-foreground/20 to-foreground/5">
                                4
                            </span>
                        </motion.div>
                    </div>

                    {/* Floating particles */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-accent/40"
                            style={{
                                left: `${20 + i * 12}%`,
                                top: `${30 + (i % 3) * 20}%`,
                            }}
                            animate={{
                                y: [0, -15, 0],
                                opacity: [0.4, 1, 0.4],
                            }}
                            transition={{
                                duration: 2 + i * 0.3,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </motion.div>

                {/* Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Construction className="w-6 h-6 text-accent" />
                        <h1 className="text-2xl sm:text-3xl font-bold">
                            Страница на ремонте
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        Похоже, эта страница ещё не построена или переехала. 
                        Проверьте адрес или вернитесь на главную.
                    </p>
                </motion.div>

                {/* Buttons */}
                <motion.div
                    className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-linear-to-r from-accent to-amber-500 text-accent-foreground font-semibold shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Home className="w-5 h-5" />
                        На главную
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl border-2 border-border hover:border-accent/50 hover:bg-accent/5 font-semibold transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Назад
                    </button>
                </motion.div>

                {/* Fun decoration - construction tape */}
                <motion.div 
                    className="mt-16 flex items-center justify-center gap-1 opacity-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 0.9 }}
                >
                    {[...Array(7)].map((_, i) => (
                        <div 
                            key={i}
                            className={`w-8 h-3 ${i % 2 === 0 ? 'bg-amber-400' : 'bg-foreground/80'}`}
                            style={{ transform: `skewX(-20deg)` }}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
