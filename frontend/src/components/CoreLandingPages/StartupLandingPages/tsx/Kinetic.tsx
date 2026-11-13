"use client";

import React, { useLayoutEffect, useRef, useEffect, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    MoveUpRight,
    Circle,
    Hexagon,
    Zap,
    Layers,
    Box,
    Menu,
    Plus,
    Minus,
    Send,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calculator,
    ShieldAlert,
    BarChart3,
    ArrowRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { API_BASE_URL } from "@/lib/api";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// 1. Magnetic Button (Sticks to cursor)
export function MagneticButton({ children, className, onClick, ...props }: any) {
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { left, top, width, height } = el.getBoundingClientRect();
            const x = e.clientX - (left + width / 2);
            const y = e.clientY - (top + height / 2);

            gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.5, ease: "power3.out" });
            gsap.to(el.children, { x: x * 0.1, y: y * 0.1, duration: 0.5, ease: "power3.out" });
        };

        const handleMouseLeave = () => {
            gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
            gsap.to(el.children, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
        };

        el.addEventListener("mousemove", handleMouseMove);
        el.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            el.removeEventListener("mousemove", handleMouseMove);
            el.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <button ref={ref} onClick={onClick} className={cn("relative overflow-hidden cursor-pointer", className)} {...props}>
            <div className="relative z-10 pointer-events-none">{children}</div>
        </button>
    );
}

// 2. Parallax Image (Velocity Skew + Scroll Speed)
export function ParallaxImage({ src, speed = 1, className, alt = "Economic Parallax" }: { src: string, speed?: number, className?: string, alt?: string }) {
    const container = useRef<HTMLDivElement>(null);
    const img = useRef<HTMLImageElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(img.current,
                { y: "-20%" },
                {
                    y: "20%",
                    ease: "none",
                    scrollTrigger: {
                        trigger: container.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    }
                }
            );

            ScrollTrigger.create({
                trigger: container.current,
                start: "top bottom",
                end: "bottom top",
                onUpdate: (self) => {
                    const skew = self.getVelocity() / 300;
                    gsap.to(container.current, { skewY: skew, duration: 0.5, ease: "power3.out", overwrite: true });
                }
            });
        }, container);
        return () => ctx.revert();
    }, [speed]);

    return (
        <div ref={container} className={cn("overflow-hidden relative will-change-transform rounded-2xl border border-white/10", className)}>
            <img
                ref={img}
                src={src}
                alt={alt}
                className="w-full h-[140%] object-cover absolute top-[-20%] left-0 will-change-transform grayscale hover:grayscale-0 transition-all duration-700"
            />
        </div>
    );
}

// 3. Navbar
export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-6 mix-blend-difference text-white">
            <Link href="/" className="font-bold text-2xl tracking-tighter uppercase font-mono flex items-center gap-1">
                NAIRA<span className="text-lime-400"> TRACKER</span>
                <span className="text-xs px-2 py-0.5 rounded bg-lime-400/20 text-lime-400 font-mono tracking-normal ml-2 hidden sm:inline-block">LIVE CPI DATA</span>
            </Link>
            <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-mono uppercase tracking-wider text-zinc-300 hover:text-lime-400 transition-colors hidden sm:block">
                    [ Sign In ]
                </Link>
                <Link href="/dashboard">
                    <MagneticButton className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-lime-400 hover:text-black transition-colors uppercase font-mono text-sm font-bold">
                        Open Dashboard <MoveUpRight className="w-4 h-4" />
                    </MagneticButton>
                </Link>
            </div>
        </nav>
    );
}

