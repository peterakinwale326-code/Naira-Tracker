"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { 
    Navbar, 
    Hero, 
    ParallaxGallery, 
    CrazyMarquee, 
    StickyFeatures, 
    Footer,
    VoidProcess,
    KineticMetrics,
    KineticPricing,
    TeamVoid,
    StaticFAQ,
    KineticClients,
    KineticNewsletter
} from "../components/CoreLandingPages/StartupLandingPages/tsx/Kinetic";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// --- Main Layout ---
export default function KineticPage() {

    // Smooth Scroll Setup
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.5, // Slower for smoother vibe
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        lenis.on('scroll', ScrollTrigger.update);
        const tickerFn = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tickerFn);
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            gsap.ticker.remove(tickerFn);
        };
    }, []);

    // Custom Cursor
    const cursor = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            if (cursor.current) {
                gsap.to(cursor.current, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.1,
                    ease: "power2.out"
                });
            }
        };
        window.addEventListener("mousemove", moveCursor);
        return () => window.removeEventListener("mousemove", moveCursor);
    }, []);

    return (
        <main className="bg-black min-h-screen text-white selection:bg-lime-400 selection:text-black cursor-none">
            {/* Custom Cursor */}
            <div ref={cursor} className="fixed top-0 left-0 w-8 h-8 border-2 border-lime-400 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center mix-blend-difference">
                <div className="w-1 h-1 bg-lime-400 rounded-full" />
            </div>

            <Navbar />
            <Hero />
            <KineticMetrics />
            <ParallaxGallery />
            <VoidProcess />
            <CrazyMarquee />
            <StickyFeatures />
            <TeamVoid />
            <KineticPricing />
            <StaticFAQ />
            <KineticClients />
            <KineticNewsletter />
            <Footer />
        </main>
    );
}
