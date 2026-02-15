"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { cn } from "@/lib/utils";
import "swiper/css";
import "swiper/css/navigation";

import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { Button } from "@/components/ui/button";
import { ArrowRight, Instagram } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "@/components/ui/image";
import { useTranslations } from "@/i18n/react-context";

const IMAGES = [
    "/albums/optimized/IMG_6309.webp",
    "/albums/optimized/IMG_6350.webp",
    "/albums/optimized/IMG_2977.webp",
    "/albums/optimized/IMG_6080new.webp",
    "/albums/optimized/DSC_0499.webp",
    "/albums/optimized/DSC_0447.webp",
    "/albums/optimized/IMG_20230718_083740134.webp",
    "/albums/optimized/DSC_0510.webp",
    "/albums/optimized/DSC_0483.webp",
    "/albums/optimized/DSC_0472new.webp",
    "/albums/optimized/IMG_0516.webp",
];

import { I18nProvider } from "@/i18n/react-context";

export function GalleryTeaser({ messages, locale }: { messages?: any; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <GalleryTeaserContent />
            </I18nProvider>
        );
    }
    return <GalleryTeaserContent />;
}

function GalleryTeaserContent() {
    const t = useTranslations('Gallery');
    const c = useTranslations('Common');

    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4 md:px-6 mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                <RevealOnScroll>
                    <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-900">
                        {t('title')}
                    </h2>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        {t('subtitle')}
                    </p>
                </RevealOnScroll>

                <RevealOnScroll delay={0.2} className="hidden md:block">
                    <a href="https://www.instagram.com/molla_mario/" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="gap-2 rounded-full border-slate-200">
                            <Instagram className="w-4 h-4" />
                            {t('followInstagram') || "Follow on Instagram"}
                        </Button>
                    </a>
                </RevealOnScroll>
            </div>

            <RevealOnScroll delay={0.2} width="100%">
                <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={1.2}
                    centeredSlides={true}
                    loop={true}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    navigation
                    breakpoints={{
                        640: { slidesPerView: 2.2, centeredSlides: false },
                        1024: { slidesPerView: 3.5, centeredSlides: false },
                    }}
                    className="w-full h-[400px] md:h-[500px]"
                >
                    {IMAGES.map((src, index) => (
                        <SwiperSlide key={index} className="relative rounded-2xl overflow-hidden shadow-lg group">
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 z-10" />
                            <Image
                                src={src}
                                alt={`Komani Lake Gallery Image ${index + 1}`}
                                fill
                                className={cn(
                                    "object-cover transition-transform duration-700 group-hover:scale-105"
                                )}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                unoptimized={true}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </RevealOnScroll>

            <div className="container mx-auto px-4 mt-12 text-center">
                <Link href="/gallery">
                    <Button size="lg" className="rounded-full px-8 bg-slate-900 text-white hover:bg-slate-800">
                        {t('viewFullGallery') || "View Full Gallery"} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