// 4. Multi-Layer Parallax Hero
export function Hero() {
    const container = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(".layer-bg", {
                yPercent: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: container.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });

            gsap.to(".layer-text", {
                yPercent: 45,
                opacity: 0,
                scale: 0.92,
                ease: "none",
                scrollTrigger: {
                    trigger: container.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });

            gsap.to(".layer-shape", {
                yPercent: -50,
                rotate: 90,
                ease: "none",
                scrollTrigger: {
                    trigger: container.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }, container);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={container} className="relative min-h-screen w-full overflow-hidden bg-black flex items-center justify-center pt-24 pb-16">
            {/* Layer 1: Background Grid */}
            <div className="layer-bg absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[350px] w-[350px] rounded-full bg-lime-400 opacity-25 blur-[120px]"></div>
                <div className="absolute right-0 bottom-0 -z-10 m-auto h-[450px] w-[450px] rounded-full bg-emerald-600 opacity-20 blur-[140px]"></div>
            </div>

            {/* Layer 3: Shapes */}
            <div className="layer-shape absolute top-[20%] left-[10%] text-zinc-800 opacity-40">
                <Circle size={140} strokeWidth={1} />
            </div>
            <div className="layer-shape absolute bottom-[18%] right-[12%] text-zinc-800 opacity-40">
                <Hexagon size={200} strokeWidth={1} />
            </div>

            {/* Layer 2: Main Text */}
            <div className="layer-text relative z-10 text-center mix-blend-difference px-4 max-w-6xl mx-auto">
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 text-lime-400 font-mono text-xs uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                    Real Purchasing Power Depletion Engine
                </div>
                
                <h1 className="text-[12vw] md:text-[9.5vw] font-black uppercase leading-[0.82] tracking-tighter text-white">
                    CURRENCY <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-lime-400 via-emerald-300 to-zinc-600">DEFLATION</span>
                </h1>
                
                <p className="mt-8 text-lg md:text-2xl font-mono text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    Explore published monthly CPI index readings for Nigeria. <br />
                    Compare periods using data with its source and methodology intact.
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-4 font-mono">
                    <Link href="/calculator">
                        <MagneticButton className="px-8 py-4 bg-lime-400 text-black font-black uppercase tracking-widest text-sm rounded-full hover:bg-white hover:text-black transition-all">
                            Calculate Loss [₦]
                        </MagneticButton>
                    </Link>
                    <Link href="/explorer">
                        <MagneticButton className="px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white hover:text-black transition-all">
                            Explore Historical Series
                        </MagneticButton>
                    </Link>
                </div>
            </div>

            {/* Foreground Scroll Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs font-mono tracking-widest animate-bounce">
                [ SCROLL TO AUDIT THE MACRO DATA ]
            </div>
        </section>
    );
}

// 5. Parallax Columns Gallery (Finance & Macro themed)
export function ParallaxGallery() {
    const container = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(".col-1", {
                y: -150,
                ease: "none",
                scrollTrigger: { trigger: container.current, scrub: true }
            });
            gsap.fromTo(".col-2",
                { y: -150 },
                { y: 150, ease: "none", scrollTrigger: { trigger: container.current, scrub: true } }
            );
            gsap.to(".col-3", {
                y: -100,
                ease: "none",
                scrollTrigger: { trigger: container.current, scrub: true }
            });
        }, container);
        return () => ctx.revert();
    }, []);

    const financeImages = [
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000&auto=format&fit=crop", // Stock market exchange graph
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1000&auto=format&fit=crop", // Cash money macro
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1000&auto=format&fit=crop", // Stock charts monitor
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1000&auto=format&fit=crop", // Banking vault & gold
        "https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=1000&auto=format&fit=crop", // Money finance investment
        "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1000&auto=format&fit=crop"  // Digital currency volatility
    ];

    return (
        <section ref={container} className="min-h-screen bg-zinc-950 py-32 px-4 overflow-hidden">
            <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 h-[120vh]">
                {/* Column 1 */}
                <div className="col-1 flex flex-col gap-8 pt-20">
                    <div className="p-8 border-t border-white/20 text-white font-mono">
                        <h3 className="text-4xl font-bold uppercase mb-4 text-lime-400">Monthly CPI readings</h3>
                        <p className="text-zinc-500">Current index values are loaded from the UN Statistics Division. Values from different methods or reference periods are not silently combined.</p>
                    </div>
                    <ParallaxImage src={financeImages[0]} className="h-[60vh] w-full" alt="Financial Exchange" />
                    <ParallaxImage src={financeImages[1]} className="h-[40vh] w-full" alt="Currency Valuation" />
                </div>

                {/* Column 2 */}
                <div className="col-2 flex flex-col gap-8 -mt-20">
                    <ParallaxImage src={financeImages[2]} className="h-[50vh] w-full" alt="Market Volatility Chart" />
                    <div className="p-8 bg-zinc-900 text-white border border-white/10 text-center flex flex-col justify-center h-[30vh]">
                        <TrendingDown className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                        <h3 className="text-3xl font-bold uppercase tracking-tight">Source-linked data</h3>
                        <p className="text-xs font-mono text-zinc-400 mt-2">OBSERVATION PERIODS SHOWN</p>
                    </div>
                    <ParallaxImage src={financeImages[3]} className="h-[60vh] w-full" alt="Commodity Security" />
                </div>

                {/* Column 3 */}
                <div className="col-3 flex flex-col gap-8 pt-40">
                    <ParallaxImage src={financeImages[4]} className="h-[40vh] w-full" alt="Staples Cost" />
                    <div className="p-8 border-b border-white/20 text-right text-white font-mono">
                        <h3 className="text-4xl font-bold uppercase mb-4 text-lime-400">Transparent sources</h3>
                        <p className="text-zinc-500">NBS food and core price readings are not yet connected. We leave those categories blank instead of displaying invented estimates.</p>
                    </div>
                    <ParallaxImage src={financeImages[5]} className="h-[50vh] w-full" alt="High Inflation Shocks" />
                </div>
            </div>
        </section>
    );
}

// 6. Horizontal Scroll Marquee (Rotated)
export function CrazyMarquee() {
    return (
        <div className="relative py-28 bg-lime-400 overflow-hidden -skew-y-3 origin-center z-10">
            <div className="animate-marquee whitespace-nowrap flex gap-12 font-black text-[12vh] md:text-[15vh] text-black uppercase leading-none">
                {Array(6).fill("NIGERIAN CPI • SOURCE-LINKED READINGS • TRANSPARENT METHODOLOGY • ").map((t, i) => (
                    <span key={i}>{t}</span>
                ))}
            </div>
        </div>
    );
}

// 7. Interactive Terminal Features
export function KineticPricing() {
    const tools = [
        { name: "Explorer", price: "MONTHLY", desc: "Interactive time series of published CPI index readings and comparable changes.", color: "bg-zinc-900", href: "/explorer" },
        { name: "Deflator", price: "₦ REAL", desc: "Purchasing-power comparisons using the connected post-break UN CPI series.", color: "bg-emerald-950", popular: true, href: "/calculator" },
        { name: "Salary Check", price: "AUDIT", desc: "Calculate your mandatory compensation adjustment against inflation.", color: "bg-white text-black", href: "/salary-check" },
    ];

    return (
        <section className="bg-zinc-950 px-6 py-24 md:py-32">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-6">
                    <div>
                        <div className="text-lime-400 font-mono text-sm uppercase tracking-widest mb-3">[ SPECIALIZED ENGINES ]</div>
                        <h2 className="text-[10vw] md:text-[7vw] font-black uppercase leading-none mix-blend-difference text-white">
                            TERMINAL<span className="text-lime-400">.SUITE</span>
                        </h2>
                    </div>
                    <p className="text-zinc-500 font-mono text-sm max-w-sm uppercase">
                        Unadulterated empirical data sourced directly from monthly statistical bulletins.
                    </p>
                </div>
                
                <div className="grid w-full grid-cols-1 gap-2 border border-white/10 md:grid-cols-2 xl:grid-cols-3">
                    {tools.map((p, i) => (
                        <div key={i} className={cn(
                            "group relative flex min-h-[440px] min-w-0 flex-col justify-between p-6 transition-all duration-700 hover:bg-lime-400 hover:text-black sm:p-8 xl:p-10",
                            p.color,
                            i !== 2 ? "border-r border-white/10" : ""
                        )}>
                            <div>
                                <h3 className="mb-4 break-words text-3xl font-black uppercase tracking-tighter sm:text-4xl">{p.name}</h3>
                                <div className="mb-8 break-words text-4xl font-black sm:text-5xl xl:text-6xl">{p.price}</div>
                                <p className="mb-8 font-mono text-xs uppercase leading-relaxed opacity-75 md:text-sm">
                                    {p.desc}
                                </p>
                                <ul className="space-y-3 break-words font-mono text-[10px] uppercase opacity-60 group-hover:opacity-100 sm:text-xs">
                                    <li className="flex items-center gap-2">/ Original source attribution</li>
                                    <li className="flex items-center gap-2">/ Live Scenario Exporting</li>
                                    <li className="flex items-center gap-2">/ Zero Simulated Projections</li>
                                </ul>
                            </div>
                            <Link href={p.href}>
                                <MagneticButton className="w-full py-5 border border-current font-mono font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-colors">
                                    Launch Module →
                                </MagneticButton>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// 8. The Mathematical Process
export function VoidProcess() {
    const steps = [
        { title: "Published observations", desc: "Monthly CPI index readings are retrieved from the UN Statistics Division source and retain their reporting period." },
        { title: "Comparable periods", desc: "Index values are compared only within the supported post-break series and compatible published reference bases." },
        { title: "Transparent calculations", desc: "Purchasing-power comparisons use Amount × (Target CPI ÷ Base CPI), with unsupported periods rejected." },
    ];

    return (
        <section className="py-40 px-6 bg-black text-white relative">
            <div className="max-w-5xl mx-auto">
                <div className="text-lime-400 font-mono text-sm uppercase tracking-widest mb-12">[ METHODOLOGY ENGINE ]</div>
                <div className="space-y-40">
                    {steps.map((s, i) => (
                        <div key={i} className="group relative flex flex-col md:flex-row gap-12 md:gap-20 items-start md:items-end">
                            <div className="text-[15vw] font-black leading-none opacity-10 group-hover:opacity-100 group-hover:text-lime-400 transition-all duration-700 font-mono">0{i+1}</div>
                            <div className="pb-10 border-b border-white/20 flex-1">
                                <h3 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">{s.title}</h3>
                                <p className="max-w-md font-mono text-zinc-400 uppercase leading-relaxed text-sm">{s.desc}</p>
                            </div>
                            <div className="hidden md:block w-24 h-24 bg-lime-400 rounded-full group-hover:scale-150 transition-transform duration-700 mix-blend-difference" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// 9. Statistical Watchdogs
export function TeamVoid() {
    const [metrics, setMetrics] = useState<{ cpiIndex?: number; cpiYearOverYearRate?: number | null; cpiMonthOverMonthRate?: number | null; period?: string } | null>(null);
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/v1/inflation/latest`, { cache: "no-store" })
            .then(response => response.ok ? response.json() : Promise.reject(new Error("CPI service unavailable")))
            .then(setMetrics)
            .catch(() => setMetrics(null));
    }, []);
    const indicators = [
        { name: "CPI index", rate: typeof metrics?.cpiIndex === "number" ? metrics.cpiIndex.toLocaleString("en-NG", { maximumFractionDigits: 2 }) : "—", note: metrics?.period || "No current reading", img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop" },
        { name: "CPI change · year", rate: typeof metrics?.cpiYearOverYearRate === "number" ? `${metrics.cpiYearOverYearRate.toFixed(2)}%` : "—", note: "Same month in prior year", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop" },
        { name: "CPI change · month", rate: typeof metrics?.cpiMonthOverMonthRate === "number" ? `${metrics.cpiMonthOverMonthRate.toFixed(2)}%` : "—", note: "Prior monthly index reading", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop" },
    ];

    return (
        <section className="py-40 px-6 bg-zinc-950">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-32 gap-8">
                    <div>
                        <div className="text-lime-400 font-mono text-sm uppercase tracking-widest mb-3">[ MACRO INDICATOR MONITOR ]</div>
                        <h2 className="text-7xl md:text-9xl font-black uppercase leading-none text-white">BENCH<span className="text-zinc-800">.MARKS</span></h2>
                    </div>
                    <p className="max-w-xs font-mono text-zinc-500 text-sm uppercase">[ LIVE UN CPI OBSERVATIONS ]</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
                    {indicators.map((t, i) => (
                        <div key={i} className="group relative aspect-[3/4] bg-black overflow-hidden hover:bg-zinc-900 transition-colors">
                            <img src={t.img} className="w-full h-full object-cover grayscale opacity-25 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700" alt={t.name} />
                            <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black via-black/90 to-transparent">
                                <div className="text-5xl font-black font-mono text-lime-400 mb-2">{t.rate}</div>
                                <h3 className="text-3xl font-black text-white uppercase">{t.name}</h3>
                                <p className="text-zinc-400 font-mono text-xs uppercase mt-2">{t.note}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// 10. FAQ
export function StaticFAQ() {
    const [open, setOpen] = useState(0);
    const faqs = [
        { q: "WHERE DOES THIS DATA ORIGINATE?", a: "Monthly CPI index readings are retrieved from the United Nations Statistics Division. NBS remains the primary national publisher, but its food and core series are not yet connected here." },
        { q: "HOW IS PURCHASING POWER LOSS CALCULATED?", a: "For supported comparable periods, the calculation uses Amount × (Target CPI ÷ Base CPI). Comparisons across the January 2025 series break are not made." },
        { q: "WHY ARE FOOD AND CORE VALUES MISSING?", a: "The connected UN series does not publish NBS food or core rates. We show them as unavailable rather than infer or copy figures from unrelated sources." }
    ];

    return (
        <section className="py-40 px-6 bg-black">
            <div className="max-w-4xl mx-auto">
                <div className="text-lime-400 font-mono text-sm uppercase tracking-widest mb-8">[ INTEL & METHODOLOGY FAQ ]</div>
                <div className="space-y-2">
                    {faqs.map((f, i) => (
                        <div key={i} className="border-b border-white/10">
                            <button 
                                onClick={() => setOpen(open === i ? -1 : i)}
                                className="w-full py-12 flex justify-between items-center text-left group cursor-pointer"
                            >
                                <span className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter group-hover:text-lime-400 transition-colors">
                                    {f.q}
                                </span>
                                {open === i ? <Minus className="text-lime-400 w-6 h-6 shrink-0" /> : <Plus className="text-white w-6 h-6 shrink-0" />}
                            </button>
                            <div className={cn(
                                "overflow-hidden transition-all duration-500 ease-in-out",
                                open === i ? "max-h-64 pb-12" : "max-h-0"
                            )}>
                                <p className="text-lg md:text-xl font-mono text-zinc-400 uppercase leading-relaxed max-w-2xl">
                                    {f.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

type LatestMetrics = {
    cpiIndex: number;
    cpiYearOverYearRate: number | null;
    cpiMonthOverMonthRate: number | null;
    period: string;
    source: string;
    sourceUrl: string;
    indexBase?: string;
    retrievedAt?: string;
};

function isLatestMetrics(payload: unknown): payload is LatestMetrics {
    if (typeof payload !== "object" || payload === null) return false;
    if (!("sourceUrl" in payload) || typeof payload.sourceUrl !== "string") return false;

    let sourceUrl: URL;
    try {
        sourceUrl = new URL(payload.sourceUrl);
    } catch {
        return false;
    }

    return (
        "cpiIndex" in payload &&
        typeof payload.cpiIndex === "number" &&
        Number.isFinite(payload.cpiIndex) &&
        payload.cpiIndex > 0 &&
        "period" in payload &&
        typeof payload.period === "string" &&
        /^\d{4}-(0[1-9]|1[0-2])$/.test(payload.period) &&
        "source" in payload &&
        typeof payload.source === "string" &&
        payload.source.trim().length > 0 &&
        sourceUrl.protocol === "https:" &&
        sourceUrl.hostname === "unstats.un.org" &&
        "cpiYearOverYearRate" in payload &&
        (payload.cpiYearOverYearRate === null || (
            typeof payload.cpiYearOverYearRate === "number" &&
            Number.isFinite(payload.cpiYearOverYearRate)
        )) &&
        "cpiMonthOverMonthRate" in payload &&
        (payload.cpiMonthOverMonthRate === null || (
            typeof payload.cpiMonthOverMonthRate === "number" &&
            Number.isFinite(payload.cpiMonthOverMonthRate)
        )) &&
        (!("indexBase" in payload) || typeof payload.indexBase === "string") &&
        (!("retrievedAt" in payload) || (
            typeof payload.retrievedAt === "string" &&
            Number.isFinite(Date.parse(payload.retrievedAt))
        ))
    );
}

// 11. Metrics
export function KineticMetrics() {
    const [metrics, setMetrics] = useState<LatestMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        let timedOut = false;
        const timeout = window.setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, 15000);
        setLoading(true);
        setError(null);

        fetch(`${API_BASE_URL}/api/v1/inflation/latest`, {
            cache: "no-store",
            signal: controller.signal,
        })
            .then(async response => {
                if (!response.ok) {
                    throw new Error(`CPI data service returned HTTP ${response.status}.`);
                }

                const payload: unknown = await response.json();
                if (!isLatestMetrics(payload)) {
                    throw new Error("CPI data service returned an invalid reading.");
                }

                setMetrics(payload);
            })
            .catch(reason => {
                if (controller.signal.aborted && !timedOut) return;
                setMetrics(null);
                setError(timedOut
                    ? "The CPI data request timed out."
                    : reason instanceof Error ? reason.message : "Unable to load verified CPI data.");
            })
            .finally(() => {
                window.clearTimeout(timeout);
                if (!controller.signal.aborted || timedOut) setLoading(false);
            });

        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [retryCount]);

    const format = (value: number | null) => typeof value === "number" && Number.isFinite(value)
        ? `${value.toFixed(2)}%`
        : "—";
    const readings = [
        { val: loading ? "…" : metrics?.cpiIndex.toLocaleString("en-NG", { maximumFractionDigits: 2 }) || "—", label: `CPI INDEX · ${metrics?.period || "NO CURRENT READING"}` },
        { val: loading ? "…" : format(metrics?.cpiMonthOverMonthRate ?? null), label: "MONTH-OVER-MONTH CHANGE" },
        { val: loading ? "…" : format(metrics?.cpiYearOverYearRate ?? null), label: "YEAR-OVER-YEAR CHANGE" },
    ];

    return (
        <section id="trends" className="border-y border-white/10 bg-zinc-950 py-24 md:py-32" aria-live="polite">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-10 text-center sm:gap-12 md:grid-cols-3 md:gap-6 lg:gap-10">
                    {readings.map((m, i) => (
                        <div key={i} className="group flex min-w-0 flex-col items-center">
                            <div className="mb-4 max-w-full whitespace-nowrap font-mono text-5xl font-black tabular-nums text-white transition-all duration-500 group-hover:text-lime-400 sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl">{m.val}</div>
                            <div className="max-w-full break-words font-mono text-[9px] font-bold uppercase leading-relaxed tracking-[0.14em] text-lime-400 md:tracking-[0.09em] xl:text-xs xl:tracking-[0.12em]">{m.label}</div>
                        </div>
                    ))}
                </div>
                <div className="mt-12 flex flex-col items-center gap-3 text-center font-mono text-xs text-zinc-400">
                    {loading && <p>Loading verified CPI data…</p>}
                    {!loading && error && (
                        <div role="alert" className="flex flex-col items-center gap-3">
                            <p>{error} No substitute figures are displayed.</p>
                            <button
                                type="button"
                                onClick={() => setRetryCount(count => count + 1)}
                                className="rounded-full border border-white/20 px-4 py-2 text-lime-400 hover:border-lime-400"
                            >
                                Retry data request
                            </button>
                        </div>
                    )}
                    {!loading && metrics && (
                        <>
                            <p>{metrics.source}{metrics.indexBase ? ` · ${metrics.indexBase}` : ""}</p>
                            <p>A dash means no comparable source observation is available for that rate.</p>
                            {metrics.retrievedAt && (
                                <p>
                                    Retrieved {new Date(metrics.retrievedAt).toLocaleString("en-NG", { timeZone: "UTC" })} UTC
                                </p>
                            )}
                            <a
                                href={metrics.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-lime-400 underline underline-offset-4"
                            >
                                View original statistical source
                            </a>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

// 12. Sticky Features
export function StickyFeatures() {
    const container = useRef(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, i) => {
                gsap.fromTo(card,
                    { scale: 0.8, y: 100 * (i + 1), opacity: 0 },
                    {
                        scale: 1 - (i * 0.05),
                        y: 0,
                        opacity: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: card,
                            start: "top bottom-=100",
                            end: "top center",
                            scrub: 1
                        }
                    }
                );
            });
        }, container);
        return () => ctx.revert();
    }, []);

    const features = [
        { title: "Salary Erosion Audit", desc: "Compare what your 2019 contract or wage should yield in current Naira.", icon: MoveUpRight, color: "bg-emerald-900" },
        { title: "Commodity Matrix", desc: "Track retail prices of rice, cement, cooking gas, and petrol across Nigerian markets.", icon: Box, color: "bg-zinc-900" },
        { title: "Preserved Models", desc: "Save complex devaluation calculations and export time series directly as clean CSV files.", icon: Layers, color: "bg-white text-black" },
    ];

    return (
        <section ref={container} className="py-40 bg-black text-white px-6">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-6xl md:text-8xl font-black mb-32 text-center text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-300 to-cyan-400">
                    THE ENGINE STACK
                </h2>

                <div className="relative space-y-32">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            ref={el => { if (el) cardsRef.current[i] = el }}
                            className={cn(
                                "sticky top-32 w-full aspect-video rounded-3xl p-8 md:p-14 flex flex-col justify-between shadow-2xl border border-white/10",
                                f.color
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <f.icon className="w-16 h-16 md:w-20 md:h-20 opacity-50" />
                                <span className="text-8xl md:text-9xl font-black opacity-20 font-mono">{i + 1}</span>
                            </div>
                            <div>
                                <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">{f.title}</h3>
                                <p className="font-mono text-sm md:text-base opacity-75 uppercase">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// 13. Commodity Clients
export function KineticClients() {
    const commodities = ["PARBOILED RICE", "PETROL PMS", "PORTLAND CEMENT", "COOKING GAS", "FRESH BEEF", "WHITE GARRI"];
    return (
        <section className="py-20 bg-black border-y border-white/5 overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-20 mx-10">
                        {commodities.map(c => (
                            <span key={c} className="text-3xl md:text-5xl font-black text-white/20 hover:text-lime-400 transition-colors cursor-default uppercase font-mono tracking-widest">{c}</span>
                        ))}
                    </div>
                ))}
            </div>
            <style jsx>{`
                .animate-marquee { animation: marquee 25s linear infinite; }
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            `}</style>
        </section>
    );
}

// 14. Newsletter / Alert Stream
export function KineticNewsletter() {
    return (
        <section className="py-40 px-6 bg-zinc-950 flex items-center justify-center">
            <div className="max-w-4xl w-full text-center">
                 <div className="text-lime-400 font-mono text-sm uppercase tracking-widest mb-4">[ DISPATCH BULLETINS ]</div>
                 <h2 className="text-5xl md:text-8xl font-black uppercase mb-12 tracking-tighter">Enter The <span className="text-lime-400">CPI Stream.</span></h2>
                 <p className="font-mono text-zinc-500 uppercase text-sm mb-12 max-w-lg mx-auto">Get notified when new monthly NBS statistical bulletins are released and published.</p>
                 <div className="relative group max-w-2xl mx-auto">
                    <input type="email" placeholder="ANALYST@INSTITUTION.NG" className="w-full bg-black border-b-2 border-white/20 p-6 md:p-8 font-mono text-xl md:text-2xl text-white focus:outline-none focus:border-lime-400 transition-colors placeholder:text-zinc-800" />
                    <button className="absolute right-0 bottom-0 p-6 md:p-8 text-lime-400 hover:text-white transition-colors cursor-pointer" aria-label="Subscribe">
                        <Send size={28} />
                    </button>
                 </div>
            </div>
        </section>
    );
}

// 15. Footer (Reveal Effect)
export function Footer() {
    return (
        <div className="relative h-[80vh]" style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}>
            <div className="fixed bottom-0 h-[80vh] w-full bg-zinc-900 flex flex-col justify-center items-center -z-10 px-4">
                <h2 className="text-[12vw] font-black text-zinc-800 leading-none tracking-tighter">NAIRA TRACKER</h2>
                <div className="flex flex-wrap justify-center gap-6 mt-10">
                    <Link href="/dashboard">
                        <MagneticButton className="px-8 py-5 bg-lime-400 text-black font-black uppercase tracking-widest rounded-full hover:bg-white transition-colors">
                            OPEN LIVE DASHBOARD
                        </MagneticButton>
                    </Link>
                    <Link href="/calculator">
                        <MagneticButton className="px-8 py-5 border border-white/20 text-white font-bold uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-colors">
                            DEFLATOR CALCULATOR
                        </MagneticButton>
                    </Link>
                </div>
                <div className="absolute bottom-10 text-zinc-600 font-mono text-xs text-center">
                    NAIRA TRACKER · OFFICIAL NIGERIAN NATIONAL BUREAU OF STATISTICS DATA ENGINE
                </div>
            </div>
        </div>
    );
}
