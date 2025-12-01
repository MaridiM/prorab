'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/packages/components'
import { cn } from '@/packages/utils'

interface IProps {
    className?: string
    iconClassName?: string
}

export function ChangeTheme({ className, iconClassName }: IProps) {
    const { theme, setTheme, systemTheme } = useTheme()

    const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark')

    return (
        <Button
            variant='outline'
            size='icon'
            className={cn('border-none bg-transparent transition-all duration-300 ease-in-out', className)}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
            {isDark ? (
                <Sun className={cn('!size-5 stroke-yellow-500', iconClassName)} />
            ) : (
                <Moon className={cn('!size-5', iconClassName)} />
            )}
        </Button>
    )
}
