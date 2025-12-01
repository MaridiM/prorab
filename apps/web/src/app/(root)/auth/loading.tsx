"use client"

import { motion } from "framer-motion"

export default function AuthLoading() {
    return (
        <div className="w-full max-w-[420px]">
            <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/5 to-transparent" />
                
                {/* Logo skeleton */}
                <div className="flex flex-col items-center mb-8">
                    <motion.div 
                        className="w-14 h-14 rounded-2xl bg-secondary/50"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div 
                        className="mt-4 h-7 w-48 rounded-lg bg-secondary/50"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                    />
                    <motion.div 
                        className="mt-2 h-4 w-36 rounded-md bg-secondary/30"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                </div>

                {/* Form skeleton */}
                <div className="space-y-5">
                    {/* Email field */}
                    <div className="space-y-2">
                        <motion.div 
                            className="h-4 w-16 rounded-md bg-secondary/30"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                        />
                        <motion.div 
                            className="h-12 w-full rounded-xl bg-secondary/50"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        />
                    </div>

                    {/* Password field */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <motion.div 
                                className="h-4 w-16 rounded-md bg-secondary/30"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                            />
                            <motion.div 
                                className="h-4 w-24 rounded-md bg-secondary/30"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                            />
                        </div>
                        <motion.div 
                            className="h-12 w-full rounded-xl bg-secondary/50"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                        />
                    </div>

                    {/* Button */}
                    <motion.div 
                        className="h-12 w-full rounded-xl bg-primary/30"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }}
                    />
                </div>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                    <motion.div 
                        className="flex-1 h-px bg-secondary/50"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div 
                        className="h-4 w-24 rounded-md bg-secondary/30"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div 
                        className="flex-1 h-px bg-secondary/50"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </div>

                {/* Social button */}
                <motion.div 
                    className="h-12 w-full rounded-xl bg-[#24A1DE]/30"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
                />

                {/* Footer text */}
                <motion.div 
                    className="mt-6 h-4 w-48 mx-auto rounded-md bg-secondary/30"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
                />
            </div>
        </div>
    )
}

