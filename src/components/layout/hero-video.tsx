"use client";

import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface HeroVideoProps {
    videoSrc?: string; // @deprecated use mp4Src instead
    mp4Src?: string;
    webmSrc?: string;
    posterSrc?: string;
    headline: string;
    subheadline: string;
    children?: React.ReactNode; // Slot for Booking Widget
}

export function HeroVideo({
    videoSrc = "/videos/hero-banner.mp4",
    mp4Src,
    webmSrc,
    posterSrc = "/images/hero-poster.webp",
    headline,
    subheadline,
    children
}: HeroVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            // Standard autoplay fallback for tougher browsers
            video.play().catch(error => {
                console.warn("Video auto-play failed. Browser may require user interaction.", error);
            });

            // Listen for data loading to force state update if needed
            const handleCanPlay = () => video.play();
            video.addEventListener('canplay', handleCanPlay);
            return () => video.removeEventListener('canplay', handleCanPlay);
        }
    }, []);

    return (
        <section className="relative min-h-[70dvh] md:h-[100dvh] w-full md:overflow-hidden bg-slate-900">
            {/* Background Video */}
            <div className="absolute inset-0 z-0 h-full w-full">
                <div className="absolute inset-0 z-10 bg-black/40" />
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={posterSrc}
                    preload="auto"
                    className="h-full w-full object-cover"
                >
                    <source src={mp4Src || videoSrc} type="video/mp4" />
                    {webmSrc && <source src={webmSrc} type="video/webm" />}
                </video>
            </div>

            {/* Content */}
            <div className="relative z-20 h-full flex flex-col items-center px-4 pt-32 pb-24 md:pt-32 md:pb-48 text-center text-white sm:px-6 lg:px-8">
                <div className="w-full max-w-6xl mx-auto space-y-12 md:space-y-16 flex-grow flex flex-col justify-center">
                    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
                        <RevealOnScroll direction="up" delay={0.2} className="w-full">
                            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight drop-shadow-2xl text-center leading-[1.1] md:leading-tight">
                                {headline}
                            </h1>
                        </RevealOnScroll>

                        <RevealOnScroll direction="up" delay={0.4} className="w-full max-w-2xl mx-auto">
                            <p className="text-lg sm:text-xl md:text-2xl text-white/95 drop-shadow-xl font-medium text-center leading-relaxed px-4 mx-auto" style={{ textWrap: "balance" }}>
                                {subheadline}
                            </p>
                        </RevealOnScroll>
                    </div>

                    {/* Booking Widget Slot */}
                    <RevealOnScroll direction="up" delay={0.6} className="w-full max-w-4xl mx-auto">
                        {children}
                    </RevealOnScroll>
                </div>
            </div>


        </section>
    );
}
