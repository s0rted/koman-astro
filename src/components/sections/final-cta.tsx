"use client";

import { useTranslations } from "@/i18n/react-context";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

import { I18nProvider } from "@/i18n/react-context";

export function FinalCTA({ messages, locale }: { messages?: any; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <FinalCTAContent />
            </I18nProvider>
        );
    }
    return <FinalCTAContent />;
}

function FinalCTAContent() {
    const t = useTranslations('FinalCTA');
    const WHATSAPP_NUMBER = "355682022686";

    const handleWhatsApp = () => {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank");
    };

    return (
        <section className="py-32 relative overflow-hidden">
            {/* Immersive Background */}
            <div className="absolute inset-0 bg-slate-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent)] opacity-40" />
            </div>

            <div className="container relative z-10 mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <RevealOnScroll>
                        <span className="text-primary font-bold uppercase tracking-[0.3em] mb-6 block text-sm">
                            {t('badge')}
                        </span>
                        <h2 className="font-heading text-6xl md:text-8xl font-bold text-white mb-8 leading-none">
                            {t('title')} <br />
                            <span className="text-white/40">{t('subtitle')}</span>
                        </h2>
                        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                            {t('description')}
                        </p>
                    </RevealOnScroll>

                    <RevealOnScroll delay={0.2}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/tours">
                                <MagneticButton
                                    className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg flex items-center gap-3 shadow-2xl shadow-primary/20 transition-all group"
                                >
                                    {t('bookNow')}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </MagneticButton>
                            </Link>

                            <button
                                onClick={handleWhatsApp}
                                className="h-16 px-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center gap-3 border border-white/10 transition-all"
                            >
                                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                                {t('contactUs')}
                            </button>
                        </div>
                    </RevealOnScroll>
                </div>
            </div>
        </section>
    );
}
