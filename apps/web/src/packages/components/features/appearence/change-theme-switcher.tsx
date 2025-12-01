'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/packages/components'
import { cn } from '@/packages/utils'


type IProps = {
    className?: string
    iconClassName?: string
}

export function ChangeThemeSwitcher({ className, iconClassName }: IProps) {
    const { theme, setTheme, systemTheme } = useTheme()
    const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark')

    return (
        <div className={cn('bg-background flex items-center rounded-[7px] p-px', className)}>
            <Button
                variant='outline'
                size='icon'
                className={cn(
                    'size-6 cursor-pointer rounded-md bg-transparent transition-all duration-300 ease-in-out hover:bg-transparent',
                    {
                        'bg-card hover:bg-card rounded-r-[2px] shadow-lg': isDark
                    },
                    className
                )}
                onClick={() => setTheme('dark')}
            >
                <Sun className={cn('!size-4 stroke-yellow-500', iconClassName)} />
            </Button>
            <Button
                variant='outline'
                size='icon'
                className={cn(
                    'size-6 cursor-pointer rounded-md bg-transparent transition-all duration-300 ease-in-out hover:bg-transparent',
                    {
                        'bg-card hover:bg-card rounded-l-[2px] shadow-lg': !isDark
                    },
                    className
                )}
                onClick={() => setTheme('light')}
            >
                <Moon className={cn('!size-4', iconClassName)} />
            </Button>
        </div>
    )
}
