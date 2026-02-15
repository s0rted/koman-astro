"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { Star, Quote, MapPin, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations, useMessages } from "@/i18n/react-context";
import { Button } from "@/components/ui/button";

import { I18nProvider } from "@/i18n/react-context";

export function Testimonials({ messages, locale }: { messages?: any; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <TestimonialsContent />
            </I18nProvider>
        );
    }
    return <TestimonialsContent />;
}

function TestimonialsContent() {
    const t = useTranslations('Testimonials');
    const tb = useTranslations('TrustBar');
    const messages = useMessages();

    // Extract reviews from localized messages
    const REVIEWS = (messages.Reviews as any[]) || [];

    return (
        <section className="py-24 bg-slate-50 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">

                <RevealOnScroll className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                                {t('title')} <span className="text-primary">{t('subtitle')}</span>
                            </h2>
                            <p className="text-slate-500 text-lg">
                                {t('description')}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                            {/* Navigation Buttons */}
                            <div className="flex gap-2 order-2 sm:order-1">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="swiper-prev-review rounded-full hover:bg-slate-100 border-slate-200"
                                    aria-label="Previous review"
                                >
                                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="swiper-next-review rounded-full hover:bg-slate-100 border-slate-200"
                                    aria-label="Next review"
                                >
                                    <ArrowRight className="w-4 h-4 text-slate-600" />
                                </Button>
                            </div>

                            {/* Rating Badge */}
                            <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100 order-1 sm:order-2">
                                <div className="flex text-amber-400">
                                    <Star className="w-5 h-5 fill-current" />
                                    <Star className="w-5 h-5 fill-current" />
                                    <Star className="w-5 h-5 fill-current" />
                                    <Star className="w-5 h-5 fill-current" />
                                    <Star className="w-5 h-5 fill-current" />
                                </div>
                                <span className="font-bold text-slate-900">{tb('rating')}</span>
                            </div>
                        </div>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll width="100%">
                    <Swiper
                        modules={[Navigation, Autoplay, Pagination]}
                        spaceBetween={30}
                        slidesPerView={1}
                        centeredSlides={false}
                        loop={true}
                        speed={1200}
                        autoplay={{
                            delay: 6000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true
                        }}
                        navigation={{
                            prevEl: '.swiper-prev-review',
                            nextEl: '.swiper-next-review',
                        }}
                        pagination={{ clickable: true }}
                        breakpoints={{
                            640: { slidesPerView: 1.5, centeredSlides: false },
                            1024: { slidesPerView: 3, centeredSlides: false },
                        }}
                        className="w-full pb-14"
                    >
                        {REVIEWS.map((review, index) => (
                            <SwiperSlide key={index} className="h-auto">
                                <Card className="h-full border-0 shadow-lg relative bg-white rounded-3xl p-8 group transition-all hover:-translate-y-1">
                                    <Quote className="absolute top-6 right-8 w-10 h-10 text-primary/10 group-hover:text-primary/20 transition-colors duration-500" />
                                    <CardContent className="p-0 relative z-10 flex flex-col h-full">

                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex text-amber-400">
                                                {[...Array(review.stars)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-current" />
                                                ))}
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-wider">
                                                {review.type}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-bold text-lg text-slate-900 mb-3 line-clamp-1">
                                            {review.title}
                                        </h3>

                                        {/* Text */}
                                        <div className="flex-grow mb-6">
                                            <p className="text-slate-600 leading-relaxed text-sm italic line-clamp-4 group-hover:line-clamp-none transition-all duration-300">
                                                "{review.text}"
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">{review.name}</div>
                                                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate max-w-[120px]">{review.origin}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{review.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </RevealOnScroll>
            </div>
        </section>
    );
}
