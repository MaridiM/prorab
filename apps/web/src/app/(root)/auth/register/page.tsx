"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Check, Loader2, Mail, Lock, User, Phone, AlertCircle } from "lucide-react"
import { useMutation } from "@apollo/client/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button, Card, Input, Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/packages/components"
import { RegisterDocument } from "@/packages/api/graphql"
import { registerSchema, TRegisterSchema } from "@/packages/schemas"
import { useAutoValidateForm } from "@/packages/hooks"

const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
}

export default function RegisterPage() {
    const router = useRouter()
    const [toastMessage, setToastMessage] = useState<string | null>(null)
    const [toastType, setToastType] = useState<"success" | "error">("success")

    // React Hook Form with Zod validation
    const form = useForm<TRegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
        },
        mode: 'onTouched',
        reValidateMode: 'onChange'
    })

    // Auto-validate form with debounce
    useAutoValidateForm(form, ['email', 'password', 'confirmPassword', 'name', 'phone'])

    // Apollo mutation with typed document
    const [register, { loading: isLoading }] = useMutation(RegisterDocument)

    const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
        setToastMessage(msg)
        setToastType(type)
        setTimeout(() => setToastMessage(null), 4000)
    }, [])

    const onSubmit = async (data: TRegisterSchema) => {
        // Remove confirmPassword from input
        const { confirmPassword, ...input } = data

        const response = await register({
            variables: {
                input: {
                    email: input.email,
                    password: input.password,
                    name: input.name || undefined,
                    phone: input.phone || undefined
                }
            }
        })

        // Handle errors (errorPolicy: 'all' returns errors in response.errors)
        if (response.errors?.length) {
            showToast(response.errors[0]?.message || 'Ошибка регистрации', 'error')
            return
        }

        // Handle successful registration
        const responseData = response.data?.register
        if (responseData?.user) {
            showToast(responseData.message || "Аккаунт создан!")
            setTimeout(() => {
                router.push("/dashboard")
            }, 1000)
        }
    }

    return (
        <>
        <Card className="w-full max-w-[420px] bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 p-8 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-accent via-primary to-accent" />
            
            {/* Logo Header */}
            <motion.div 
                className="text-center mb-6"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
            >
                <motion.div 
                    className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-amber-500 text-accent-foreground font-bold text-xl mb-4 shadow-lg shadow-accent/30"
                    whileHover={{ scale: 1.05, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    PR
                </motion.div>
                <h1 className="text-2xl font-bold tracking-tight">Создать аккаунт</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    Зарегистрируйте свою бригаду
                </p>
            </motion.div>

            <Form {...form}>
                <motion.form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    Имя
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="Иван Петров"
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
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" />
                                    Телефон
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="tel"
                                        placeholder="+7 (999) 123-45-67"
                                        disabled={isLoading}
                                        className="h-12 px-4 rounded-xl bg-secondary/30 border-border/50 focus:border-primary/50 focus-visible:ring-primary/20 transition-all"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5" />
                                        Пароль
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

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-medium text-muted-foreground ml-1">
                                        Повтор
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
                    </div>

                    <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.3 }}
                    >
                        <Button
                            type="submit"
                            disabled={isLoading || !form.formState.isValid}
                            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 group mt-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Создать аккаунт
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </motion.div>
                </motion.form>
            </Form>

            <motion.div 
                className="mt-6 text-center text-sm text-muted-foreground"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
            >
                Уже есть аккаунт?{" "}
                <Link
                    href="/auth/login"
                    className="text-primary font-medium hover:text-primary/80 transition-colors"
                >
                    Войти
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
