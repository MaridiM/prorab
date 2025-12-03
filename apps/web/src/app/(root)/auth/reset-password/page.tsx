"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Loader2, Lock, ShieldCheck, AlertCircle } from "lucide-react"
import { useMutation } from "@apollo/client/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button, Card, Input, Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/packages/components"
import { ResetPasswordDocument } from "@/packages/api/graphql"
import { resetPasswordSchema, TResetPasswordSchema } from "@/packages/schemas"
import { useAutoValidateForm } from "@/packages/hooks"

const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
}

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [toastMessage, setToastMessage] = useState<string | null>(null)
    const [toastType, setToastType] = useState<"success" | "error">("success")

    // React Hook Form with Zod validation
    const form = useForm<TResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: ''
        },
        mode: 'onTouched',
        reValidateMode: 'onChange'
    })

    // Auto-validate form with debounce
    useAutoValidateForm(form, ['password', 'confirmPassword'])

    // Apollo mutation
    const [resetPassword, { loading: isLoading }] = useMutation(ResetPasswordDocument)

    const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
        setToastMessage(msg)
        setToastType(type)
        setTimeout(() => setToastMessage(null), 4000)
    }, [])

    const onSubmit = async (data: TResetPasswordSchema) => {
        if (!token) {
            showToast("Токен не найден", "error")
            return
        }

        const response = await resetPassword({
            variables: {
                input: {
                    token,
                    newPassword: data.password
                }
            }
        })

        // Handle errors
        if (response.errors?.length) {
            showToast(response.errors[0]?.message || 'Ошибка сброса пароля', 'error')
            return
        }

        // Handle success
        if (response.data?.resetPassword) {
            showToast("Пароль изменён!")
            setTimeout(() => {
                router.push("/auth/login")
            }, 1500)
        }
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
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" />
                                    Новый пароль
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Минимум 8 символов"
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
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" />
                                    Повторите пароль
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
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
                        disabled={isLoading || !form.formState.isValid}
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
            </Form>

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
