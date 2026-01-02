"use client";

import Link from "next/link";
import { useState, useEffect, type MouseEvent } from "react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  CreditCard,
  Hammer,
  Heart,
  Link2,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Moon,
  PhoneOff,
  PiggyBank,
  Play,
  Plus,
  Sparkles,
  Star,
  Sun,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/packages/utils";
import { useAuth } from "@/packages/libs/auth";

// --- Данные ---
const navItems = [
  { label: "Как работает", href: "#how-it-works" },
  { label: "Возможности", href: "#features" },
  { label: "Фотоотчеты", href: "#reports" },
  { label: "Тарифы", href: "#pricing" },
];

const problems = [
  {
    title: "Где мои деньги?",
    desc: "Объект вроде прибыльный, а в конце копейки остались. Чеки потерялись, кто сколько взял — непонятно.",
    icon: Wallet,
    gradient: "from-rose-500 to-orange-500",
    bg: "bg-rose-500/10",
  },
  {
    title: "Как быстро и красиво отчитаться перед клиентом?",
    desc: "Клиент звонит каждый день: «Что сделали?», «Скинь фото». Переписки в WhatsApp, скриншоты — полный хаос.",
    icon: Camera,
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Сколько кому платить в конце объекта?",
    desc: "«Я думал на другое договаривались!» — скандал с бригадой. Расчет зарплаты вручную занимает полдня.",
    icon: Users,
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-500/10",
  },
];

const features = [
  {
    icon: Wallet,
    title: "Учёт расходов за 3 секунды",
    desc: "Сфоткал чек → выбрал категорию → готово. В любой момент видишь реальную прибыль объекта и сколько осталось в бюджете.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Camera,
    title: "Фотоотчёты клиенту — киллер-фича",
    desc: "Делаешь 5-10 фото → жмёшь кнопку → красивая страница готова. Клиент видит прогресс и ставит реакции вместо звонков.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Автоматический расчёт зарплаты",
    desc: "Объект закрыт — система сама посчитает кому сколько платить. % от прибыли, фикс, за м², за день — любая модель.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: LayoutDashboard,
    title: "Финансовый дашборд",
    desc: "Огромные цифры на главном экране: потрачено, осталось, прибыль объекта, чистая прибыль прораба. Всё прозрачно.",
    gradient: "from-amber-500 to-orange-500",
  },
];

const stats = [
  { value: "10-20%", label: "Рост прибыли", icon: "📈" },
  { value: "3 сек", label: "Добавить расход", icon: "⚡" },
  { value: "1 клик", label: "Отчёт клиенту", icon: "📸" },
];

const pricingPlans = [
  {
    name: "Лайт",
    price: "490",
    earlyBirdPrice: "290",
    period: "/мес",
    subtitle: "Одиночки, тест",
    perks: [
      "1 активный проект",
      "1 участник команды",
      "500 МБ хранилища",
      "Базовый функционал",
      "Email поддержка (24 часа)",
    ],
    gradient: "from-slate-500 to-slate-600",
  },
  {
    name: "Прораб",
    price: "990",
    earlyBirdPrice: "690",
    period: "/мес",
    subtitle: "Частные прорабы",
    perks: [
      "До 4 активных проектов",
      "До 3 участников команды",
      "2 ГБ хранилища",
      "Расчёты зарплаты",
      "Фотоотчёты",
      "Приоритетная поддержка (8 часов)",
      "Учёт рабочего времени",
      "Аналитика по проектам",
    ],
    featured: true,
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    name: "Бригада",
    price: "1990",
    earlyBirdPrice: "1490",
    period: "/мес",
    subtitle: "Первые 500 бригад 🔥",
    perks: [
      "Неограниченное количество проектов",
      "До 10 участников команды",
      "10 ГБ хранилища",
      "API доступ",
      "Выделенная поддержка",
      "Расширенная аналитика",
      "Приоритетные обновления",
      "История изменений",
    ],
    best: true,
    gradient: "from-amber-500 to-orange-500",
  },
];

