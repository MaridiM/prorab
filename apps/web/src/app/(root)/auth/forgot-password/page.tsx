"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check, Loader2, Mail, Send, AlertCircle } from "lucide-react"
import { useMutation } from "@apollo/client/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button, Card, Input, Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/packages/components"
import { ForgotPasswordDocument } from "@/packages/api/graphql"
import { forgotPasswordSchema, TForgotPasswordSchema } from "@/packages/schemas"
import { useAutoValidateForm } from "@/packages/hooks"

const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
}

export default function ForgotPasswordPage() {
    const [isEmailSent, setIsEmailSent] = useState(false)
    const [toastMessage, setToastMessage] = useState<string | null>(null)
    const [toastType, setToastType] = useState<"success" | "error">("success")

    // React Hook Form with Zod validation
    const form = useForm<TForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
        mode: 'onTouched',
        reValidateMode: 'onChange'
    })

    // Auto-validate form with debounce
    useAutoValidateForm(form, ['email'])

    // Apollo mutation
    const [forgotPassword, { loading: isLoading }] = useMutation(ForgotPasswordDocument)

    const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
        setToastMessage(msg)
        setToastType(type)
        setTimeout(() => setToastMessage(null), 4000)
    }, [])

    const onSubmit = async (data: TForgotPasswordSchema) => {
        const response = await forgotPassword({
            variables: { email: data.email }
        })

        // Handle errors
        if (response.errors?.length) {
            showToast(response.errors[0]?.message || 'Ошибка отправки', 'error')
            return
        }

        // Handle success
        if (response.data?.forgotPassword) {
            setIsEmailSent(true)
            showToast("Ссылка отправлена")
        }
    }

    if (isEmailSent) {
        return (
            <>
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
            <Toast message={toastMessage} />
            </>
        )
    }

    return (
        <>
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

                    <Button
                        type="submit"
                        disabled={isLoading || !form.formState.isValid}
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
                    Назад ко входу
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
