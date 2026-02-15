"use client";

import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { Clock, Utensils } from "lucide-react";
import { useTranslations, useLocale } from "@/i18n/react-context";

import { I18nProvider } from "@/i18n/react-context";

export function FeaturedTour({ messages, locale }: { messages?: Record<string, any>; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <FeaturedTourContent />
            </I18nProvider>
        );
    }
    return <FeaturedTourContent />;
}

function FeaturedTourContent() {
    const t = useTranslations('FeaturedTour');
    const locale = useLocale();

    return (
        <section className="py-24 bg-slate-50 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Image Side - Asymmetric */}
                    <RevealOnScroll direction="right" className="relative group">
                        <div className="aspect-[4/3] relative rounded-3xl overflow-hidden shadow-2xl bg-slate-200">
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 z-10" />
                            <img
                                src="/images/tours/boat-featured.webp"
                                srcSet="/images/tours/boat-featured-small.webp 400w, /images/tours/boat-featured.webp 800w"
                                sizes="(max-width: 768px) 100vw, 800px"
                                alt="Boat on Komani Lake"
                                className="object-cover w-full h-full relative z-0"
                            />
                        </div>
                        {/* Decoration */}
                        <div className="absolute -bottom-6 -right-6 w-3/4 h-3/4 border-2 border-primary/20 rounded-3xl -z-10" />
                    </RevealOnScroll>

                    {/* Content Side */}
                    <div className="space-y-8">
                        <RevealOnScroll direction="up" delay={0.1}>
                            <Badge className="bg-amber-400 text-slate-900 hover:bg-amber-500 px-3 py-1 text-sm font-bold uppercase tracking-wide">
                                {t('bestSeller')}
                            </Badge>
                            <h2 className="mt-4 font-heading text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                                {t('title')} <br />
                                <span className="text-primary">{t('subtitle')}</span>
                            </h2>
                        </RevealOnScroll>

                        <RevealOnScroll direction="up" delay={0.2}>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                {t('description')}
                            </p>
                        </RevealOnScroll>

                        <RevealOnScroll direction="up" delay={0.3}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <div>
                                        <span className="block font-bold text-slate-900">{t('duration')}</span>
                                        <span className="text-xs text-slate-500">{t('durationLabel')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                    <Utensils className="w-5 h-5 text-primary" />
                                    <div>
                                        <span className="block font-bold text-slate-900">{t('lunch')}</span>
                                        <span className="text-xs text-slate-500">{t('lunchLabel')}</span>
                                    </div>
                                </div>
                            </div>
                        </RevealOnScroll>

                        <RevealOnScroll direction="up" delay={0.4} className="flex flex-col sm:flex-row gap-4 pt-4">
                            <div className="flex items-baseline gap-1">
                                {locale === 'sq' ? (
                                    <>
                                        <span className="text-3xl font-bold text-primary">5,700 Lek</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-3xl font-bold text-primary">€54</span>
                                    </>
                                )}
                                <span className="text-slate-500">{t('pricePerPerson')}</span>
                            </div>
                            <Link href={{ pathname: '/book', query: { tour: 'boat-tour' } }}>
                                <Button size="lg" className="rounded-full px-8 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                                    {t('bookTour')}
                                </Button>
                            </Link>
                        </RevealOnScroll>
                    </div>

                </div>
            </div>
        </section>
    );
}
