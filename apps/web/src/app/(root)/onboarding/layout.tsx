"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/packages/utils"

export default function OnboardingLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const { theme, setTheme, resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const pathname = usePathname()
	const isWideStep = pathname?.includes('/step-5')

	useEffect(() => {
		setMounted(true)
	}, [])

	const toggleTheme = () => {
		setTheme(resolvedTheme === "dark" ? "light" : "dark")
	}

	const isDark = resolvedTheme === "dark"

	return (
		<div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
			{/* Animated background */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden">
				<motion.div
					className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl"
					animate={{
						x: [0, 100, 0],
						y: [0, 50, 0],
					}}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: "linear"
					}}
				/>
				<motion.div
					className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl"
					animate={{
						x: [0, -80, 0],
						y: [0, -60, 0],
					}}
					transition={{
						duration: 25,
						repeat: Infinity,
						ease: "linear"
					}}
				/>
			</div>

			{/* Header */}
			<header className="relative z-10 flex-none w-full px-6 h-20 flex items-center justify-between">
				{/* Back to home */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<Link
						href="/"
						className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
					>
						<motion.svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="group-hover:-translate-x-1 transition-transform"
						>
							<path d="m12 19-7-7 7-7" />
							<path d="M19 12H5" />
						</motion.svg>
						На главную
					</Link>
				</motion.div>

				{/* Theme Toggle */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.3 }}
				>
					<button
						onClick={toggleTheme}
						className="relative w-12 h-12 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
						aria-label="Toggle theme"
					>
						<AnimatePresence mode="wait">
							{mounted && (
								<motion.div
									key={isDark ? "moon" : "sun"}
									initial={{ y: 20, opacity: 0, rotate: -90 }}
									animate={{ y: 0, opacity: 1, rotate: 0 }}
									exit={{ y: -20, opacity: 0, rotate: 90 }}
									transition={{ duration: 0.2 }}
								>
									{isDark ? (
										<Moon className="w-5 h-5" />
									) : (
										<Sun className="w-5 h-5" />
									)}
								</motion.div>
							)}
						</AnimatePresence>
						<div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
					</button>
				</motion.div>
			</header>

			{/* Main Content */}
			<div className="flex-1 w-full relative z-10 overflow-y-auto overflow-x-hidden">
				<div className="flex min-h-full flex-col items-center justify-center py-8 px-4">
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{
							duration: 0.6,
							ease: [0.22, 0.61, 0.36, 1] as const
						}}
						className={cn(
							"w-full flex flex-col items-center",
							isWideStep ? "max-w-full" : "max-w-[420px]"
						)}
					>
						<div className={cn("w-full", !isWideStep && "max-w-[420px]")}>
							{children}
						</div>

						{/* Footer Links */}
						<motion.div
							className="mt-6 text-center text-xs text-muted-foreground/60"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
						>
							<Link href="#" className="hover:text-muted-foreground transition-colors">
								Политика конфиденциальности
							</Link>{" "}
							<span className="mx-2">•</span>
							<Link href="#" className="hover:text-muted-foreground transition-colors">
								Оферта
							</Link>
						</motion.div>
					</motion.div>
				</div>
			</div>
		</div>
	)
}
