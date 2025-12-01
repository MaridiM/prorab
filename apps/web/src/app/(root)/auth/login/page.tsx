"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Check, Loader2, Mail, Lock, AlertCircle } from "lucide-react"
import { Button, Card, Input } from "@/packages/components"

const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
}

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [toastMessage, setToastMessage] = useState<string | null>(null)
    const [toastType, setToastType] = useState<"success" | "error">("success")

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToastMessage(msg)
        setToastType(type)
        setTimeout(() => setToastMessage(null), 4000)
    }

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        
        try {
            const response = await fetch(`${API_URL}/graphql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    query: `mutation Login($input: LoginInput!) { 
                        login(input: $input) { 
                            user { id email name emailVerified } 
                        } 
                    }`,
                    variables: { input: { email, password } },
                }),
            })

            const { data, errors } = await response.json()

            if (errors) {
                showToast(errors[0]?.message || 'Ошибка входа', 'error')
                return
            }

            showToast("Вход выполнен успешно")
            setTimeout(() => {
                router.push("/dashboard")
            }, 800)
        } catch (error) {
            showToast('Ошибка подключения к серверу', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleTelegramLogin = async () => {
        // TODO: Implement Telegram login
        showToast("Вход через Telegram будет доступен позже", "error")
    }

    return (
        <>
        <Card className="w-full max-w-[420px] bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 p-8 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-accent to-primary" />
            
            {/* Logo Header */}
            <motion.div 
                className="text-center mb-8"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
            >
                <motion.div 
                    className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-amber-500 text-accent-foreground font-bold text-xl mb-4 shadow-lg shadow-accent/30"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    PR
                </motion.div>
                <h1 className="text-2xl font-bold tracking-tight">Добро пожаловать</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    Войдите в свой аккаунт ProRab.space
                </p>
            </motion.div>

            <motion.form 
                className="space-y-5" 
                onSubmit={handleLogin}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
            >
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        Email
                    </label>
                    <Input
                        type="email"
                        placeholder="name@example.com"
                        required
                        disabled={isLoading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 px-4 rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" />
                            Пароль
                        </label>
                        <Link
                            href="/auth/forgot-password"
                            className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                            Забыли пароль?
                        </Link>
                    </div>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 px-4 rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 group"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Войти
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>
            </motion.form>

            <motion.div 
                className="relative my-6"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
            >
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">
                        или продолжить через
                    </span>
                </div>
            </motion.div>

            <motion.button
                type="button"
                onClick={handleTelegramLogin}
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#24A1DE] text-white font-medium shadow-lg shadow-[#24A1DE]/20 hover:shadow-xl hover:shadow-[#24A1DE]/30 hover:bg-[#24A1DE]/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Telegram
            </motion.button>

            <motion.div 
                className="mt-6 text-center text-sm text-muted-foreground"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.5 }}
            >
                Нет аккаунта?{" "}
                <Link
                    href="/auth/register"
                    className="text-primary font-medium hover:text-primary/80 transition-colors"
                >
                    Создать бригаду
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
                    {type === "success" ? (
                        <Check className="w-4 h-4" />
                    ) : (
                        <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium whitespace-nowrap">{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
