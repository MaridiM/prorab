"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue, 
  useMotionTemplate, 
  AnimatePresence 
} from "framer-motion";
import { 
  ArrowUpRight, 
  Zap, 
  Activity, 
  Layers, 
  Shield, 
  Cpu, 
  Box, 
  Terminal, 
  Menu, 
  X,
  CreditCard,
  CheckCircle,
  Hammer,
  Scroll
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/packages/utils";

// --- Design Tokens (Hyper-Industrial) ---
const THEME = {
  colors: {
    bg: "#050505",
    surface: "#0A0A0A",
    surfaceHighlight: "#111111",
    primary: "#FF3300", // Neon Orange
    text: "#E5E5E5",
    textDim: "#666666",
    border: "#222222",
  },
  fonts: {
    mono: "font-mono",
    sans: "font-sans",
  }
};

// --- Utilities ---
const useMousePosition = () => {
  const mouse = { x: useMotionValue(0), y: useMotionValue(0) };
  
  useEffect(() => {
    const updateMouse = (e: MouseEvent) => {
      mouse.x.set(e.clientX);
      mouse.y.set(e.clientY);
    };
    window.addEventListener("mousemove", updateMouse);
    return () => window.removeEventListener("mousemove", updateMouse);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return mouse;
};

// --- Components ---

// 1. Noise Overlay
const NoiseOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] mix-blend-overlay">
    <svg width="100%" height="100%">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
);

// 2. Magnetic Button
interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "outline" | "ghost";
}

const MagneticButton = ({ children, className, onClick, href, variant = "primary" }: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
    const center = { x: left + width / 2, y: top + height / 2 };
    const distance = { x: clientX - center.x, y: clientY - center.y };
    
    x.set(distance.x * 0.35);
    y.set(distance.y * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={cn(
        "relative inline-flex items-center justify-center px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest transition-all duration-300 group cursor-pointer overflow-hidden",
        variant === "primary" && "bg-[#FF3300] text-black hover:bg-white",
        variant === "outline" && "border border-[#333] text-white hover:border-[#FF3300] hover:text-[#FF3300]",
        variant === "ghost" && "text-[#666] hover:text-white",
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return <button onClick={onClick}>{content}</button>;
};

// 3. Grid Background
const GridBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    <div 
      className="absolute inset-0 opacity-[0.15]"
      style={{
        backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
  </div>
);

// 4. Marquee
const Marquee = ({ text }: { text: string }) => {
  return (
    <div className="relative flex overflow-hidden py-4 bg-[#FF3300] text-black font-black uppercase tracking-tighter text-4xl transform -skew-y-2 border-y-4 border-black">
      <motion.div 
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {Array(10).fill(text).map((t, i) => (
          <span key={i} className="mx-8">{t}</span>
        ))}
      </motion.div>
    </div>
  );
};

// 5. Reveal Text
function RevealText({ children, delay = 0, className }: { children: string, delay?: number, className?: string }) {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: "100%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        className={cn("block", className)}
      >
        {children}
      </motion.div>
    </div>
  );
}

// 6. Bento Card
function BentoCard({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "bg-[#0A0A0A] border border-[#222] p-8 relative group overflow-hidden hover:border-[#FF3300]/50 transition-colors",
        className
      )}
    >
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-[#444] group-hover:border-[#FF3300] transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-[#444] group-hover:border-[#FF3300] transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-[#444] group-hover:border-[#FF3300] transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-[#444] group-hover:border-[#FF3300] transition-colors" />
      
      {children}
    </motion.div>
  );
}

// --- Sections ---

function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-[#222] bg-[#050505]/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
           <div className="w-8 h-8 bg-[#FF3300] flex items-center justify-center font-bold text-black text-xs font-mono group-hover:rotate-180 transition-transform duration-500">
             PR
           </div>
           <span className="font-mono font-bold tracking-widest text-[#E5E5E5]">PRORAB.V3</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-12">
           {["Mission", "Technology", "Pricing"].map(item => (
             <a key={item} href={`#${item.toLowerCase()}`} className="font-mono text-xs uppercase tracking-[0.2em] text-[#666] hover:text-[#FF3300] transition-colors">
               {item}
             </a>
           ))}
           <div className="w-px h-8 bg-[#222]" />
           <MagneticButton href="/auth/login" variant="ghost" className="px-4">Log in</MagneticButton>
           <MagneticButton href="/auth/register" variant="primary" className="px-6 h-10 text-xs">Get Access</MagneticButton>
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: "100vh" }}
             exit={{ opacity: 0, height: 0 }}
             className="md:hidden bg-[#050505] border-t border-[#222] overflow-hidden"
           >
              <div className="flex flex-col p-6 gap-6">
                {["Mission", "Technology", "Pricing"].map(item => (
                  <Link key={item} href={`#${item.toLowerCase()}`} className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#666] uppercase" onClick={() => setOpen(false)}>
                    {item}
                  </Link>
                ))}
                <div className="h-px bg-[#222] my-4" />
                <MagneticButton href="/auth/register" variant="primary" className="w-full">Get Access</MagneticButton>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col justify-center overflow-hidden">
      <GridBackground />
      
      <div className="container mx-auto px-6 relative z-10">
         <div className="flex flex-col items-start max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-8 border border-[#333] px-4 py-2 rounded-full bg-[#0A0A0A]"
            >
               <span className="w-2 h-2 bg-[#FF3300] animate-pulse rounded-full" />
               <span className="font-mono text-xs text-[#666] tracking-widest uppercase">System version 3.0 stable</span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.8] tracking-tighter text-[#E5E5E5] mb-12 mix-blend-exclusion">
               <RevealText delay={0.1}>CONSTRUCTION</RevealText>
               <RevealText delay={0.2} className="text-[#333]">INTELLIGENCE</RevealText>
               <RevealText delay={0.3}>PLATFORM</RevealText>
            </h1>

            <div className="flex flex-col md:flex-row gap-12 items-end w-full">
               <p className="font-mono text-[#666] text-sm md:text-base max-w-md leading-relaxed border-l-2 border-[#FF3300] pl-6">
                  Engineered for absolute control over complex construction workflows. 
                  Financial precision, inventory tracking, and team synchronization in a unified interface.
               </p>
               
               <div className="flex flex-wrap gap-4">
                  <MagneticButton href="/auth/register" variant="primary">
                     Deploy Workspace <ArrowUpRight size={16} />
                  </MagneticButton>
                  <MagneticButton variant="outline">
                     Documentation
                  </MagneticButton>
               </div>
            </div>
         </div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity }}
        className="absolute bottom-12 left-6 md:left-12 flex flex-col items-center gap-4"
      >
         <div className="w-[1px] h-24 bg-gradient-to-b from-[#FF3300] to-transparent" />
         <span className="font-mono text-[10px] text-[#666] rotate-180 uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>Scroll to explore</span>
      </motion.div>

      {/* Decorative large text */}
      <motion.div 
        style={{ y }}
        className="absolute top-1/4 right-0 font-black text-[20rem] text-[#0A0A0A] -z-10 leading-none select-none pointer-events-none"
      >
        V3
      </motion.div>
    </section>
  );
}

