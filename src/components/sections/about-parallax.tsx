"use client";

import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "@/i18n/react-context";

import { I18nProvider } from "@/i18n/react-context";

export function AboutParallax({ messages, locale }: { messages?: any; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <AboutParallaxContent />
            </I18nProvider>
        );
    }
    return <AboutParallaxContent />;
}

function AboutParallaxContent() {
    const t = useTranslations('AboutParallax');

    return (
        <section className="relative py-32 overflow-hidden bg-slate-900 text-white">

            {/* Parallax Background (Simulated with fixed attachment for now) */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-fixed bg-center opacity-40"
                style={{ backgroundImage: "url('/albums/optimized/DSC_0510.webp')" }} // Corrected from placeholder
            />

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="max-w-3xl">
                    <RevealOnScroll>
                        <div className="flex items-center gap-2 text-primary font-bold mb-4 uppercase tracking-wider">
                            <Leaf className="w-5 h-5" />
                            <span>{t('badge')}</span>
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll delay={0.1}>
                        <h2 className="font-heading text-4xl md:text-6xl font-bold mb-8 leading-tight">
                            {t('title')} <br />
                            <span className="text-white/70">{t('subtitle')}</span>
                        </h2>
                    </RevealOnScroll>

                    <RevealOnScroll delay={0.2}>
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            {t('quote')}
                        </p>
                    </RevealOnScroll>

                    <RevealOnScroll delay={0.3}>
                        <Link href="/about">
                            <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-8 h-12 text-lg font-bold border-0 transition-colors">
                                {t('cta')} <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </RevealOnScroll>
                </div>
            </div>
        </section>
    );
}
