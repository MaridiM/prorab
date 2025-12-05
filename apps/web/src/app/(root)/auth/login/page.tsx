"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, Variants } from "framer-motion"
import { ArrowRight, Loader2, Mail, Lock } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button, Card, Input, PasswordInput, Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/packages/components"
import { loginSchema, TLoginSchema } from "@/packages/schemas"
import { useAutoValidateForm, useToast } from "@/packages/hooks"
import { useAuth } from "@/packages/libs/auth/auth.context"

const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.22, 0.61, 0.36, 1] as const
        }
    }
}

export default function LoginPage() {
    const router = useRouter()
    const { success, error } = useToast()
    const { login: authLogin, isLoading } = useAuth()

    // React Hook Form with Zod validation
    const form = useForm<TLoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
        mode: 'onTouched',
        reValidateMode: 'onChange'
    })

    // Auto-validate form with debounce
    useAutoValidateForm(form, ['email', 'password'])

    const onSubmit = async (data: TLoginSchema) => {
        try {
            await authLogin(data.email, data.password)
            success("Вход выполнен успешно")
            // AuthContext handles redirect automatically based on hasCompletedOnboarding
        } catch (err: any) {
            const errorMessage = err?.message || 'Ошибка входа'
            error(errorMessage)
        }
    }

    const handleTelegramLogin = useCallback(() => {
        // TODO: Implement Telegram login
        error("Вход через Telegram будет доступен позже")
    }, [error])

    return (
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
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                >
                    PR
                </motion.div>
                <h1 className="text-2xl font-bold tracking-tight">Добро пожаловать</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    Войдите в свой аккаунт ProRab.space
                </p>
            </motion.div>

            <Form {...form}>
                <motion.form
                    className="space-y-5"
                    onSubmit={form.handleSubmit(onSubmit)}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" />
                                    Email
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        disabled={isLoading}
                                        className="h-12 px-4 rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex justify-between items-center ml-1">
                                    <FormLabel className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5" />
                                        Пароль
                                    </FormLabel>
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Забыли пароль?
                                    </Link>
                                </div>
                                <FormControl>
                                    <PasswordInput
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                        className="h-12 px-4 rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.3 }}
                    >
                        <Button
                            type="submit"
                            disabled={isLoading || !form.formState.isValid}
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
                    </motion.div>
                </motion.form>
            </Form>

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

            <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
            >
                <button
                    type="button"
                    onClick={handleTelegramLogin}
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-[#24A1DE] text-white font-medium shadow-lg shadow-[#24A1DE]/20 hover:shadow-xl hover:shadow-[#24A1DE]/30 hover:bg-[#24A1DE]/90 active:scale-[0.98] transition-all duration-200 group flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
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
                </button>
            </motion.div>

            <motion.div
                className="mt-6 text-center text-sm text-muted-foreground"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
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
    )
}