function Technology() {
  return (
    <section className="py-32 border-t border-[#222] bg-[#050505]" id="technology">
      <div className="container mx-auto px-6">
         <div className="flex items-end justify-between mb-20">
            <div>
               <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">Core <span className="text-[#FF3300]">Modules</span></h2>
               <div className="w-24 h-2 bg-[#FF3300]" />
            </div>
            <p className="font-mono text-[#666] text-right hidden md:block">
              // ARCHITECTURE_V3 <br/>
              // MODULES_LOADED: 4
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#222]">
            {/* Cards */}
            <BentoCard className="lg:col-span-2 aspect-[2/1]">
               <div className="flex justify-between items-start h-full">
                  <div>
                    <div className="w-12 h-12 bg-[#FF3300]/10 flex items-center justify-center text-[#FF3300] mb-6">
                       <Activity size={24} />
                    </div>
                    <h3 className="text-2xl font-bold uppercase mb-2">Financial telemetry</h3>
                    <p className="text-[#666] max-w-sm">Real-time profit/loss calculation with predictive analysis for material overruns.</p>
                  </div>
                  <div className="hidden md:block">
                     <div className="text-4xl font-mono font-bold text-[#FF3300]">+24.5%</div>
                     <div className="text-xs font-mono text-[#666] text-right">AVG. MARGIN</div>
                  </div>
               </div>
            </BentoCard>

            <BentoCard>
               <div className="w-12 h-12 bg-[#333] flex items-center justify-center text-white mb-6">
                  <Box size={24} />
               </div>
               <h3 className="text-xl font-bold uppercase mb-2">Inventory Sync</h3>
               <p className="text-[#666] text-sm">Automated material tracking from supplier to installation.</p>
            </BentoCard>

            <BentoCard>
               <div className="w-12 h-12 bg-[#333] flex items-center justify-center text-white mb-6">
                  <Layers size={24} />
               </div>
               <h3 className="text-xl font-bold uppercase mb-2">Project Stacks</h3>
               <p className="text-[#666] text-sm">Manage multiple sites with unified dashboard views.</p>
            </BentoCard>

            <BentoCard className="lg:col-span-2">
               <div className="flex items-center gap-8">
                  <div className="flex-1">
                     <h3 className="text-2xl font-bold uppercase mb-2">Team Protocol</h3>
                     <p className="text-[#666]">Role-based access control (RBAC) for foremen, workers, and clients with custom permission sets.</p>
                     
                     <div className="mt-8 flex items-center gap-4">
                        <div className="flex -space-x-4">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-10 h-10 rounded-full bg-[#222] border border-[#050505]" />
                           ))}
                        </div>
                        <span className="font-mono text-xs text-[#FF3300]">+ NEW MEMBER</span>
                     </div>
                  </div>
                  <div className="hidden md:block w-px h-32 bg-[#222]" />
                  <div className="hidden md:block">
                     <Shield size={64} className="text-[#111]" />
                  </div>
               </div>
            </BentoCard>
         </div>
      </div>
    </section>
  );
}

