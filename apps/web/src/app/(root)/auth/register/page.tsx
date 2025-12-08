"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, Variants } from "framer-motion"
import { ArrowRight, Loader2, Mail, Lock, User, Phone } from "lucide-react"
import { useMutation } from "@apollo/client/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button, Card, Input, PasswordInput, Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/packages/components"
import { RegisterDocument } from "@/packages/api/graphql"
import { registerSchema, TRegisterSchema } from "@/packages/schemas"
import { useAutoValidateForm, useToast } from "@/packages/hooks"

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

export default function RegisterPage() {
    const router = useRouter()
    const { success, error } = useToast()

    // React Hook Form with Zod validation
    const form = useForm<TRegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
        },
        mode: 'onTouched',
        reValidateMode: 'onChange'
    })

    // Auto-validate form with debounce
    useAutoValidateForm(form, ['email', 'password', 'confirmPassword', 'fullName', 'phone'])

    // Apollo mutation with typed document and error handling
    const [register, { loading: isLoading }] = useMutation(RegisterDocument, {
        errorPolicy: 'all',
        onError: (apolloError) => {
            // Handle errors that don't make it to response.errors
            const errorMessage = apolloError.message || 'Ошибка регистрации'
            error(errorMessage)
        }
    })

    const onSubmit = async (data: TRegisterSchema) => {
        try {
            const response = await register({
                variables: {
                    input: {
                        email: data.email,
                        password: data.password,
                        fullName: data.fullName,
                        phone: data.phone || null
                    }
                }
            })

            // Handle GraphQL errors (errorPolicy: 'all' returns errors in response.error)
            if (response.error) {
                const errorMessage = response.error.message || 'Ошибка регистрации'
                error(errorMessage)
                return
            }

            // Handle successful registration
            const responseData = response.data?.register
            if (responseData?.user) {
                success(responseData.message || "Аккаунт создан!")
                setTimeout(() => {
                    router.push("/onboarding")
                }, 1000)
            } else if (response.data === null || response.data === undefined) {
                // No data at all - this shouldn't happen with errorPolicy: 'all', but handle it
                error('Ошибка соединения с сервером. Попробуйте еще раз.')
            } else {
                // Unexpected response: no errors but no user data
                error('Неожиданный ответ от сервера. Попробуйте еще раз.')
            }
        } catch (err: any) {
            // Handle network or other errors
            const errorMessage = err?.message || 'Ошибка регистрации'
            error(errorMessage)
        }
    }

    return (
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
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    whileHover={{ scale: 1.05, rotate: -5 }}
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
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    Полное имя
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

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-medium text-muted-foreground ml-1">
                                        Повтор
                                    </FormLabel>
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
    )
}
