"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Bell,
  Camera,
  Check,
  CheckCheck,
  Hammer,
  Heart,
  Link2,
  Menu,
  MessageCircle,
  PhoneOff,
  PiggyBank,
  Plus,
  Send,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/packages/components";
import { cn } from "@/packages/utils";

// --- Данные ---
const navItems = [
  { label: "Возможности", href: "#features" },
  { label: "Фотоотчеты", href: "#reports" },
  { label: "Тарифы", href: "#pricing" },
];

const problems = [
  {
    title: "Куда ушли деньги?",
    desc: "Вроде объект жирный, а в конце денег нет. Чеки потерялись в бардачке, переводы смешались с личными картами.",
    icon: PiggyBank,
    accent: "text-destructive bg-destructive/10",
  },
  {
    title: 'Клиент "достает"',
    desc: 'Постоянные звонки: "Что сделали?", "Почему так дорого?", "Скинь фото". Тратишь часы на WhatsApp переписки.',
    icon: PhoneOff,
    accent: "text-yellow-600 bg-accent/20",
  },
  {
    title: "Разборки с бригадой",
    desc: 'В конце объекта начинается: "Я думал мы договаривались на другую сумму". Расчет зарплаты занимает полдня.',
    icon: Users,
    accent: "text-primary bg-primary/10",
  },
];

const reportHighlights = [
  {
    title: "Одна ссылка навсегда",
    desc: "Клиент открывает ссылку и видит всю историю стройки.",
    icon: Link2,
  },
  {
    title: "Реакции вместо звонков",
    desc: "Клиент ставит лайки фотоотчетам. Ты видишь, что всё ок.",
    icon: Heart,
  },
];

const financeRows = [
  { label: "Сумма договора", value: "3 200 000 ₽" },
  { label: "Потрачено", value: "- 2 145 000 ₽", danger: true },
  { label: "Твоя чистая прибыль", value: "365 000 ₽", success: true },
];

const salaryMembers = [
  { name: "Вася (Плитка)", value: "87 400 ₽" },
  { name: "Петя (Штукатурка)", value: "74 200 ₽" },
];

const feedItems = [
  {
    icon: Hammer,
    title: "Петрович (Штукатурка)",
    subtitle: "Материалы",
    value: "- 4 500 ₽",
  },
  {
    icon: Camera,
    title: "Отчет отправлен",
    subtitle: "Клиент посмотрел",
    value: "",
    success: true,
  },
];

const pricingPlans = [
  {
    name: "Лайт",
    price: "490 ₽",
    period: "/мес",
    subtitle: "Для одиночек и теста",
    perks: ["1 активный объект", "Только вы (1 участник)", "Учет расходов", "Фотоотчеты"],
    ctaVariant: "outline" as const,
  },
  {
    name: "Прораб",
    price: "990 ₽",
    period: "/мес",
    subtitle: "Частные прорабы",
    perks: ["До 4 активных объектов", "До 3 участников бригады", "Расчет зарплаты", "Все функции"],
    featured: true,
  },
  {
    name: "Бригада",
    price: "990 ₽",
    oldPrice: "1 990 ₽",
    period: "/мес",
    subtitle: "Спецпредложение (вечная цена)",
    perks: ["Безлимит объектов", "До 10 участников", "Полный финансовый контроль", "Управление ролями"],
    best: true,
  },
];

const teamOptions = ["Бригада Сергея (Вы)", "Димон Строй", "Колян Север"];

// --- Анимационные варианты (Variants) ---

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

const containerStagger: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// --- Утилиты ---

function scrollToHash(href: string) {
  const target = document.querySelector(href);
  if (target) {
    target.scrollIntoView({ behavior: "smooth" });
  }
}