function InterfaceShowcase() {
   const containerRef = useRef<HTMLDivElement>(null);
   const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
   const x = useTransform(scrollYProgress, [0, 1], [100, -100]);

   return (
      <section className="py-0 overflow-hidden bg-[#0A0A0A] border-t border-[#222]" ref={containerRef}>
         <Marquee text="SYSTEM INTERFACE • V3.0 • DASHBOARD •" />
         
         <div className="relative h-[80vh] flex items-center justify-center perspective-[2000px] mt-20">
            <motion.div 
              style={{ rotateX: 20, rotateY: -10, x }}
              className="w-[90%] max-w-6xl aspect-video bg-[#050505] border border-[#222] rounded-xl shadow-2xl relative overflow-hidden group"
            >
               {/* Mockup UI */}
               <div className="absolute inset-0 bg-[#050505] p-6">
                  <div className="flex justify-between items-center mb-8 border-b border-[#222] pb-6">
                     <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20" />
                     </div>
                     <div className="font-mono text-xs text-[#444]">/dashboard/main</div>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-6 h-full">
                     <div className="col-span-3 border-r border-[#222] pr-6 space-y-4">
                        <div className="h-8 w-full bg-[#111] rounded" />
                        <div className="h-8 w-3/4 bg-[#111] rounded" />
                        <div className="h-8 w-5/6 bg-[#111] rounded" />
                        <div className="mt-12 h-32 w-full bg-[#111] rounded border border-[#222] p-4 flex flex-col justify-end">
                            <span className="font-mono text-[#444] text-[10px]">CPU USAGE</span>
                            <div className="w-full h-1 bg-[#222] mt-2"><div className="w-[40%] h-full bg-[#FF3300]" /></div>
                        </div>
                     </div>
                     <div className="col-span-9 space-y-6">
                        <div className="grid grid-cols-3 gap-6">
                           <div className="h-32 bg-[#111] rounded border border-[#222]" />
                           <div className="h-32 bg-[#111] rounded border border-[#222]" />
                           <div className="h-32 bg-[#111] rounded border border-[#222]" />
                        </div>
                        <div className="h-64 bg-[#111] rounded border border-[#222] relative overflow-hidden">
                           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#222 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                           <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FF3300]/10 to-transparent" />
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* Reflection */}
               <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            </motion.div>
         </div>
      </section>
   );
}

