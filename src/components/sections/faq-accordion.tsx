"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { useTranslations } from "@/i18n/react-context";

import { I18nProvider } from "@/i18n/react-context";

export function FaqAccordion({ messages, locale }: { messages?: any; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <FaqAccordionContent />
            </I18nProvider>
        );
    }
    return <FaqAccordionContent />;
}

function FaqAccordionContent() {
    const t = useTranslations('Faq');

    const FAQS = [
        {
            question: t('q1.q'),
            answer: t('q1.a')
        },
        {
            question: t('q2.q'),
            answer: t('q2.a')
        },
        {
            question: t('q3.q'),
            answer: t('q3.a')
        },
        {
            question: t('q4.q'),
            answer: t('q4.a')
        },
        {
            question: t('q5.q'),
            answer: t('q5.a')
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                <RevealOnScroll className="text-center mb-12">
                    <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                        {t('title')} <span className="text-primary">{t('subtitle')}</span>
                    </h2>
                    <p className="text-slate-500">
                        {t('description')}
                    </p>
                </RevealOnScroll>

                <RevealOnScroll delay={0.2}>
                    <Accordion type="single" collapsible className="w-full">
                        {FAQS.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left font-bold text-slate-900 text-lg hover:text-primary transition-colors">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-600 leading-relaxed text-base">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </RevealOnScroll>

            </div>
        </section>
    );
}
