"use client"

import { ThemeProvider } from "next-themes"
import { Suspense } from "react"
import { NavigationProgress } from "./navigation-progress"
import { InitialLoader } from "./initial-loader"

interface ProvidersProps {
    children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <InitialLoader />
            <Suspense fallback={null}>
                <NavigationProgress />
            </Suspense>
            {children}
        </ThemeProvider>
    )
}

