"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Check, Loader2, Mail, Send } from "lucide-react"
import { Button, Card, Input } from "@/packages/components"

const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
}

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isEmailSent, setIsEmailSent] = useState(false)
    const [toastMessage, setToastMessage] = useState<string | null>(null)

    const showToast = (msg: string) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(null), 3000)
    }

    const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setIsLoading(false)
        setIsEmailSent(true)
        showToast("Ссылка отправлена")
    }

    if (isEmailSent) {
        return (
            <Card className="w-full max-w-[420px] bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 p-8 relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-success via-emerald-400 to-success" />
                
                <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div 
                        className="w-20 h-20 bg-success/10 rounded-3xl flex items-center justify-center mx-auto mb-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                        >
                            <Mail className="w-10 h-10 text-success" />
                        </motion.div>
                    </motion.div>
                    
                    <h2 className="text-2xl font-bold mb-2">Проверьте почту</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                        Мы отправили ссылку для сброса пароля на ваш email. 
                        Перейдите по ней, чтобы создать новый пароль.
                    </p>
                    
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 mb-6">
                        <p className="text-xs text-muted-foreground">
                            Не получили письмо? Проверьте папку «Спам» или попробуйте отправить ещё раз через 60 секунд.
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Link href="/auth/login">
                        <Button 
                            variant="outline" 
                            className="w-full h-12 rounded-xl group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Вернуться ко входу
                        </Button>
                    </Link>
                </motion.div>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-[420px] bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 p-8 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-blue-400 to-primary" />
            
            {/* Header */}
            <motion.div 
                className="text-center mb-8"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
            >
                <motion.div 
                    className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.05 }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                    >
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                </motion.div>
                <h1 className="text-2xl font-bold tracking-tight">Восстановление</h1>
                <p className="text-muted-foreground mt-2 text-sm max-w-[280px] mx-auto">
                    Введите email, и мы отправим ссылку для сброса пароля
                </p>
            </motion.div>

            <motion.form 
                className="space-y-5" 
                onSubmit={handleForgotPassword}
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
                            <Send className="w-4 h-4 mr-2" />
                            Отправить ссылку
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
                    Назад ко входу
                </Link>
            </motion.div>

            {/* Toast */}
            <motion.div
                className="absolute top-4 left-4 right-4 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 pointer-events-none bg-success text-success-foreground"
                initial={{ opacity: 0, y: -20 }}
                animate={{ 
                    opacity: toastMessage ? 1 : 0, 
                    y: toastMessage ? 0 : -20 
                }}
                transition={{ duration: 0.2 }}
            >
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">{toastMessage}</span>
            </motion.div>
        </Card>
    )
}
