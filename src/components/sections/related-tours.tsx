"use client";

import { TOURS, type Tour } from "@/lib/tours";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "@/components/ui/image";
import { useTranslations } from "@/i18n/react-context";

interface RelatedToursProps {
    currentSlug: string;
}

import { I18nProvider } from "@/i18n/react-context";

export function RelatedTours({ messages, locale, ...props }: RelatedToursProps & { messages?: Record<string, any>; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <RelatedToursContent {...props} />
            </I18nProvider>
        );
    }
    return <RelatedToursContent {...props} />;
}

function RelatedToursContent({ currentSlug }: RelatedToursProps) {
    const t = useTranslations('Tours');
    const td = useTranslations('ToursData');
    const c = useTranslations('Common');

    const related = TOURS.filter(t => t.slug !== currentSlug).slice(0, 2);

    return (
        <section className="py-24 border-t border-slate-100">
            <div className="container mx-auto px-4 md:px-6">
                <RevealOnScroll className="mb-12">
                    <h2 className="font-heading text-3xl font-bold text-slate-900">
                        {t('relatedTitle')} <span className="text-primary">{t('relatedEnjoy')}</span>
                    </h2>
                </RevealOnScroll>

                <div className="grid md:grid-cols-2 gap-8">
                    {related.map((tour, index) => (
                        <RevealOnScroll key={tour.slug} delay={index * 0.1}>
                            <Link href={{ pathname: '/tours/[slug]', params: { slug: tour.slug } }}>
                                <Card className="flex flex-col md:flex-row h-full border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                                    <div className="md:w-1/3 h-48 md:h-auto bg-slate-200 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                                        <img
                                            src={tour.image}
                                            alt={td(`${tour.slug}.title`)}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="md:w-2/3 p-6 flex flex-col justify-center">
                                        <Badge variant="secondary" className="w-fit mb-3">
                                            {td(`${tour.slug}.category`)}
                                        </Badge>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors mb-2">
                                            {td(`${tour.slug}.title`)}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                            <Clock className="w-4 h-4" /> {tour.duration}
                                        </div>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-primary font-bold">{tour.currency}{tour.price}</span>
                                            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                                                {c('viewTour') || "View Tour"} <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </RevealOnScroll>
                    ))}
                </div>
            </div>
        </section>
    );
}
