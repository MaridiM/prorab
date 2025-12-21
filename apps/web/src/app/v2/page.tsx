"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { 
  Hammer, 
  Ruler, 
  HardHat, 
  Truck, 
  BrickWall, 
  Scroll, 
  Zap, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight,
  Menu,
  X,
  Play,
  Star,
  ShieldCheck,
  TrendingUp,
  Users,
  Search,
  MoreHorizontal,
  Plus
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/packages/utils";

// --- Design System Tokens ---
// Primary: #FF6B00 (Construction Orange)
// Dark: #0A0A0A (Asphalt)
// Surface: #171717 (Dark Concrete)
// Accent: #FACC15 (Safety Yellow)

const COLORS = {
  primary: "#FF6B00",
  dark: "#0A0A0A",
  surface: "#171717",
  accent: "#FACC15"
};

// --- Components ---

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        scrolled ? "bg-[#0A0A0A]/80 backdrop-blur-xl border-white/10" : ""
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "circOut" }}
    >
      <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center transform rotate-3 shadow-lg shadow-orange-600/20">
            <Hammer className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-mono tracking-tighter">
            PRORAB<span className="text-orange-500">.V2</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Возможности", "Для кого", "Тарифы"].map((item) => (
            <a key={item} href={`#${item}`} className="text-sm font-medium text-gray-400 hover:text-white transition-colors uppercase tracking-widest">
              {item}
            </a>
          ))}
          <a
            href="/auth/register"
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-none uppercase tracking-wider text-sm transition-all hover:scale-105 active:scale-95 skew-x-[-10deg]"
          >
            <span className="block skew-x-[10deg]">Начать Работу</span>
          </a>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div 
          className="md:hidden absolute top-full left-0 right-0 bg-[#0A0A0A] border-b border-white/10 p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col gap-4">
             {["Возможности", "Для кого", "Тарифы"].map((item) => (
              <a key={item} href={`#${item}`} className="text-lg font-bold text-gray-300 py-2">
                {item}
              </a>
            ))}
             <a
              href="/auth/register"
              className="w-full text-center px-6 py-3 bg-orange-600 text-white font-bold uppercase"
            >
              Начать Бесплатно
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

// --- Dashboard Mockup ---

