"use client";

import { Star, ShieldCheck, Users } from "lucide-react";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { useTranslations } from "@/i18n/react-context";

import { I18nProvider } from "@/i18n/react-context";

export function TrustBar({ messages, locale }: { messages?: any; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <TrustBarContent />
            </I18nProvider>
        );
    }
    return <TrustBarContent />;
}

function TrustBarContent() {
    const t = useTranslations('TrustBar');

    return (
        <section className="w-full bg-white py-8 border-b border-slate-100">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center justify-around gap-6 text-center md:text-left">

                    <RevealOnScroll delay={0.1}>
                        <div className="flex items-center gap-4 bg-primary/5 rounded-full px-8 py-4 border border-primary/10 hover:bg-primary/10 transition-colors">
                            <Star className="h-6 w-6 text-primary fill-primary/20" />
                            <div className="text-left">
                                <div className="font-bold text-slate-900 text-sm md:text-base leading-tight">{t('rating')}</div>
                                <p className="text-slate-600 text-xs md:text-sm font-medium">{t('reviews')}</p>
                            </div>
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll delay={0.2}>
                        <div className="flex items-center gap-4 bg-primary/5 rounded-full px-8 py-4 border border-primary/10 hover:bg-primary/10 transition-colors">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            <div className="text-left">
                                <div className="font-bold text-slate-900 text-sm md:text-base leading-tight">{t('est')}</div>
                                <p className="text-slate-600 text-xs md:text-sm font-medium">{t('pioneer')}</p>
                            </div>
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll delay={0.3}>
                        <div className="flex items-center gap-4 bg-primary/5 rounded-full px-8 py-4 border border-primary/10 hover:bg-primary/10 transition-colors">
                            <Users className="h-6 w-6 text-primary" />
                            <div className="text-left">
                                <div className="font-bold text-slate-900 text-sm md:text-base leading-tight">{t('guests')}</div>
                                <p className="text-slate-600 text-xs md:text-sm font-medium">{t('owned')}</p>
                            </div>
                        </div>
                    </RevealOnScroll>

                </div>
            </div>
        </section>
    );
}
