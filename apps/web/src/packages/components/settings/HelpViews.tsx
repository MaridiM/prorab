import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import {
    ArrowLeft,
    CheckCircle2,
    Construction,
    Zap,
    Video,
    RefreshCw,
    Gift,
    MessageCircle,
    CreditCard,
    ChevronRight,
    Shield,
    Bell,
    FolderKanban,
    Users,
    Sparkles
} from 'lucide-react'
import { Button } from '@/packages/components'
import { cn } from '@/packages/utils'
import { MyTeamsDocument } from '@/packages/api/graphql/__generated__/output'
import updatesData from '@/packages/data/updates.json'

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] as any },
    },
}

interface ViewProps {
    onBack: () => void
}

export const QuickStartView = () => {
    const router = useRouter()
    const { data: teamsData } = useQuery(MyTeamsDocument)
    const teams = teamsData?.myTeams || []
    const currentTeam = teams[0] // Get first team

    const handleGoToProjects = () => {
        // If user has a team, go to team's projects page
        // Otherwise go to dashboard where projects are displayed
        if (currentTeam?.id) {
            router.push(`/teams/${currentTeam.id}/projects`)
        } else {
            router.push('/dashboard')
        }
    }

    const steps = [
        {
            title: 'Создайте команду',
            description: 'Назовите свою бригаду и настройте параметры.',
            icon: UsersIcon,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            title: 'Добавьте первый проект',
            description: 'Создайте объект, укажите адрес и клиента.',
            icon: FolderIcon,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
        {
            title: 'Пригласите участников',
            description: 'Отправьте ссылку-приглашение своим мастерам.',
            icon: UserPlusIcon,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            title: 'Создайте отчёт',
            description: 'Загрузите фото и отправьте красивый отчёт клиенту.',
            icon: CameraIcon,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/settings?tab=help">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-xl font-semibold">Быстрый старт</h2>
                    <p className="text-sm text-muted-foreground">Начните работу за 5 минут</p>
                </div>
            </div>

            <div className="grid gap-4">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        className="p-4 rounded-xl border border-border/50 bg-card flex items-start gap-4"
                    >
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", step.bg)}>
                            <step.icon className={cn("w-5 h-5", step.color)} />
                        </div>
                        <div>
                            <h3 className="font-medium text-base mb-1">{index + 1}. {step.title}</h3>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-center mt-8">
                <Button onClick={handleGoToProjects} className="rounded-full px-8">
                    Перейти к проектам <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}

// Иконки для обновлений
const iconMap: Record<string, any> = {
    Gift,
    MessageCircle,
    CreditCard,
    Shield,
    Bell,
    FolderKanban,
    Users,
    Sparkles
}

export const UpdatesView = () => {
    // Загружаем данные обновлений из JSON файла
    // JSON файл генерируется автоматически из CHANGELOG файлов
    const updates = (updatesData as any[]).map(update => ({
        ...update,
        icon: iconMap[update.icon] || Sparkles
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/settings?tab=help">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-xl font-semibold">История обновлений</h2>
                    <p className="text-sm text-muted-foreground">Что нового в ProRab</p>
                </div>
            </div>

            <div className="space-y-6 relative before:absolute before:left-[27px] before:top-4 before:bottom-4 before:w-0.5 before:bg-border/50">
                {updates.map((update, index) => (
                    <motion.div
                        key={index}
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        className="relative pl-16"
                    >
                        <div className={cn("absolute left-0 top-0 w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-background z-10", update.bg)}>
                            <update.icon className={cn("w-6 h-6", update.color)} />
                        </div>
                        <div className="bg-card border border-border/50 rounded-2xl p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                <h3 className="font-semibold text-lg">{update.title}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                                        {update.version}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{update.date}</span>
                                </div>
                            </div>
                            <p className="text-muted-foreground mb-4 text-sm">{update.description}</p>
                            <ul className="space-y-2">
                                {update.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export const UnderDevelopmentView = ({ title }: { title: string }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/settings?tab=help">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">Раздел в разработке</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center bg-card rounded-2xl border border-border/50 border-dashed min-h-[400px]">
                <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-6">
                    <Construction className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Мы работаем над этим!</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                    Этот раздел находится в активной разработке. Мы оповестим вас, когда он станет доступен.
                </p>
                <div className="flex gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/">На главную</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/settings?tab=help&section=updates">Посмотреть обновления</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

// Icons for QuickStart
function UsersIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

function FolderIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
        </svg>
    )
}

function UserPlusIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" x2="19" y1="8" y2="14" />
            <line x1="22" x2="16" y1="11" y2="11" />
        </svg>
    )
}

function CameraIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
        </svg>
    )
}
