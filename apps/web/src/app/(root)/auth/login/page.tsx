"use client"

import { useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, Variants } from "framer-motion"
import { ArrowRight, Loader2, Mail, Lock } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button, Card, Input, PasswordInput, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, TelegramLoginButton } from "@/packages/components"
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
    const searchParams = useSearchParams()
    const { success, error } = useToast()
    const { login: authLogin, isLoading } = useAuth()
    
    // Get redirect URL from query params (if coming from invite link)
    const redirectUrl = searchParams.get('redirect')
    const registerUrl = useMemo(() => {
        return redirectUrl ? `/auth/register?redirect=${encodeURIComponent(redirectUrl)}` : '/auth/register'
    }, [redirectUrl])

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
            
            // Check if there's a redirect URL (e.g., from invite link)
            if (redirectUrl) {
                setTimeout(() => {
                    router.push(redirectUrl)
                }, 500)
            }
            // Otherwise AuthContext handles redirect automatically based on hasCompletedOnboarding
        } catch (err: any) {
            const errorMessage = err?.message || 'Ошибка входа'
            error(errorMessage)
        }
    }

    const handleTelegramSuccess = useCallback((user: any) => {
        success("Вход через Telegram выполнен успешно!")
        // AuthContext handles redirect automatically based on hasCompletedOnboarding
        window.location.href = user.hasCompletedOnboarding ? '/dashboard' : '/onboarding'
    }, [success])

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
                <TelegramLoginButton
                    onSuccess={handleTelegramSuccess}
                    isLoading={isLoading}
                    className="h-12 rounded-xl bg-[#24A1DE] text-white font-medium shadow-lg shadow-[#24A1DE]/20 hover:shadow-xl hover:shadow-[#24A1DE]/30 hover:bg-[#24A1DE]/90 active:scale-[0.98] transition-all duration-200"
                />
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
                    href={registerUrl}
                    className="text-primary font-medium hover:text-primary/80 transition-colors"
                >
                    Создать аккаунт
                </Link>
            </motion.div>

        </Card>
    )
}
