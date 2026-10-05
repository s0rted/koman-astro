"use client";

import type { ReactNode } from "react";

import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Link } from "@/i18n/routing";
import {
    Leaf,
    Ship,
    Mountain,
    Fish,
    Wine,
    Home,
    Sunrise,
    Heart,
    MessageCircle,
    ArrowRight,
    Check,
} from "lucide-react";

export interface AutumnWinterDictionary {
    hero: {
        badge: string;
        title: string;
        subtitle: string;
        description: string;
    };
    boat: { title: string; text: string };
    hiking: { title: string; text: string };
    fishing: { title: string; text: string };
    rakia: { title: string; text: string };
    guesthouse: {
        title: string;
        text: string;
        guestsTitle: string;
        guests: string[];
    };
    mornings: { title: string; p1: string; p2: string };
    closing: { title: string; p1: string; p2: string };
    cta: {
        title: string;
        description: string;
        whatsapp: string;
        contact: string;
        whatsappMessage: string;
    };
}

const WHATSAPP_NUMBER = "355682022686";

const IMAGES = {
    hero: "/images/tours/boat-tour-hero.webp",
    boat: "/images/tours/boat-featured.webp",
    hiking: "/images/tours/shkoder-valbona.webp",
    fishing: "/images/tours/local-experience.webp",
    rakia: "/albums/optimized/DSC_0505.webp",
    guesthouse: "/albums/optimized/DSC_0510.webp",
    mornings: "/albums/optimized/DSC_0524.webp",
};

export function AutumnWinterPage({ dict }: { dict: AutumnWinterDictionary }) {
    const openWhatsApp = () => {
        const message = encodeURIComponent(dict.cta.whatsappMessage);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    };

    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-slate-950 pt-32 pb-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src={IMAGES.hero}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                        style={{ objectPosition: "center 40%" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-slate-950" />
                </div>

                <div className="container relative z-10 px-4 md:px-6 text-center">
                    <RevealOnScroll>
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-emerald-100 mb-6 border border-emerald-500/30">
                            <Leaf className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-widest">
                                {dict.hero.badge}
                            </span>
                        </div>
                        <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
                            {dict.hero.title} <br />
                            <span className="text-emerald-300">{dict.hero.subtitle}</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed">
                            {dict.hero.description}
                        </p>
                    </RevealOnScroll>
                </div>
            </section>

            {/* Boat */}
            <FeatureSection
                icon={<Ship className="w-6 h-6 text-primary" />}
                title={dict.boat.title}
                text={dict.boat.text}
                image={IMAGES.boat}
                imageAlt="Boat on Komani Lake"
                reverse={false}
            />

            {/* Hiking */}
            <FeatureSection
                icon={<Mountain className="w-6 h-6 text-primary" />}
                title={dict.hiking.title}
                text={dict.hiking.text}
                image={IMAGES.hiking}
                imageAlt="Nature trails near Komani Lake"
                reverse
                muted
            />

            {/* Fishing */}
            <FeatureSection
                icon={<Fish className="w-6 h-6 text-primary" />}
                title={dict.fishing.title}
                text={dict.fishing.text}
                image={IMAGES.fishing}
                imageAlt="Local experience on the lake"
                reverse={false}
            />

            {/* Rakia */}
            <FeatureSection
                icon={<Wine className="w-6 h-6 text-primary" />}
                title={dict.rakia.title}
                text={dict.rakia.text}
                image={IMAGES.rakia}
                imageAlt="Local hospitality"
                reverse
                muted
            />

            {/* Guesthouse */}
            <section className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <RevealOnScroll direction="right">
                            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl relative group">
                                <img
                                    src={IMAGES.guesthouse}
                                    alt="Guesthouse stay"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                        </RevealOnScroll>
                        <RevealOnScroll direction="left" delay={0.1}>
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-6">
                                <Home className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                {dict.guesthouse.title}
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                                {dict.guesthouse.text}
                            </p>
                            <h3 className="font-bold text-slate-900 mb-4">
                                {dict.guesthouse.guestsTitle}
                            </h3>
                            <ul className="space-y-3">
                                {dict.guesthouse.guests.map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-slate-600">
                                        <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-primary" />
                                        </span>
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Slow Mornings */}
            <section className="py-20 md:py-28 bg-slate-50 border-y border-slate-100">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <RevealOnScroll>
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-6">
                                <Sunrise className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                {dict.mornings.title}
                            </h2>
                            <div className="space-y-5 text-lg text-slate-600 leading-relaxed">
                                <p>{dict.mornings.p1}</p>
                                <p>{dict.mornings.p2}</p>
                            </div>
                        </RevealOnScroll>
                        <RevealOnScroll delay={0.15}>
                            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl relative group">
                                <img
                                    src={IMAGES.mornings}
                                    alt="Quiet morning landscape"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Live Like a Local */}
            <section className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <RevealOnScroll>
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-6 mx-auto">
                                <Heart className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
                                {dict.closing.title}
                            </h2>
                            <div className="space-y-5 text-lg text-slate-600 leading-relaxed">
                                <p>{dict.closing.p1}</p>
                                <p>{dict.closing.p2}</p>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Inquiry CTA — no prices */}
            <section className="py-24 md:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-950">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent)] opacity-40" />
                </div>
                <div className="container relative z-10 mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <RevealOnScroll>
                            <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                                {dict.cta.title}
                            </h2>
                            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed">
                                {dict.cta.description}
                            </p>
                        </RevealOnScroll>
                        <RevealOnScroll delay={0.15}>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                                <button
                                    type="button"
                                    onClick={openWhatsApp}
                                    className="h-14 md:h-16 px-8 md:px-10 rounded-2xl bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold text-base md:text-lg flex items-center gap-3 shadow-2xl transition-all"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {dict.cta.whatsapp}
                                </button>
                                <Link href="/contact">
                                    <MagneticButton className="h-14 md:h-16 px-8 md:px-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base md:text-lg flex items-center gap-3 border border-white/10 transition-all">
                                        {dict.cta.contact}
                                        <ArrowRight className="w-5 h-5" />
                                    </MagneticButton>
                                </Link>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>
        </main>
    );
}

function FeatureSection({
    icon,
    title,
    text,
    image,
    imageAlt,
    reverse = false,
    muted = false,
}: {
    icon: ReactNode;
    title: string;
    text: string;
    image: string;
    imageAlt: string;
    reverse?: boolean;
    muted?: boolean;
}) {
    return (
        <section className={`py-20 md:py-28 ${muted ? "bg-slate-50 border-y border-slate-100" : "bg-white"}`}>
            <div className="container mx-auto px-4 md:px-6">
                <div
                    className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                        reverse ? "lg:[&>*:first-child]:order-2" : ""
                    }`}
                >
                    <RevealOnScroll direction={reverse ? "left" : "right"}>
                        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl relative group">
                            <img
                                src={image}
                                alt={imageAlt}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                            />
                        </div>
                    </RevealOnScroll>
                    <RevealOnScroll direction={reverse ? "right" : "left"} delay={0.1}>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-6">
                            {icon}
                        </div>
                        <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                            {title}
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">{text}</p>
                    </RevealOnScroll>
                </div>
            </div>
        </section>
    );
}