// --- Компонент ---

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (href: string) => (event: MouseEvent) => {
    event.preventDefault();
    scrollToHash(href);
    setMobileOpen(false);
  };

  return (
    <div className="relative overflow-x-hidden bg-background text-foreground">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="#" className="group flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-accent text-accent-foreground text-sm font-bold transition-transform duration-300 group-hover:rotate-12">
              PR
            </div>
            <span className="text-xl font-bold tracking-tight transition-colors duration-300 group-hover:text-primary">
              ProRab.space
            </span>
          </Link>

          <div className="hidden gap-6 text-sm font-medium text-muted-foreground md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick(item.href)}
                className="relative transition-colors duration-300 hover:text-foreground after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Button variant="ghost" size="sm" className="text-sm font-medium hover:underline hover:text-primary duration-300">
              Войти
            </Button>
            <Button
              size="sm"
              className="text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/25"
            >
              Попробовать бесплатно
            </Button>
          </div>

          <button
            className="p-2 text-muted-foreground transition-colors duration-300 hover:text-foreground md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Открыть меню"
          >
            <Menu className="h-6 w-6 transition-transform duration-300 hover:scale-110" />
          </button>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-background px-4 py-4 shadow-lg overflow-hidden"
          >
            <div className="space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick(item.href)}
                  className="block text-sm font-medium transition-colors duration-200 hover:pl-2 hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 pt-4">
              <Button variant="outline" className="w-full transition-all duration-300 hover:shadow-md">
                Войти
              </Button>
              <Button className="w-full transition-all duration-300 hover:shadow-md hover:shadow-primary/20">
                Начать работу
              </Button>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            
            {/* Hero Text */}
            <motion.div 
              className="z-10 text-center lg:w-1/2 lg:text-left"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
            >
              <div className="mb-6 inline-flex cursor-default items-center rounded-full border border-accent/50 bg-accent/10 px-3 py-1 text-sm font-medium text-accent-foreground animate-pulse-slow transition-colors duration-300 hover:bg-accent/20">
                <span className="mr-2 flex h-2 w-2 rounded-full bg-accent" />
                Релиз MVP 1.0 уже в апреле
              </div>
              <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground lg:text-6xl">
                Где твои деньги,{" "}
                <span className="group relative inline-block text-primary">
                  прораб?
                  <svg
                    className="absolute -bottom-1 left-0 z-[-1] h-3 w-full text-accent transition-all duration-500 group-hover:scale-x-110"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                  </svg>
                </span>
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground lg:mx-0">
                Единственное приложение, которое решает три главные боли: учет реальной прибыли, быстрые отчеты клиенту и расчет зарплаты бригаде без скандалов.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button className="h-12 px-8 text-lg font-semibold transition-all duration-300 shadow-lg shadow-primary/25 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 active:scale-95">
                  Создать первый объект
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                >
                  <Send className="h-5 w-5 text-primary" />
                  Демо в Telegram
                </Button>
              </div>
              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground lg:justify-start">
                <Check className="h-4 w-4 text-success" />
                Бесплатный тариф для одиночек
              </p>
            </motion.div>

            {/* Hero Phone Image */}
            <div className="relative flex justify-center lg:w-1/2">
              <motion.div 
                 className="absolute left-1/2 top-1/2 -z-10 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
                 animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
                 transition={{ duration: 5, repeat: Infinity }}
              />
              
              <motion.div 
                className="mobile-screen relative h-[560px] w-[280px] bg-background"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInRight}
                // Дополнительная плавающая анимация через Framer
                animate={{ y: [0, -15, 0] }}
                transition={{ 
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <div className="mobile-notch" />
                <div className="bg-primary px-4 pb-4 pt-8 text-primary-foreground transition-colors duration-300">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-bold">ProRab.space</span>
                    <Bell className="h-5 w-5 cursor-pointer transition-colors duration-300 hover:scale-110 hover:text-accent" />
                  </div>
                  <div className="text-sm opacity-90">Прибыль за апрель</div>
                  <div className="text-3xl font-bold">+ 365 000 ₽</div>
                </div>
                <div className="space-y-4 overflow-hidden p-4">
                  <div className="group cursor-pointer rounded-xl border border-border p-3 shadow-sm transition-colors duration-300 hover:-translate-y-1 hover:bg-secondary/20">
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-semibold transition-colors duration-300 group-hover:text-primary">Кв. на Ленина 45</span>
                      <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs text-success">В работе</span>
                    </div>
                    <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-primary transition-all duration-1000 ease-out group-hover:opacity-80" style={{ width: "68%" }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Готовность: 68%</span>
                      <span className="font-medium text-destructive">- 15 400 ₽ (расход)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/20 p-3 text-center transition-all duration-300 hover:scale-105 hover:bg-accent/30">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform duration-300 group-hover:scale-110">
                        <Camera className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium text-accent-foreground">Отчет клиенту</span>
                    </div>
                    <div className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 p-3 text-center transition-all duration-300 hover:scale-105 hover:bg-secondary/70">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                        <Plus className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium">Расход</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase text-muted-foreground">Сегодня</div>
                    {feedItems.map((item) => (
                      <div
                        key={item.title}
                        className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-all duration-200 hover:translate-x-1 hover:bg-secondary/50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary text-muted-foreground">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium">{item.title}</div>
                          <div className="text-[10px] text-muted-foreground">{item.subtitle}</div>
                        </div>
                        {item.success ? (
                          <CheckCheck className="h-4 w-4 text-success" />
                        ) : (
                          <div className="text-xs font-bold text-foreground">{item.value}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="mb-12 text-center text-3xl font-bold"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Знакомая ситуация?
          </motion.h2>
          <motion.div 
            className="grid gap-8 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerStagger}
          >
            {problems.map((item) => {
              const Icon = item.icon;
              return (
                // Обертка для анимации появления Framer
                <motion.div key={item.title} variants={fadeIn}>
                   {/* Внутренний блок для Hover эффектов Tailwind */}
                  <div
                    className="group relative h-full cursor-default rounded-2xl border border-border bg-background p-6 
                              shadow-sm transition-[all,transform] duration-300 ease-out 
                              hover:-translate-y-2 hover:border-primary/30 
                              hover:shadow-2xl hover:shadow-primary/10"
                  >
                    <div
                      className={cn(
                        "mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl transition-transform duration-300 ease-out group-hover:rotate-12 group-hover:scale-110",
                        item.accent,
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Reports Section */}
      <section id="reports" className="overflow-hidden py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            
            {/* Reports Visual */}
            <motion.div 
              className="relative order-2 md:order-1 md:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
            >
              <div className="absolute -inset-4 rounded-full bg-accent/20 blur-2xl opacity-50 animate-pulse-slow" />
              <div className="relative mx-auto max-w-md cursor-pointer rotate-[-2deg] rounded-2xl border border-border bg-card p-6 shadow-xl transition-all duration-700 hover:rotate-0 hover:scale-105 hover:shadow-2xl">
                <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-accent font-bold">БС</div>
                  <div>
                    <div className="text-sm font-bold">Бригада Сергея</div>
                    <div className="text-xs text-muted-foreground">Квартира на Ленина 45</div>
                  </div>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <div className="group flex aspect-video items-center justify-center rounded-lg bg-muted text-muted-foreground transition-transform duration-500">
                    <Camera className="h-6 w-6 transition-transform duration-500 group-hover:scale-125" />
                  </div>
                  <div className="group flex aspect-video items-center justify-center rounded-lg bg-muted text-muted-foreground transition-transform duration-500">
                    <Camera className="h-6 w-6 transition-transform duration-500 group-hover:scale-125" />
                  </div>
                </div>
                <p className="mb-4 rounded-lg bg-secondary/50 p-3 text-sm text-foreground">
                  Закончили черновую электрику. Завтра приступаем к штукатурке стен. Материал завезли.
                </p>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-green-100 text-green-700 transition-colors duration-300 hover:bg-green-200" variant="secondary" size="sm">
                    <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                    Супер
                  </Button>
                  <Button className="flex-1 transition-colors duration-300 hover:bg-secondary/80" variant="secondary" size="sm">
                    <MessageCircle className="h-4 w-4" />
                    Написать
                  </Button>
                </div>
              </div>
              
              {/* Floating badge animated with Framer */}
              <motion.div 
                className="absolute -bottom-6 -right-6 rounded-xl border border-border bg-background p-4 shadow-lg animate-bounce"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <div className="flex items-center gap-2 font-bold text-success">
                  <ShieldCheck className="h-5 w-5" />
                  Клиент доволен!
                </div>
              </motion.div>
            </motion.div>

            {/* Reports Text */}
            <motion.div 
              className="order-1 md:order-2 md:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
            >
              <div className="mb-4 inline-block rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground shadow-sm">
                Твоя главная фишка
              </div>
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                Фотоотчеты клиенту <br />
                <span className="text-primary">в один клик</span>
              </h2>
              <p className="mb-6 text-lg text-muted-foreground">
                Забудь про гигабайты фоток в WhatsApp. Сделай пару кадров в приложении, надиктуй комментарий голосом — и ProRab сам создаст красивую веб-страницу для клиента.
              </p>
              <ul className="space-y-4">
                {reportHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title} className="group flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary transition-transform duration-300 group-hover:scale-125 group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <strong className="block text-foreground transition-colors duration-300 group-hover:text-primary">{item.title}</strong>
                        <span className="text-sm text-muted-foreground">{item.desc}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-secondary/20 py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="mx-auto mb-16 max-w-3xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Полный контроль над финансами</h2>
            <p className="text-lg text-muted-foreground">Ты строитель, а не бухгалтер. Мы сделали учет максимально простым.</p>
          </motion.div>

          <div className="grid gap-10 md:grid-cols-2">
            {/* Finance Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
            >
               <div className="group h-full rounded-2xl border border-border bg-background p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary text-2xl transition-transform duration-500 group-hover:rotate-[360deg]">
                  <Wallet className="h-6 w-6" />
                </div>
                <h3 className="mb-4 text-2xl font-bold transition-colors duration-300 group-hover:text-primary">Реальная прибыль</h3>
                <div className="mb-6 space-y-4">
                  {financeRows.map((row) => (
                    <div
                      key={row.label}
                      className={cn(
                        "flex items-center justify-between border-b border-border pb-2 text-sm",
                        row.success && "rounded-lg border-none bg-success/10 p-3 text-success-foreground text-base font-semibold group-hover:bg-success/20",
                        row.danger && "text-destructive",
                      )}
                    >
                      <span className={cn("text-muted-foreground", row.success && "text-success-foreground")}>{row.label}</span>
                      <span className={cn("font-semibold", row.success && "text-success", row.danger && "text-destructive")}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Добавляй расходы за 3 секунды. Фотографируй чеки. Система сама посчитает, сколько денег осталось.
                </p>
              </div>
            </motion.div>

            {/* Salary Card */}
            <motion.div
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               variants={fadeInRight}
            >
              <div className="group h-full rounded-2xl border border-border bg-background p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20 text-yellow-600 text-2xl transition-transform duration-500 group-hover:rotate-[360deg]">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-4 text-2xl font-bold transition-colors duration-300 group-hover:text-yellow-600">Зарплата бригады</h3>
                <div className="mb-6 space-y-3">
                  {salaryMembers.map((member) => (
                    <div
                      key={member.name}
                      className="flex items-center gap-3 rounded p-2 transition-all duration-300 hover:translate-x-1 hover:bg-secondary/50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs">{member.name[0]}</div>
                      <div className="flex-1 text-sm">{member.name}</div>
                      <div className="text-sm font-bold">{member.value}</div>
                    </div>
                  ))}
                  <div className="mt-4 border-t border-border pt-3">
                    <Button variant="outline" className="w-full transition-all duration-300 hover:shadow-md active:scale-95">
                      Скопировать расчет в WhatsApp
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Настрой типы оплаты: % от объекта, за м², по дням или фиксированно. Одна кнопка в конце объекта — и расчет готов.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Switching Section */}
      <section className="border-y border-border py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <motion.div 
              className="md:w-2/3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
            >
              <h3 className="mb-4 text-2xl font-bold">Идеально для «текучки» и фриланса</h3>
              <p className="mb-4 text-muted-foreground">Мы знаем рынок. Один мастер может работать в трех бригадах одновременно.</p>
              <div className="rounded-lg border-l-4 border-primary bg-secondary/30 p-4 text-sm transition-colors duration-300 hover:bg-secondary/50">
                <span className="font-bold text-foreground">Как это работает:</span> Прораб — хозяин бригады. Мастера — приглашенные участники. Мастер видит только свои задачи и не видит твои деньги. Мастер может быть участником хоть в 10 разных бригадах, переключаясь между ними в один клик.
              </div>
            </motion.div>
            
            <motion.div 
              className="flex justify-center md:w-1/3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={zoomIn}
            >
              <div className="w-full max-w-xs cursor-default transform rounded-lg border border-border bg-background p-4 shadow-sm transition-transform duration-500 hover:scale-110 hover:shadow-xl">
                <div className="mb-2 text-xs text-muted-foreground">Переключение бригад</div>
                {teamOptions.map((option, idx) => (
                  <div
                    key={option}
                    className={cn(
                      "flex items-center justify-between rounded p-2 transition-colors",
                      idx === 0 ? "bg-secondary/50 hover:bg-secondary" : "opacity-80 hover:bg-secondary/30 hover:opacity-100",
                    )}
                  >
                    <span className={cn("font-bold", idx !== 0 && "font-medium")}>{option}</span>
                    {idx === 0 && <Check className="h-4 w-4 text-primary" />}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="mb-16 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Простые тарифы</h2>
            <p className="text-muted-foreground">Инвестиция, которая отбивается с первого сэкономленного чека.</p>
          </motion.div>

          <motion.div 
            className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerStagger}
          >
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeIn}
                // Используем custom classname в motion, но hover оставляем tailwind'у
                className="h-full" 
              >
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-2xl border border-border bg-background p-6 shadow-sm transition-all duration-500",
                    plan.featured && "hover:-translate-y-4 hover:border-primary hover:shadow-xl",
                    plan.best && "z-10 -translate-y-4 border-2 border-accent bg-primary/5 shadow-xl hover:scale-105 hover:shadow-2xl hover:shadow-accent/30",
                  )}
                >
                  {plan.best && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-sm font-bold text-accent-foreground shadow-sm animate-pulse-slow">
                      Хит продаж
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <div className={cn("text-3xl font-bold", plan.best && "text-accent-foreground")}>
                        {plan.price}
                        <span className="text-base font-normal text-muted-foreground">{plan.period}</span>
                      </div>
                      {plan.oldPrice ? <div className="text-sm text-muted-foreground line-through">{plan.oldPrice}</div> : null}
                    </div>
                    <p className={cn("mt-2 text-sm text-muted-foreground", plan.best && "text-red-500 font-medium")}>{plan.subtitle}</p>
                  </div>
                  <ul className="mb-8 flex-1 space-y-3 text-sm text-muted-foreground">
                    {plan.perks.map((perk) => (
                      <li key={perk} className={cn("flex items-center gap-2", plan.best && "font-medium text-foreground")}>  <Check className={cn("h-4 w-4 text-primary", plan.best && "text-accent text-lg")} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full transition-all duration-300 active:scale-95" variant={plan.ctaVariant ?? "default"} size="lg">
                    {plan.best ? "Забрать со скидкой" : plan.featured ? "Попробовать" : "Выбрать"}
                  </Button>
                  {plan.best ? <p className="mt-3 text-center text-xs text-muted-foreground">Предложение для первых 500 бригад</p> : null}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="group flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white font-bold text-foreground transition-transform duration-500 group-hover:rotate-[360deg]">
                PR
              </div>
              <span className="text-xl font-bold transition-colors duration-300 group-hover:text-gray-200">ProRab.space</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a className="transition-colors duration-300 hover:text-white" href="#">
                Оферта
              </a>
              <a className="transition-colors duration-300 hover:text-white" href="#">
                Конфиденциальность
              </a>
              <a className="transition-colors duration-300 hover:text-white" href="#">
                Поддержка
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center md:text-left">
            <div className="grid gap-8 md:grid-cols-2">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInLeft}
              >
                <h4 className="mb-4 text-lg font-bold">Начни зарабатывать на 10-20% больше</h4>
                <p className="max-w-md text-gray-400">Просто начни учитывать всё в одном месте. Это бесплатно для первого объекта.</p>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center gap-4 md:items-end"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInRight}
              >
                <Button className="h-12 w-full px-8 text-lg font-bold transition-all duration-300 bg-accent text-accent-foreground hover:scale-105 hover:shadow-xl hover:shadow-accent/30 active:scale-95 md:w-auto">
                  Зарегистрироваться
                </Button>
                <p className="text-sm text-gray-500">© 2025 ProRab.space. Все права защищены.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}