const testimonials = [
  {
    name: "Сергей К.",
    role: "Прораб, Москва",
    text: "Раньше в конце объекта всегда был минус. Теперь вижу реальную прибыль каждый день. Это реально делает меня богаче на 15-20% с каждого объекта.",
    avatar: "СК",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    name: "Дмитрий В.",
    role: "Бригадир, СПб",
    text: "Клиенты сами смотрят отчёты и ставят реакции. Звонки сократились в 3 раза. Я наконец-то могу сосредоточиться на работе, а не на переписках.",
    avatar: "ДВ",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const howItWorksSteps = [
  {
    number: "01",
    title: "Создай объект",
    desc: "Название, адрес, бюджет. Готово за 2 минуты. Можно прямо на стройке.",
    icon: Plus,
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    number: "02",
    title: "Добавляй расходы",
    desc: "Сфоткал чек → выбрал категорию → готово. 3 секунды на каждый расход.",
    icon: Camera,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    number: "03",
    title: "Отчитайся клиенту",
    desc: "5-10 фото → комментарий → ссылка готова. Клиент видит прогресс и ставит реакции.",
    icon: Link2,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    number: "04",
    title: "Закрой объект",
    desc: "Система сама посчитает зарплату каждому. Копируй расчёт в WhatsApp — готово.",
    icon: Check,
    gradient: "from-amber-500 to-orange-500",
  },
];

const beforeAfter = {
  before: [
    {
      text: "Чеки теряются, расходы непонятны",
      icon: X,
    },
    {
      text: "Клиент звонит каждый день «Что сделали?»",
      icon: X,
    },
    {
      text: "Расчёт зарплаты вручную занимает полдня",
      icon: X,
    },
    {
      text: "В конце объекта непонятно сколько заработал",
      icon: X,
    },
    {
      text: "10-20% прибыли теряется в хаосе",
      icon: X,
    },
  ],
  after: [
    {
      text: "Каждый расход с фото чека и категорией",
      icon: Check,
    },
    {
      text: "Клиент сам смотрит отчёты, ставит реакции",
      icon: Check,
    },
    {
      text: "Автоматический расчёт зарплаты за 2 секунды",
      icon: Check,
    },
    {
      text: "Видишь реальную прибыль в любой момент",
      icon: Check,
    },
    {
      text: "10-20% дополнительной прибыли с каждого объекта",
      icon: Check,
    },
  ],
};

// --- Анимации ---
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const pulseGlow = {
  boxShadow: [
    "0 0 20px rgba(59, 130, 246, 0.3)",
    "0 0 40px rgba(59, 130, 246, 0.5)",
    "0 0 20px rgba(59, 130, 246, 0.3)",
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// --- Уникальная кнопка ---
interface GlowButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

function GlowButton({ children, href, variant = "primary", size = "md", className, onClick }: GlowButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-semibold transition-all duration-300 overflow-hidden group";
  
  const sizeStyles = {
    sm: "h-9 px-4 text-sm rounded-xl",
    md: "h-11 px-6 text-sm rounded-xl",
    lg: "h-13 px-8 text-base rounded-2xl",
  };

  const variantStyles = {
    primary: "bg-linear-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-linear-to-r from-accent to-amber-500 text-accent-foreground shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98]",
    ghost: "bg-transparent hover:bg-secondary/50 text-foreground",
    outline: "bg-transparent border-2 border-border hover:border-primary/50 hover:bg-primary/5 text-foreground",
  };

  const content = (
    <>
      {/* Shimmer effect */}
      {(variant === "primary" || variant === "secondary") && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );

  const allStyles = cn(baseStyles, sizeStyles[size], variantStyles[variant], className);

  if (href) {
    return <Link href={href} className={allStyles}>{content}</Link>;
  }

  return <button onClick={onClick} className={allStyles}>{content}</button>;
}

// --- Phone Mockup ---
function PhoneMockup() {
  return (
    <motion.div
      className="relative w-[300px] h-[620px] mx-auto"
      initial={{ opacity: 0, y: 60, rotateX: 10 }}
      animate={{
        opacity: 1,
        y: [0, -15, 0],
        rotateX: 0
      }}
      transition={{
        opacity: { duration: 1.2, delay: 0.2 },
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        },
        rotateX: { duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }
      }}
    >
      {/* Glow */}
      <div className="absolute -inset-12 bg-linear-to-br from-primary/40 via-accent/30 to-primary/40 blur-3xl opacity-50 animate-pulse-slow" />
      
      {/* Frame */}
      <div className="relative bg-linear-to-b from-gray-800 to-gray-900 rounded-[3.5rem] p-3 shadow-2xl shadow-black/50 border border-gray-700/50">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />
        
        {/* Screen */}
        <div className="relative bg-background rounded-[2.8rem] overflow-hidden h-[590px]">
          {/* Status bar */}
          <div className="h-14 bg-card/90 backdrop-blur-xl flex items-center justify-between px-8 pt-3">
            <span className="text-xs font-semibold">9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 flex items-center justify-center">
                <div className="w-3 h-1.5 border border-foreground/70 rounded-sm relative">
                  <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-1 bg-foreground/70 rounded-r-full" />
                  <div className="h-full w-3/4 bg-success rounded-sm" />
                </div>
              </div>
            </div>
          </div>
          
          {/* App header */}
          <div className="px-5 py-4 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-accent to-amber-500 flex items-center justify-center font-bold text-accent-foreground shadow-lg shadow-accent/30">
                  PR
                </div>
                <div>
                  <p className="font-bold text-sm">Бригада Сергея</p>
                  <p className="text-xs text-muted-foreground">3 активных объекта</p>
                </div>
              </div>
              <motion.div 
                className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
              </motion.div>
            </div>
          </div>
          
          {/* Project card */}
          <div className="p-5 space-y-4">
            <motion.div 
              className="bg-card rounded-3xl p-5 border border-border/30 shadow-xl shadow-black/5"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Hammer className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">Квартира на Ленина</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">ул. Ленина 45, кв. 12</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-linear-to-r from-primary to-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "68%" }}
                        transition={{ delay: 1.1, duration: 1 }}
                      />
                    </div>
                    <span className="text-xs font-bold text-primary">68%</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/30 flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Прибыль</p>
                  <p className="font-bold text-lg text-success">+365 000 ₽</p>
                </div>
                <motion.div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.4, type: "spring" }}
                >
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  <span className="text-xs font-medium text-red-500">3</span>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className="bg-card rounded-2xl p-4 border border-border/30">
                <p className="text-xs text-muted-foreground">Сегодня</p>
                <p className="font-bold text-lg text-destructive">-12 400 ₽</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border/30">
                <p className="text-xs text-muted-foreground">Отчётов</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg">5</p>
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Activity */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {[
                { icon: Camera, text: "Отчёт отправлен", time: "2 мин", color: "text-blue-500", bg: "bg-blue-500/10" },
                { icon: Wallet, text: "Расход -4 500 ₽", time: "15 мин", color: "text-amber-500", bg: "bg-amber-500/10" },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + i * 0.15 }}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", item.bg)}>
                    <item.icon className={cn("w-4 h-4", item.color)} />
                  </div>
                  <p className="text-xs font-medium flex-1">{item.text}</p>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* FAB */}
          <motion.div 
            className="absolute bottom-6 right-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-blue-600 shadow-xl shadow-primary/40 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Report Mockup ---
function ReportMockup() {
  return (
    <motion.div 
      className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/30 shadow-2xl overflow-hidden max-w-sm mx-auto"
      variants={scaleIn}
    >
      {/* Header */}
      <div className="bg-linear-to-br from-primary via-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0L15 30M0 15L30 15' stroke='white' stroke-opacity='0.1'/%3E%3C/svg%3E\")" }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-lg">
              PR
            </div>
            <div>
              <p className="font-bold">Бригада Сергея</p>
              <p className="text-sm text-white/70">Фотоотчёт • 15 апреля</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "68%" }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />
            </div>
            <span className="text-sm font-bold">68%</span>
          </div>
        </div>
      </div>
      
      {/* Photos */}
      <div className="p-4 grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div 
            key={i}
            className="aspect-square rounded-xl bg-linear-to-br from-secondary to-muted relative overflow-hidden group cursor-pointer"
            whileHover={{ scale: 1.05, zIndex: 10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {i <= 3 && (
              <motion.div 
                className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
              >
                <Heart className="w-3 h-3 text-white fill-white" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Comment */}
      <div className="px-4 pb-3">
        <p className="text-sm text-muted-foreground italic">
          "Закончили укладку плитки в санузле. Завтра затирка швов."
        </p>
      </div>
      
      {/* Reactions */}
      <div className="px-4 pb-4 flex items-center gap-3">
        <div className="flex -space-x-1">
          <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-lg border-2 border-card">
            <Heart className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg border-2 border-card">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        </div>
        <span className="text-sm text-muted-foreground">Клиент доволен</span>
      </div>
      
      {/* CTA */}
      <div className="p-4 border-t border-border/30">
        <GlowButton variant="primary" size="lg" className="w-full">
          <MessageCircle className="w-4 h-4" />
          Написать прорабу
        </GlowButton>
      </div>
    </motion.div>
  );
}

// --- Главный компонент ---
export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => (event: MouseEvent) => {
    event.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative bg-background text-foreground">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl"
          animate={{ 
            x: [0, -80, 0], 
            y: [0, -60, 0],
            scale: [1, 1.15, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Navigation */}
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "bg-background/70 backdrop-blur-2xl border-b border-border/30 shadow-lg shadow-black/5" : ""
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <nav className="container mx-auto px-4 h-18 flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-linear-to-br from-accent to-amber-500 flex items-center justify-center font-bold text-accent-foreground shadow-lg shadow-accent/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              PR
            </motion.div>
            <span className="font-bold text-lg tracking-tight">ProRab.space</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleNavClick(item.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group py-2"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-primary to-blue-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <motion.button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {mounted && (
                  <motion.div
                    key={isDark ? "moon" : "sun"}
                    initial={{ y: 10, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: -10, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {!isAuthLoading && (
              user ? (
                <GlowButton href="/dashboard" variant="primary" size="sm">
                  <LayoutDashboard className="w-4 h-4" />
                  Дашборд
                </GlowButton>
              ) : (
                <>
                  <GlowButton href="/auth/login" variant="ghost" size="sm">
                    Войти
                  </GlowButton>
                  <GlowButton href="/auth/register" variant="primary" size="sm">
                    Начать бесплатно
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </GlowButton>
                </>
              )
            )}
          </div>

          {/* Mobile menu */}
          <button
            className="md:hidden w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/30"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="container mx-auto px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick(item.href)}
                    className="block py-2 text-lg font-medium text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-4 border-t border-border/30 space-y-3">
                  {!isAuthLoading && (
                    user ? (
                      <GlowButton href="/dashboard" variant="primary" className="w-full">
                        <LayoutDashboard className="w-4 h-4" />
                        Дашборд
                      </GlowButton>
                    ) : (
                      <>
                        <GlowButton href="/auth/login" variant="outline" className="w-full">
                          Войти
                        </GlowButton>
                        <GlowButton href="/auth/register" variant="primary" className="w-full">
                          Начать бесплатно
                        </GlowButton>
                      </>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main>
        {/* Hero */}
        <section className="relative min-h-screen flex items-center pt-20">
          <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
              {/* Content */}
              <motion.div
                className="text-center lg:text-left"
                initial="hidden"
                animate="visible"
                variants={stagger}
              >
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent/10 border border-accent/30 text-sm mb-8"
                  variants={fadeIn}
                >
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="font-medium">Спецпредложение: тариф «Бригада» за 1 490 ₽/мес по Early Bird цене</span>
                </motion.div>

                <motion.h1 
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight"
                  variants={fadeIn}
                >
                  Управление{" "}
                  <br className="hidden sm:block" />
                  стройкой{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-blue-500 to-indigo-500">
                    без хаоса
                  </span>
                </motion.h1>

                <motion.p
                  className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0"
                  variants={fadeIn}
                >
                  Единственное приложение в СНГ, которое решает ровно ТРИ самые дорогие боли прораба одновременно:
                  учёт денег, фотоотчёты клиенту и расчёт зарплаты бригаде.
                </motion.p>

                <motion.div
                  className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start"
                  variants={fadeIn}
                >
                  {!isAuthLoading && (
                    user ? (
                      <GlowButton href="/dashboard" variant="primary" size="lg">
                        <LayoutDashboard className="w-5 h-5" />
                        Перейти к дашборду
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </GlowButton>
                    ) : (
                      <GlowButton href="/auth/register" variant="primary" size="lg">
                        Попробовать бесплатно
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </GlowButton>
                    )
                  )}
                  <GlowButton href="#features" variant="outline" size="lg">
                    <Play className="w-5 h-5" />
                    Как это работает
                  </GlowButton>
                </motion.div>

                {/* Stats */}
                <motion.div 
                  className="mt-14 grid grid-cols-3 gap-8"
                  variants={fadeIn}
                >
                  {stats.map((stat, i) => (
                    <motion.div 
                      key={i} 
                      className="text-center lg:text-left"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <p className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-500">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Phone */}
              <div className="relative order-first lg:order-last lg:pl-20 xl:pl-32">
                <PhoneMockup />
              </div>
            </div>
          </div>

          {/* Scroll */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="text-xs text-muted-foreground">Листай вниз</span>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </section>

        {/* Problems */}
        <section className="py-24 lg:py-32 relative">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center max-w-2xl mx-auto mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Три боли, которые съедают прибыль
              </h2>
              <p className="text-lg text-muted-foreground">
                Именно эти проблемы делают прорабов на 10-20% беднее с каждого объекта
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-3 gap-6 lg:gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              {problems.map((problem, i) => (
                <motion.div
                  key={i}
                  className="relative p-8 rounded-3xl bg-card border border-border/30 hover:border-border/60 transition-all duration-300 group overflow-hidden cursor-pointer"
                  variants={fadeIn}
                  whileHover={{
                    y: -12,
                    scale: 1.02,
                    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Gradient bg on hover */}
                  <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br", problem.gradient, "opacity-5")} />

                  {/* Animated gradient border */}
                  <motion.div
                    className={cn("absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl bg-linear-to-br", problem.gradient)}
                    initial={false}
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  <motion.div
                    className={cn("relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6", problem.bg)}
                    whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
                  >
                    <problem.icon className={cn("w-8 h-8 bg-linear-to-br bg-clip-text", problem.gradient)} style={{ color: 'currentColor' }} />
                  </motion.div>
                  <h3 className="relative text-xl font-bold mb-3">{problem.title}</h3>
                  <p className="relative text-muted-foreground">{problem.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 lg:py-32 bg-secondary/20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center max-w-2xl mx-auto mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-sm text-primary mb-6">
                <Zap className="w-4 h-4" />
                Как это работает
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Простой процесс — быстрый результат
              </h2>
              <p className="text-lg text-muted-foreground">
                От создания объекта до финального расчёта — всё интуитивно и быстро
              </p>
            </motion.div>

            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              {howItWorksSteps.map((step, i) => (
                <motion.div
                  key={i}
                  className="relative p-6 rounded-3xl bg-card border border-border/30 hover:border-border/60 transition-all duration-300 group overflow-hidden"
                  variants={fadeIn}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
                  }}
                >
                  {/* Step number */}
                  <div className="absolute top-6 right-6 text-6xl font-bold opacity-5 group-hover:opacity-10 transition-opacity">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <motion.div
                    className={cn("relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white bg-linear-to-br shadow-lg", step.gradient)}
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 0.4 }
                    }}
                  >
                    <step.icon className="w-7 h-7" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="relative text-lg font-bold mb-2">{step.title}</h3>
                  <p className="relative text-sm text-muted-foreground">{step.desc}</p>

                  {/* Arrow connector (except last) */}
                  {i < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-border to-transparent" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 lg:py-32 bg-linear-to-b from-secondary/30 to-background">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center max-w-2xl mx-auto mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-sm text-primary mb-6">
                <Zap className="w-4 h-4" />
                Возможности
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Всё что нужно. Ничего лишнего
              </h2>
              <p className="text-lg text-muted-foreground">
                Это НЕ упрощённая версия PlanRadar. Это инструмент, который реально используется каждый день.
              </p>
            </motion.div>

            <motion.div 
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  className="group p-6 lg:p-8 rounded-3xl bg-card border border-border/30 hover:border-transparent hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 relative overflow-hidden cursor-pointer"
                  variants={fadeIn}
                  whileHover={{
                    y: -12,
                    scale: 1.03,
                    transition: { duration: 0.3, type: "spring", stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Gradient border on hover */}
                  <div className={cn("absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-px bg-linear-to-br", feature.gradient)}>
                    <div className="absolute inset-px rounded-[calc(1.5rem-1px)] bg-card" />
                  </div>

                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    initial={false}
                  >
                    <div className={cn("absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shine_1.5s_ease-in-out]")} />
                  </motion.div>

                  <motion.div
                    className={cn("relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white bg-linear-to-br shadow-lg", feature.gradient)}
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 0.4 }
                    }}
                  >
                    <feature.icon className="w-7 h-7" />
                  </motion.div>
                  <h3 className="relative text-lg font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="relative text-sm text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Before/After */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center max-w-2xl mx-auto mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                До и После ProRab.space
              </h2>
              <p className="text-lg text-muted-foreground">
                Как меняется работа прораба с нашим инструментом
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-5xl mx-auto">
              {/* Before Column */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInLeft}
                className="space-y-6"
              >
                <div className="text-center lg:text-left mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500/10 text-red-500 text-sm font-semibold mb-4">
                    <X className="w-4 h-4" />
                    Было
                  </div>
                  <h3 className="text-2xl font-bold text-muted-foreground">
                    Хаос и потерянная прибыль
                  </h3>
                </div>

                <motion.div
                  className="space-y-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={stagger}
                >
                  {beforeAfter.before.map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10"
                      variants={fadeIn}
                    >
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4 text-red-500" strokeWidth={3} />
                      </div>
                      <p className="text-muted-foreground">{item.text}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* After Column */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInRight}
                className="space-y-6"
              >
                <div className="text-center lg:text-left mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-500 text-sm font-semibold mb-4">
                    <Check className="w-4 h-4" strokeWidth={3} />
                    Стало
                  </div>
                  <h3 className="text-2xl font-bold">
                    Порядок и реальная прибыль
                  </h3>
                </div>

                <motion.div
                  className="space-y-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={stagger}
                >
                  {beforeAfter.after.map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors"
                      variants={fadeIn}
                      whileHover={{ scale: 1.02, x: 4 }}
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4 text-emerald-500" strokeWidth={3} />
                      </div>
                      <p className="font-medium">{item.text}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>

            {/* CTA in the middle */}
            <motion.div
              className="text-center mt-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <p className="text-lg text-muted-foreground mb-6">
                Результат: <span className="font-bold text-emerald-500">10-20% дополнительной прибыли</span> с каждого объекта
              </p>
              {!isAuthLoading && !user && (
                <GlowButton href="/auth/register" variant="primary" size="lg">
                  Начать зарабатывать больше
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </GlowButton>
              )}
            </motion.div>
          </div>
        </section>

        {/* Reports */}
        <section id="reports" className="py-24 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInLeft}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-500/10 text-sm text-blue-500 mb-6">
                  <Camera className="w-4 h-4" />
                  Killer Feature
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  За что прорабы готовы платить сразу же
                </h2>
                <p className="text-lg text-muted-foreground mb-10">
                  Делаешь фото → жмёшь кнопку → клиент получает красивую страницу с прогрессом.
                  Ставит реакции вместо звонков. Ты экономишь часы каждую неделю.
                </p>

                <div className="space-y-5">
                  {/* Link feature */}
                  <motion.div 
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0 }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-linear-to-br from-blue-500 to-cyan-500 shadow-lg">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <p className="font-medium">Одна ссылка навсегда — клиент видит всю историю</p>
                  </motion.div>

                  {/* Reactions feature */}
                  <motion.div 
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-linear-to-br from-rose-500 to-pink-500 shadow-lg">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium">Реакции вместо звонков</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                          <Heart className="w-3 h-3 text-white fill-white" />
                        </span>
                        <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </span>
                        <span className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
                          <span className="text-white text-xs font-bold">?</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Message feature */}
                  <motion.div 
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-linear-to-br from-emerald-500 to-teal-500 shadow-lg">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <p className="font-medium">Кнопка связи — сразу в WhatsApp или Telegram</p>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInRight}
              >
                <ReportMockup />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 lg:py-32 bg-linear-to-b from-background to-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center max-w-2xl mx-auto mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent/10 text-sm text-accent-foreground mb-6">
                <CreditCard className="w-4 h-4 text-accent" />
                Простые тарифы
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Простые и честные тарифы
              </h2>
              <p className="text-lg text-muted-foreground mb-2">
                Спецпредложение для первых 500 бригад: тариф «Бригада» за 1 490 ₽/мес по Early Bird цене (вместо 1 990 ₽)
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary font-medium">
                <Zap className="w-4 h-4" />
                14 дней бесплатного пробного периода для всех тарифов
              </div>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              {pricingPlans.map((plan, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "relative p-8 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col h-full",
                    plan.best
                      ? "bg-card border-2 border-primary/50 shadow-2xl shadow-primary/10"
                      : "bg-card border-border/30 hover:border-border/60"
                  )}
                  variants={fadeIn}
                  whileHover={{
                    y: -12,
                    scale: 1.02,
                    transition: { duration: 0.3, type: "spring", stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  animate={plan.best ? {
                    boxShadow: [
                      "0 20px 60px rgba(59, 130, 246, 0.15)",
                      "0 20px 80px rgba(59, 130, 246, 0.25)",
                      "0 20px 60px rgba(59, 130, 246, 0.15)",
                    ]
                  } : {}}
                  transition={plan.best ? {
                    boxShadow: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  } : {}}
                >
                  {plan.best && (
                    <motion.div
                      className={cn("absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-white text-xs font-bold bg-linear-to-r shadow-lg", plan.gradient)}
                      animate={{
                        scale: [1, 1.05, 1],
                        y: [0, -2, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      🔥 Лучший выбор
                    </motion.div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                  </div>

                  <div className="mb-8">
                    {plan.earlyBirdPrice ? (
                      <>
                        <span className="text-lg text-muted-foreground line-through mr-2">
                          {plan.price} ₽
                        </span>
                        <span className="text-5xl font-bold">{plan.earlyBirdPrice}</span>
                        <span className="text-muted-foreground"> ₽{plan.period}</span>
                        <div className="text-sm text-amber-600 dark:text-amber-400 mt-1 font-medium">
                          Early Bird: экономия {Number(plan.price.replace(/\s/g, '')) - Number(plan.earlyBirdPrice.replace(/\s/g, ''))} ₽/мес
                        </div>
                        <div className="text-sm text-primary mt-2 font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          14 дней бесплатно
                        </div>
                      </>
                    ) : (
                      <>
                        {plan.oldPrice && (
                          <span className="text-lg text-muted-foreground line-through mr-2">
                            {plan.oldPrice} ₽
                          </span>
                        )}
                        <span className="text-5xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground"> ₽{plan.period}</span>
                        <div className="text-sm text-primary mt-2 font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          14 дней бесплатно
                        </div>
                      </>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.perks.map((perk, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-success" />
                        </div>
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <GlowButton
                    href={user ? "/dashboard" : "/auth/register"}
                    variant={plan.best ? "secondary" : plan.featured ? "primary" : "outline"}
                    className="w-full mt-auto"
                  >
                    {user ? "Открыть дашборд" : plan.best ? "Начать бесплатно" : "Выбрать план"}
                  </GlowButton>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center max-w-2xl mx-auto mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Прорабы уже используют
              </h2>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  className="p-8 rounded-3xl bg-card border border-border/30"
                  variants={fadeIn}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white bg-linear-to-br shadow-lg", t.gradient)}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">"{t.text}"</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <motion.div 
              className="relative rounded-[2.5rem] overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              {/* BG */}
              <div className="absolute inset-0 bg-linear-to-br from-primary via-blue-600 to-indigo-600" />
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
              
              <div className="relative p-10 md:p-20 text-center">
                <motion.h2
                  className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
                  variants={fadeIn}
                >
                  Инструмент, который делает прорабов богаче
                </motion.h2>
                <motion.p
                  className="text-lg lg:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
                  variants={fadeIn}
                >
                  Реально на 10-20% с каждого объекта. Начните бесплатно — платите когда будете готовы.
                </motion.p>
                <motion.div variants={fadeIn}>
                  {!isAuthLoading && (
                    user ? (
                      <GlowButton
                        href="/dashboard"
                        variant="secondary"
                        size="lg"
                        className="shadow-2xl"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Перейти к дашборду
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </GlowButton>
                    ) : (
                      <GlowButton
                        href="/auth/register"
                        variant="secondary"
                        size="lg"
                        className="shadow-2xl"
                      >
                        Создать аккаунт бесплатно
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </GlowButton>
                    )
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 lg:py-16 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-accent to-amber-500 flex items-center justify-center font-bold text-accent-foreground shadow-lg">
                PR
              </div>
              <span className="font-bold text-lg">ProRab.space</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Политика
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Оферта
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Поддержка
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2025 ProRab.space
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