function Pricing() {
  return (
     <section className="py-32 bg-[#050505] border-t border-[#222]" id="pricing">
        <div className="container mx-auto px-6">
           <h2 className="text-center text-4xl font-black uppercase mb-20 tracking-tighter">
              Deployment <span className="text-[#FF3300]">Options</span>
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Basic */}
              <div className="p-8 border border-[#222] hover:border-[#444] transition-colors bg-[#0A0A0A]">
                  <div className="font-mono text-[#666] text-xs mb-4">/ TIER_01</div>
                  <h3 className="text-3xl font-bold uppercase mb-2">Solo</h3>
                  <div className="text-4xl font-mono text-[#FF3300] mb-8">490₽<span className="text-sm text-[#666]">/mo</span></div>
                  <ul className="space-y-4 mb-12 font-mono text-sm text-[#888]">
                     <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#333]" /> 1 Project slot</li>
                     <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#333]" /> Basic accounting</li>
                     <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#333]" /> Photo reports</li>
                  </ul>
                  <MagneticButton variant="outline" className="w-full">Initialize</MagneticButton>
              </div>

              {/* Pro */}
              <div className="p-8 border border-[#FF3300] bg-[#0A0A0A] relative transform md:-translate-y-4 shadow-[0_0_50px_-20px_rgba(255,51,0,0.3)]">
                  <div className="absolute top-0 right-0 bg-[#FF3300] text-black font-bold text-[10px] px-2 py-1 font-mono uppercase">Recommended</div>
                  <div className="font-mono text-[#666] text-xs mb-4">/ TIER_02</div>
                  <h3 className="text-3xl font-bold uppercase mb-2">Foreman</h3>
                  <div className="text-4xl font-mono text-[#FF3300] mb-8">990₽<span className="text-sm text-[#666]">/mo</span></div>
                  <ul className="space-y-4 mb-12 font-mono text-sm text-[#E5E5E5]">
                     <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#FF3300]" /> Up to 4 projects</li>
                     <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#FF3300]" /> Team access (3 seats)</li>
                     <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#FF3300]" /> Payroll calculation</li>
                     <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#FF3300]" /> Priority node access</li>
                  </ul>
                  <MagneticButton variant="primary" className="w-full">Deploy Now</MagneticButton>
              </div>

              {/* Corp */}
              <div className="p-8 border border-[#222] hover:border-[#444] transition-colors bg-[#0A0A0A]">
                  <div className="font-mono text-[#666] text-xs mb-4">/ TIER_03</div>
                  <h3 className="text-3xl font-bold uppercase mb-2">Corp</h3>
                  <div className="text-4xl font-mono text-[#FF3300] mb-8">990₽<span className="text-sm text-[#666]">/mo</span></div>
                  <p className="font-mono text-xs text-[#666] mb-8">* Limited time offer for early adaptors</p>
                  <ul className="space-y-4 mb-12 font-mono text-sm text-[#888]">
                     <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#333]" /> Unlimited projects</li>
                     <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#333]" /> Full API Access</li>
                     <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#333]" /> Custom domain</li>
                  </ul>
                  <MagneticButton variant="outline" className="w-full">Contact Sales</MagneticButton>
              </div>
           </div>
        </div>
     </section>
  );
}

function Footer() {
   return (
      <footer className="bg-[#020202] border-t border-[#222] py-20 text-[#444]">
         <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-2">
               <div className="font-mono font-bold text-[#E5E5E5] text-2xl mb-6">PRORAB.V3</div>
               <p className="font-mono text-xs max-w-sm leading-relaxed">
                  Advanced construction management logic for modern contractors.
                  Built on high-performance infrastructure.
               </p>
            </div>
            <div>
               <h4 className="font-mono text-xs text-[#E5E5E5] uppercase mb-6 tracking-widest">System</h4>
               <ul className="space-y-4 font-mono text-xs">
                  <li><a href="#" className="hover:text-[#FF3300] transition-colors">Changelog</a></li>
                  <li><a href="#" className="hover:text-[#FF3300] transition-colors">Status</a></li>
                  <li><a href="#" className="hover:text-[#FF3300] transition-colors">Documentation</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-mono text-xs text-[#E5E5E5] uppercase mb-6 tracking-widest">Legal</h4>
               <ul className="space-y-4 font-mono text-xs">
                  <li><a href="#" className="hover:text-[#FF3300] transition-colors">Privacy Protocol</a></li>
                  <li><a href="#" className="hover:text-[#FF3300] transition-colors">Terms of Service</a></li>
               </ul>
            </div>
         </div>
      </footer>
   );
}

export default function PageV3() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5] selection:bg-[#FF3300] selection:text-black">
      <NoiseOverlay />
      <NavBar />
      <Hero />
      <Technology />
      <InterfaceShowcase />
      <Pricing />
      <Footer />
    </div>
  );
}
