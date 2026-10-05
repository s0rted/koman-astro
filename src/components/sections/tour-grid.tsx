"use client";

import { useEffect, useRef, useState } from "react";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, MapPin, Star, Bus } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "@/components/ui/image";
import { TOURS, type Tour, EUR_TO_LEK, isSeasonalTour } from "@/lib/tours";
import { useTranslations, useLocale } from "@/i18n/react-context";



import { I18nProvider } from "@/i18n/react-context";

export function TourGrid({ messages, locale }: { messages?: Record<string, any>; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <TourGridContent />
            </I18nProvider>
        );
    }
    return <TourGridContent />;
}


function LazyTourVideo({ mp4Src, webmSrc, poster, title }: { mp4Src?: string; webmSrc?: string; poster: string; title: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 768px)");
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    useEffect(() => {
        const el = videoRef.current;
        if (!el || isMobile || typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.play().catch(() => {});
                } else {
                    el.pause();
                }
            },
            { rootMargin: "100px", threshold: 0.25 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [isMobile]);

    if (isMobile) {
        return (
            <img
                src={poster}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
            />
        );
    }

    return (
        <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload="none"
            poster={poster}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        >
            {webmSrc && <source src={webmSrc} type="video/webm" />}
            {mp4Src && <source src={mp4Src} type="video/mp4" />}
            <track kind="captions" label={`Preview of ${title}`} src="" />
        </video>
    );
}

function TourGridContent() {
    const t = useTranslations('Tours');
    const td = useTranslations('ToursData');
    const summer = useTranslations('SummerOnly');
    const locale = useLocale();

    // Categorize Tours
    const mainTours = TOURS.filter(t => ['boat-tour', 'local-experience', 'custom-tour'].includes(t.slug));
    const services = TOURS.filter(t => ['shkoder-valbona', 'kayak-rental'].includes(t.slug));
    const helicopter = TOURS.find(t => t.slug === 'helicopter-tour');

    const TourCard = ({ tour, priority = false }: { tour: Tour, priority?: boolean }) => {
        const isCallPrice = tour.price === "Call" || tour.price === "Contact" || isNaN(Number(tour.price));
        const numericPrice = Number(tour.price);
        const displayPrice = locale === 'sq' && !isCallPrice
            ? Math.round(numericPrice * EUR_TO_LEK).toLocaleString('sq-AL')
            : tour.price;
        const displayCurrency = locale === 'sq' && !isCallPrice ? ' Lek' : tour.currency;
        const isTransferIncluded = tour.slug === 'boat-tour' || tour.slug === 'local-experience';

        return (
            <div className="h-full border border-slate-100 shadow-lg hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden group flex flex-col rounded-2xl bg-white">
                {/* Media Area - Dynamic height to fit content */}
                <Link href={{ pathname: '/tours/[slug]', params: { slug: tour.slug } }} className="block">
                    <div className="relative h-auto aspect-video bg-slate-200 overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60" />

                        {tour.mp4Src || tour.webmSrc ? (
                            <LazyTourVideo
                                mp4Src={tour.mp4Src}
                                webmSrc={tour.webmSrc}
                                poster={tour.image}
                                title={td(`${tour.slug}.title`)}
                            />
                        ) : (
                            <img
                                src={tour.image}
                                srcSet={`${tour.image.replace('.webp', '-mid.webp')} 600w, ${tour.image} 800w`}
                                sizes="(max-width: 768px) 100vw, 33vw"
                                alt={td(`${tour.slug}.title`)}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading={priority ? "eager" : "lazy"}
                                decoding="async"
                            />
                        )}

                        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                            <Badge className="font-bold backdrop-blur-md bg-white/90 text-slate-900 border-none px-3 py-1.5 shadow-sm">
                                {td(`${tour.slug}.category`)}
                            </Badge>
                            {isSeasonalTour(tour.slug) && (
                                <Badge className="font-bold backdrop-blur-md bg-sky-500/95 text-white border-none px-3 py-1.5 shadow-sm">
                                    {summer('badge')}
                                </Badge>
                            )}
                        </div>

                        <div className="absolute bottom-4 left-4 z-20 text-white">
                            <div className="flex items-center gap-1.5 text-xs font-bold bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg w-fit mb-2">
                                <Clock className="w-3 h-3 text-primary" />
                                <span>{td(`${tour.slug}.duration`)}</span>
                            </div>
                            {isTransferIncluded && (
                                <div className="flex items-center gap-1.5 text-xs font-bold bg-primary/80 backdrop-blur-sm px-2 py-1 rounded-lg w-fit">
                                    <Bus className="w-3 h-3" />
                                    <span>{locale === 'sq' ? 'Transferta të përfshira' : 'Transfers included'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Link>

                {/* Content Area - Self-adjusting height */}
                <div className="flex flex-col flex-1 p-6">
                    <div className="mb-3">
                        <Link href={{ pathname: '/tours/[slug]', params: { slug: tour.slug } }}>
                            <h3 className="font-heading text-2xl font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">
                                {td(`${tour.slug}.title`)}
                            </h3>
                        </Link>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-3">
                        {td(`${tour.slug}.description`)}
                    </p>
                    {isSeasonalTour(tour.slug) && (
                        <p className="text-xs font-semibold text-sky-900 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2 mb-6">
                            {summer('short')}{' '}
                            <Link href="/autumn-winter" className="text-primary underline underline-offset-2">
                                {summer('link')}
                            </Link>
                        </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{locale === 'sq' ? 'Nga' : 'From'}</span>
                            <div className="text-slate-900 font-heading font-bold text-2xl">
                                {locale === 'sq' && !isCallPrice ? (
                                    <>
                                        {displayPrice}{displayCurrency}
                                    </>
                                ) : (
                                    <>
                                        {displayCurrency}{displayPrice}
                                    </>
                                )}
                                {!isCallPrice && <span className="text-sm text-slate-400 font-sans font-normal ml-1">/pp</span>}
                            </div>
                        </div>
                        <Link href={{ pathname: '/tours/[slug]', params: { slug: tour.slug } }}>
                            <Button size="lg" className="rounded-full px-6 group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-primary/10">
                                {t('viewDetails')} <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">

                {/* 1. Signature Adventures */}
                <div className="mb-20">
                    <RevealOnScroll className="mb-10">
                        <h2 className="font-heading text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Star className="w-8 h-8 text-primary fill-primary" />
                            {t('signature') || "Signature Adventures"}
                        </h2>
                    </RevealOnScroll>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {mainTours.map((tour, index) => (
                            <RevealOnScroll key={tour.slug} delay={index * 0.1}>
                                <TourCard tour={tour} priority={index === 0} />
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>

                {/* 2. Services & Add-ons */}
                <div className="mb-20">
                    <RevealOnScroll className="mb-10">
                        <h2 className="font-heading text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <MapPin className="w-8 h-8 text-primary" />
                            {t('addons') || "Services & Transfers"}
                        </h2>
                        <p className="text-slate-500 mt-2">{t('addonsDesc') || "Essential services to complete your journey."}</p>
                    </RevealOnScroll>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((tour, index) => (
                            <RevealOnScroll key={tour.slug} delay={index * 0.1}>
                                <TourCard tour={tour} />
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>

                {/* 3. Helicopter Premium */}
                {helicopter && (
                    <RevealOnScroll>
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 group">
                            <div className="absolute inset-0 z-0">
                                <div className="absolute inset-0 opacity-60 group-hover:opacity-70 transition-opacity duration-700">
                                    {helicopter.mp4Src ? (
                                        <LazyTourVideo
                                            mp4Src={helicopter.mp4Src}
                                            poster={helicopter.image}
                                            title={td(`${helicopter.slug}.title`)}
                                        />
                                    ) : (
                                        <img src={helicopter.image} alt="Helicopter" className="w-full h-full object-cover" />
                                    )}
                                </div>
                            </div>

                            <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                                <div className="max-w-xl text-white">
                                    <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-500 border-none mb-4 font-bold">Premium Experience</Badge>
                                    <Link href={{ pathname: '/tours/[slug]', params: { slug: helicopter.slug } }}>
                                        <h3 className="text-4xl md:text-6xl font-heading font-bold mb-4 hover:text-white/80 transition-colors cursor-pointer">{td(`${helicopter.slug}.title`)}</h3>
                                    </Link>
                                    <p className="text-lg text-slate-200 leading-relaxed mb-6">{td(`${helicopter.slug}.description`)}</p>
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                        {helicopter.inclusions.slice(0, 3).map((inc, i) => (
                                            <span key={i} className="text-xs font-bold border border-white/20 bg-white/10 backdrop-blur-md rounded-full px-3 py-1">
                                                {inc}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 min-w-[300px]">
                                    <div className="text-white text-center mb-6">
                                        <p className="text-sm uppercase tracking-widest opacity-70">{t('startingFrom')}</p>
                                        <p className="text-4xl font-bold">{t('callForPrice')}</p>
                                    </div>
                                    <Link href={{ pathname: '/tours/[slug]', params: { slug: helicopter.slug } }} className="w-full block">
                                        <Button size="lg" className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold h-14 rounded-xl">
                                            {t('viewDetails')}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </RevealOnScroll>
                )}

            </div>
        </section>
    );
}