function DashboardMockup() {
  return (
    <motion.div 
      className="relative w-full max-w-[320px] mx-auto bg-gray-900 rounded-[3rem] p-3 shadow-2xl border border-gray-800"
      initial={{ y: 100, opacity: 0, rotateX: 20 }}
      animate={{ y: 0, opacity: 1, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      {/* Notch & Camera */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-20" />
      
      {/* Screen */}
      <div className="bg-[#0F0F10] rounded-[2.5rem] overflow-hidden h-[650px] relative text-white">
        {/* Status Bar */}
        <div className="h-12 flex justify-between items-center px-6 pt-2 text-xs font-medium text-gray-400">
          <span>9:41</span>
          <div className="flex gap-1">
             <div className="w-4 h-2.5 bg-white rounded-[2px]" />
          </div>
        </div>

        {/* App Content */}
        <div className="p-5 space-y-6 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">Доброе утро,</p>
              <h3 className="text-lg font-bold">Алексей 👋</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center text-orange-500 font-bold border border-orange-500/30">
              AK
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-50"><Briefcase size={16} className="text-blue-500" /></div>
              <p className="text-2xl font-bold mt-2">3</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Активных</p>
            </div>
            <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-50"><TrendingUp size={16} className="text-emerald-500" /></div>
              <p className="text-2xl font-bold mt-2 text-emerald-500">+1.2M</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Прибыль</p>
            </div>
          </div>

          {/* Active Project Card */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-sm">Текущие Объекты</h4>
              <Search size={16} className="text-gray-500" />
            </div>
            
            <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/5 shadow-lg group hover:border-orange-500/30 transition-colors">
              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center text-orange-500">
                  <Hammer size={20} />
                </div>
                <div>
                   <h5 className="font-bold text-sm">ЖК "Притяжение"</h5>
                   <p className="text-xs text-gray-500">ул. Ленина, 45</p>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">Активен</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Прогресс</span>
                  <span className="font-bold text-orange-500">68%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-[68%] bg-gradient-to-r from-orange-600 to-amber-500 rounded-full" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                 <div className="flex-1 bg-white/5 rounded-lg py-2 flex flex-col items-center">
                    <span className="text-[10px] text-gray-500">Бюджет</span>
                    <span className="font-bold text-xs">4.5 млн</span>
                 </div>
                 <div className="flex-1 bg-white/5 rounded-lg py-2 flex flex-col items-center">
                    <span className="text-[10px] text-gray-500">Расход</span>
                    <span className="font-bold text-xs text-orange-500">3.1 млн</span>
                 </div>
              </div>
            </div>
            
             <div className="bg-[#1C1C1E] mt-3 rounded-2xl p-4 border border-white/5 opacity-60 scale-95 origin-top">
                <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-gray-500">
                  <Briefcase size={20} />
                </div>
                <div>
                   <h5 className="font-bold text-sm">Офис IT-Park</h5>
                   <p className="text-xs text-gray-500">Невский пр. 1</p>
                </div>
              </div>
             </div>
          </div>

          {/* Quick Actions (Floating) */}
          <div className="absolute bottom-6 right-6">
             <div className="w-14 h-14 bg-gradient-to-r from-orange-600 to-amber-500 rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center text-white">
                <Plus size={28} />
             </div>
          </div>
        </div>
        
        {/* Bottom Nav */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#1C1C1E]/90 backdrop-blur-xl border-t border-white/5 flex justify-around items-center px-2 pb-2">
           <div className="p-3 text-orange-500"><Zap size={24} fill="currentColor" /></div>
           <div className="p-3 text-gray-600"><Briefcase size={24} /></div>
           <div className="p-3 text-gray-600"><Users size={24} /></div>
           <div className="p-3 text-gray-600"><MoreHorizontal size={24} /></div>
        </div>
      </div>
    </motion.div>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#0A0A0A]">
      {/* Blueprint Grid Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #333 1px, transparent 1px),
            linear-gradient(to bottom, #333 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
        }}
      />
      
      {/* Orange Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 mx-auto lg:mx-0"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-300 uppercase tracking-widest">Система управления стройкой 2.0</span>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Стройка <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500">
             Под Контролем
            </span>
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 mb-12 font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Сметы, снабжение, отчеты и финансы в одном приложении. 
            Создано строителями для строителей.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
             <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(234,88,12,0.5)] skew-x-[-10deg]"
            >
              <div className="skew-x-[10deg] flex items-center justify-center gap-2">
                Попробовать Бесплатно <ArrowRight size={20} />
              </div>
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-lg uppercase tracking-wider transition-all border border-white/10 backdrop-blur-sm skew-x-[-10deg]">
               <div className="skew-x-[10deg] flex items-center justify-center gap-2">
                <Play size={20} fill="currentColor" /> Демо Видео
              </div>
            </button>
          </motion.div>
        </div>
        
        {/* Mockup Column */}
        <div className="hidden lg:block relative z-20">
           <DashboardMockup />
           {/* Decorative Elements around Mockup */}
           <motion.div 
              style={{ y: y2 }}
              className="absolute -top-10 -right-10 bg-gradient-to-br from-orange-600 to-amber-500 p-4 rounded-2xl shadow-2xl z-30"
           >
              <div className="flex items-center gap-2 font-bold text-black text-sm">
                 <CheckCircle2 size={24} />
                 <span>Смета согласована</span>
              </div>
           </motion.div>
           
           <motion.div 
              style={{ y: y1 }}
              className="absolute top-1/2 -left-10 bg-[#1C1C1E] border border-white/10 p-4 rounded-2xl shadow-2xl z-30 max-w-[180px]"
           >
              <p className="text-xs text-gray-500 mb-1">Прибыль за месяц</p>
              <p className="text-xl font-black text-emerald-500">+450 000 ₽</p>
           </motion.div>
        </div>
      </div>

      {/* Floating Elements (Parallax) */}
      <motion.div style={{ y: y1 }} className="absolute top-1/4 right-[10%] opacity-20 hidden lg:block pointer-events-none">
        <Scroll size={200} strokeWidth={1} />
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute bottom-1/4 left-[10%] opacity-20 hidden lg:block pointer-events-none">
        <HardHat size={180} strokeWidth={1} />
      </motion.div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      className="group relative bg-[#171717] p-8 border border-white/5 hover:border-orange-500/50 transition-colors duration-500"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="w-14 h-14 bg-orange-500/10 rounded-none flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
        <Icon className="text-orange-500 w-7 h-7" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide group-hover:text-orange-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 leading-relaxed font-light">
        {desc}
      </p>
    </motion.div>
  );
}

function Features() {
  const features = [
    { icon: Briefcase, title: "Управление Проектами", desc: "Все объекты как на ладони. Статусы, сроки, ответственные - полный контроль над ситуацией." },
    { icon: Ruler, title: "Точные Сметы", desc: "Составляйте сметы за минуты. База расценок, коэффициенты, автоматический расчет маржинальности." },
    { icon: Truck, title: "Снабжение", desc: "Заявки на материалы, контроль доставок, чеки и отчетность перед заказчиком в один клик." },
    { icon: Users, title: "Команда", desc: "Распределение задач между прорабами и мастерами. Учет рабочего времени и расчет зарплат." },
    { icon: TrendingUp, title: "Финансы", desc: "Движение денег по каждому объекту. Кассовые разрывы, прибыль и расходы в реальном времени." },
    { icon: ShieldCheck, title: "Документы", desc: "Автоматическая генерация договоров, актов и счетов. Порядок в бумагах - порядок на стройке." },
  ];

  return (
    <section className="py-24 bg-[#0A0A0A] relative border-t border-white/5" id="features">
       <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <span className="text-orange-500 font-bold tracking-widest uppercase text-sm mb-2 block">Функционал</span>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase leading-none">
                Инструменты <br />Профессионалов
              </h2>
            </div>
            <div className="h-px bg-white/20 flex-1 hidden md:block relative top-[-10px] mx-8" />
            <p className="text-gray-400 max-w-sm text-right">
              Мы собрали всё, что нужно для эффективного управления строительным бизнесом в одном месте.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.1} />
            ))}
          </div>
       </div>
    </section>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div className="text-center">
      <div className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter">
        {value}
      </div>
      <div className="text-sm text-orange-500 font-bold uppercase tracking-widest">
        {label}
      </div>
    </div>
  )
}

function Stats() {
  return (
    <section className="py-20 bg-orange-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
           <StatItem value="3x" label="Рост Эффективности" />
           <StatItem value="-20%" label="Потерь Материалов" />
           <StatItem value="15м" label="На создание сметы" />
           <StatItem value="100%" label="Контроль Сроков" />
        </div>
      </div>
    </section>
  )
}

function PricingCard({ plan, price, perks, featured = false }: { plan: string, price: string, perks: string[], featured?: boolean }) {
  return (
    <div className={cn(
      "relative p-8 h-full flex flex-col",
      featured 
        ? "bg-white text-black" 
        : "bg-[#171717] border border-white/10 text-white"
    )}>
      {featured && (
        <div className="absolute top-0 right-0 bg-orange-600 text-white text-xs font-bold px-3 py-1 uppercase">
          Популярный
        </div>
      )}
      
      <h3 className="text-2xl font-bold uppercase mb-2">{plan}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-black">{price}</span>
        <span className={FEATURED_TEXT_CLASS(featured, "opacity-60")}>/мес</span>
      </div>

      <div className="h-px bg-current opacity-20 mb-6" />

      <ul className="space-y-4 mb-8 flex-1">
        {perks.map((perk, i) => (
          <li key={i} className="flex items-center gap-3">
             <CheckCircle2 size={18} className={featured ? "text-orange-600" : "text-orange-500"} />
             <span className={FEATURED_TEXT_CLASS(featured, "font-medium")}>{perk}</span>
          </li>
        ))}
      </ul>

      <button className={cn(
        "w-full py-4 font-bold uppercase tracking-wider transition-all",
        featured 
          ? "bg-black text-white hover:bg-gray-800" 
          : "bg-white/10 hover:bg-white/20 text-white"
      )}>
        Выбрать
      </button>
    </div>
  )
}

const FEATURED_TEXT_CLASS = (featured: boolean, base: string) => featured ? `text-black ${base}` : `text-gray-400 ${base}`; 

function Pricing() {
  return (
    <section className="py-24 bg-[#0A0A0A]" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-orange-500 font-bold tracking-widest uppercase text-sm mb-2 block">Стоимость</span>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase">
            Честные Тарифы
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <PricingCard 
            plan="Бригадир" 
            price="990 ₽" 
            perks={["До 3 объектов", "Сметы и Акты", "База поставщиков", "1 пользователь"]} 
          />
          <PricingCard 
            plan="Прораб" 
            price="2 490 ₽" 
            featured={true}
            perks={["До 10 объектов", "Складской учет", "Финансовые отчеты", "До 5 пользователей", "Техподдержка 24/7"]} 
          />
          <PricingCard 
            plan="Компания" 
            price="5 990 ₽" 
            perks={["Безлимит объектов", "API интеграции", "Личный менеджер", "Брендирование отчетов", "Безлимит пользователей"]} 
          />
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-24 bg-[#111] relative overflow-hidden">
       {/* Stripes */}
       <div className="absolute inset-0 pointer-events-none" 
            style={{ 
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)' 
            }} 
       />

       <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-8xl font-black text-white uppercase mb-8 leading-[0.9]">
            Построй Свой <br /> 
            <span className="text-orange-600">Бизнес</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Хватит терять деньги и время. Начни использовать профессиональный инструмент уже сегодня.
          </p>
          
          <Link
              href="/auth/register"
              className="inline-block px-12 py-5 bg-white text-black font-black text-xl uppercase tracking-widest transition-transform hover:scale-105 skew-x-[-10deg]"
            >
              <span className="block skew-x-[10deg]">Регистрация</span>
          </Link>
       </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#050505] text-white py-12 border-t border-white/5">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
           <Hammer className="text-orange-600" />
           <span className="font-bold text-xl tracking-tight">PRORAB.SPACE</span>
        </div>
        <div className="text-gray-500 text-sm">
          © {new Date().getFullYear()} Все права защищены. Сделано профессионалами.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-orange-600 transition-colors">Политика</a>
          <a href="#" className="hover:text-orange-600 transition-colors">Оферта</a>
        </div>
      </div>
    </footer>
  )
}

export default function PageV2() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans selection:bg-orange-500 selection:text-white">
      <NavBar />
      <Hero />
      <Stats />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
