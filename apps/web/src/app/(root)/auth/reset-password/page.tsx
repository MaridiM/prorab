"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Loader2, Lock, ShieldCheck } from "lucide-react"
import { Button, Card, Input } from "@/packages/components"

const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
}

export default function ResetPasswordPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [toastMessage, setToastMessage] = useState<string | null>(null)
    const [toastType, setToastType] = useState<"success" | "error">("success")

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToastMessage(msg)
        setToastType(type)
        setTimeout(() => setToastMessage(null), 3000)
    }

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            showToast("Пароли не совпадают", "error")
            return
        }

        if (password.length < 8) {
            showToast("Минимум 8 символов", "error")
            return
        }

        setIsLoading(true)
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        showToast("Пароль изменён!")
        setTimeout(() => {
            router.push("/auth/login")
        }, 1500)
    }

    return (
        <>
        <Card className="w-full max-w-[420px] bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 p-8 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-success via-emerald-400 to-success" />
            
            {/* Header */}
            <motion.div 
                className="text-center mb-8"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
            >
                <motion.div 
                    className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <ShieldCheck className="w-8 h-8 text-success" />
                </motion.div>
                <h1 className="text-2xl font-bold tracking-tight">Новый пароль</h1>
                <p className="text-muted-foreground mt-2 text-sm max-w-[280px] mx-auto">
                    Придумайте надёжный пароль для вашего аккаунта
                </p>
            </motion.div>

            <motion.form 
                className="space-y-5" 
                onSubmit={handleResetPassword}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
            >
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Новый пароль
                    </label>
                    <Input
                        type="password"
                        name="password"
                        placeholder="Минимум 8 символов"
                        required
                        disabled={isLoading}
                        minLength={8}
                        className="h-12 px-4 rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Повторите пароль
                    </label>
                    <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        minLength={8}
                        className="h-12 px-4 rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all"
                    />
                </div>

                {/* Password requirements */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Требования к паролю:</p>
                    {[
                        "Минимум 8 символов",
                        "Латинские буквы",
                        "Хотя бы одна цифра"
                    ].map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                                <Check className="w-2.5 h-2.5" />
                            </div>
                            {req}
                        </div>
                    ))}
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-success text-success-foreground font-semibold shadow-lg shadow-success/20 hover:shadow-xl hover:shadow-success/30 hover:bg-success/90 active:scale-[0.98] transition-all duration-200 group"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Сохранить пароль
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>
            </motion.form>

            <motion.div 
                className="mt-6"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
            >
                <Link
                    href="/auth/login"
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Вернуться ко входу
                </Link>
            </motion.div>

        </Card>
        <Toast message={toastMessage} type={toastType} />
        </>
    )
}

function Toast({ message, type = "success" }: { message: string | null; type?: "success" | "error" }) {
    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 ${
                        type === "success" 
                            ? "bg-success text-success-foreground shadow-success/25" 
                            : "bg-destructive text-destructive-foreground shadow-destructive/25"
                    }`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                >
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium whitespace-nowrap">{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
