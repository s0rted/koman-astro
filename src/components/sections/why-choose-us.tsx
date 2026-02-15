"use client";

import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { Shield, Sparkles, ShipWheel, Heart } from "lucide-react";
import { useTranslations } from "@/i18n/react-context";

import { I18nProvider } from "@/i18n/react-context";

export function WhyChooseUs({ messages, locale }: { messages?: any; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <WhyChooseUsContent />
            </I18nProvider>
        );
    }
    return <WhyChooseUsContent />;
}

function WhyChooseUsContent() {
    const t = useTranslations('WhyChooseUs');

    const USPS = [
        {
            icon: ShipWheel,
            title: t('usp1.title'),
            description: t('usp1.description')
        },
        {
            icon: Sparkles,
            title: t('usp2.title'),
            description: t('usp2.description')
        },
        {
            icon: Shield,
            title: t('usp3.title'),
            description: t('usp3.description')
        },
        {
            icon: Heart,
            title: t('usp4.title'),
            description: t('usp4.description')
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <RevealOnScroll className="text-center mb-16">
                    <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                        {t('title')} <span className="text-primary">{t('subtitle')}</span>
                    </h2>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                        {t('description')}
                    </p>
                </RevealOnScroll>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {USPS.map((usp, index) => (
                        <RevealOnScroll key={index} delay={index * 0.1}>
                            <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 h-full">
                                <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                    <usp.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{usp.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm">
                                    {usp.description}
                                </p>
                            </div>
                        </RevealOnScroll>
                    ))}
                </div>
            </div>
        </section>
    );
}
