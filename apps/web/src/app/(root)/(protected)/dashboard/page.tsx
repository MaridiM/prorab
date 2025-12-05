"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Users,
  FolderKanban,
  Camera,
  Wallet,
  ArrowRight,
  Sparkles
} from "lucide-react"

import { useAuth } from "@/packages/libs/auth"
import { Button } from "@/packages/components"

const features = [
  {
    icon: Users,
    title: "Команды",
    description: "Управление бригадами и участниками",
    gradient: "from-blue-500 to-indigo-500",
    comingSoon: false,
    route: "/teams"
  },
  {
    icon: FolderKanban,
    title: "Проекты",
    description: "Объекты и задачи в работе",
    gradient: "from-emerald-500 to-teal-500",
    comingSoon: false,
    route: "/teams"
  },
  {
    icon: Wallet,
    title: "Расходы",
    description: "Учёт финансов и затрат",
    gradient: "from-amber-500 to-orange-500",
    comingSoon: true
  },
  {
    icon: Camera,
    title: "Фотоотчёты",
    description: "Отчёты для клиентов",
    gradient: "from-violet-500 to-purple-500",
    comingSoon: true
  }
]

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()

  const handleNavigation = (route?: string) => {
    if (route) {
      router.push(route)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        className="border-b border-border/30 bg-card/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Добро пожаловать, {user?.fullName || 'Пользователь'}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Управляйте своими проектами и командами
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* Welcome Card */}
          <motion.div
            className="mb-12 p-8 rounded-3xl bg-linear-to-br from-primary/10 via-blue-500/5 to-purple-500/10 border border-primary/20 relative overflow-hidden"
            variants={fadeIn}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Платформа для прорабов
              </div>
              <h2 className="text-3xl font-bold mb-3">
                Начните работу с ProRab
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Управляйте проектами, отслеживайте расходы и делитесь фотоотчётами с клиентами.
                Всё в одном месте.
              </p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => !feature.comingSoon && handleNavigation(feature.route)}
                className={`
                  p-8 rounded-3xl border border-border/30 bg-card
                  ${!feature.comingSoon ? 'cursor-pointer hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5' : 'opacity-60 cursor-not-allowed'}
                  transition-all duration-300 relative overflow-hidden group
                `}
              >
                {/* Gradient background on hover */}
                <div className={`
                  absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                  bg-linear-to-br ${feature.gradient} opacity-5
                `} />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center mb-6
                    text-white bg-linear-to-br ${feature.gradient} shadow-lg
                  `}>
                    <feature.icon className="w-7 h-7" />
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      {feature.comingSoon && (
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary text-xs font-medium">
                          Скоро
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>

                  {/* Arrow */}
                  {!feature.comingSoon && (
                    <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                      Перейти
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            variants={fadeIn}
            className="mt-12 p-8 rounded-3xl bg-secondary/30 border border-border/30"
          >
            <h3 className="text-lg font-bold mb-4">Быстрые действия</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push("/teams")}
                className="bg-primary hover:bg-primary/90"
              >
                <Users className="w-4 h-4 mr-2" />
                Мои команды
              </Button>
              <Button
                variant="outline"
                disabled
              >
                <FolderKanban className="w-4 h-4 mr-2" />
                Создать проект
              </Button>
              <Button
                variant="outline"
                disabled
              >
                <Wallet className="w-4 h-4 mr-2" />
                Добавить расход
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
