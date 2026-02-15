"use client";

import { useState } from "react";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { Leaf, Recycle, Heart, Users, X, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ConservationDictionary {
    hero: {
        badge: string;
        title: string;
        subtitle: string;
        description: string;
    };
    mission: {
        quote: string; // HTML allowed
        description: string;
    };
    gallery: {
        img1: string;
        img2: string;
        img3: string;
        img4: string;
        img5: string;
        img6: string;
        img7: string;
        img8: string;
        img9: string;
        fullscreen: string;
    };
    video: {
        title: string;
    };
    statistics: {
        zeroTrace: { title: string; text: string };
        community: { title: string; text: string };
        preservation: { title: string; text: string };
    };
    cta: {
        title: string;
        description: string;
        button: string;
    };
}

interface ConservationPageProps {
    dict: ConservationDictionary;
}

export function ConservationPage({ dict }: ConservationPageProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const CONSERVATION_IMAGES = [
        { src: "/albums/optimized/IMG_3058.webp", alt: dict.gallery.img1 },
        { src: "/albums/optimized/IMG_3046.webp", alt: dict.gallery.img2 },
        { src: "/albums/optimized/IMG_3030.webp", alt: dict.gallery.img3 },
        { src: "/albums/optimized/IMG_2984.webp", alt: dict.gallery.img4 },
        { src: "/albums/optimized/IMG_3032.webp", alt: dict.gallery.img5 },
        { src: "/albums/optimized/IMG_3033.webp", alt: dict.gallery.img6 },
        { src: "/albums/optimized/IMG_3034.webp", alt: dict.gallery.img7 },
        { src: "/albums/optimized/IMG_2829.webp", alt: dict.gallery.img8 },
        { src: "/albums/optimized/IMG_2832.webp", alt: dict.gallery.img9 },
    ];

    const currentPhoto = lightboxIndex !== null ? CONSERVATION_IMAGES[lightboxIndex] : null;

    const showNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (lightboxIndex !== null) {
            setLightboxIndex((prev) => (prev !== null && prev < CONSERVATION_IMAGES.length - 1 ? prev + 1 : 0));
        }
    };

    const showPrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (lightboxIndex !== null) {
            setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : CONSERVATION_IMAGES.length - 1));
        }
    };

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-emerald-950 pt-32 pb-20">
                <div className="absolute inset-0 z-0 opacity-60">
                    <div
                        className="absolute inset-0 bg-cover bg-center md:bg-fixed"
                        style={{ backgroundImage: "url('/images/conservation-hero.webp')" }}
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="container relative z-10 px-4 md:px-6 text-center">
                    <RevealOnScroll>
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-emerald-100 mb-6 border border-emerald-500/30">
                            <Leaf className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-widest">{dict.hero.badge}</span>
                        </div>
                        <h1 className="font-heading text-5xl md:text-8xl font-bold text-white mb-6 drop-shadow-lg">
                            {dict.hero.title} <br />
                            <span className="text-emerald-400">{dict.hero.subtitle}</span>
                        </h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed mb-12">
                            {dict.hero.description}
                        </p>
                    </RevealOnScroll>
                </div>
            </section>

            {/* Mission Statement */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <RevealOnScroll>
                            <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-900 mb-10 leading-tight" dangerouslySetInnerHTML={{ __html: dict.mission.quote }}>
                            </h2>
                            <p className="text-xl text-slate-600 leading-relaxed font-light">
                                {dict.mission.description}
                            </p>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Conservation Gallery */}
            <section className="py-16 bg-slate-50 border-y border-slate-100">
                <div className="container mx-auto px-4 md:px-6">
                    <RevealOnScroll>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {/* First large image */}
                            <div
                                className="col-span-2 md:col-span-2 row-span-2 relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-500"
                                onClick={() => setLightboxIndex(0)}
                            >
                                <img
                                    src={CONSERVATION_IMAGES[0].src}
                                    alt={CONSERVATION_IMAGES[0].alt}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="inline-block bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-slate-900">
                                        {dict.gallery.fullscreen}
                                    </span>
                                </div>
                            </div>

                            {/* Other images */}
                            {CONSERVATION_IMAGES.slice(1).map((img, idx) => (
                                <div
                                    key={idx}
                                    className="relative aspect-square rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-500"
                                    onClick={() => setLightboxIndex(idx + 1)}
                                >
                                    <img
                                        src={img.src}
                                        alt={img.alt}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                                </div>
                            ))}
                        </div>
                    </RevealOnScroll>
                </div>
            </section>

            {/* Video Feature */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <RevealOnScroll>
                        <div className="max-w-5xl mx-auto">
                            <h3 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
                                {dict.video.title}
                            </h3>
                            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-black" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                    src="https://www.youtube.com/embed/mOEry7VK-Mg?start=148&rel=0"
                                    title="National News Story - Komani Lake Cleanup"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                    className="absolute top-0 left-0 w-full h-full"
                                />
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>
            </section>

            {/* Statistics / Initiatives */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        <RevealOnScroll delay={0.1} className="bg-slate-50 p-10 rounded-[2.5rem] hover:bg-emerald-50/50 transition-colors duration-300">
                            <Recycle className="w-12 h-12 text-emerald-600 mb-6" />
                            <h3 className="font-bold text-xl text-slate-900 mb-4">{dict.statistics.zeroTrace.title}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {dict.statistics.zeroTrace.text}
                            </p>
                        </RevealOnScroll>

                        <RevealOnScroll delay={0.2} className="bg-slate-50 p-10 rounded-[2.5rem] hover:bg-emerald-50/50 transition-colors duration-300">
                            <Users className="w-12 h-12 text-emerald-600 mb-6" />
                            <h3 className="font-bold text-xl text-slate-900 mb-4">{dict.statistics.community.title}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {dict.statistics.community.text}
                            </p>
                        </RevealOnScroll>

                        <RevealOnScroll delay={0.3} className="bg-slate-50 p-10 rounded-[2.5rem] hover:bg-emerald-50/50 transition-colors duration-300">
                            <Heart className="w-12 h-12 text-emerald-600 mb-6" />
                            <h3 className="font-bold text-xl text-slate-900 mb-4">{dict.statistics.preservation.title}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {dict.statistics.preservation.text}
                            </p>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Get Involved CTA */}
            <section className="py-24 bg-emerald-900 text-white text-center">
                <div className="container mx-auto px-4 md:px-6">
                    <RevealOnScroll>
                        <h2 className="font-heading text-4xl font-bold mb-6">{dict.cta.title}</h2>
                        <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-10">
                            {dict.cta.description}
                        </p>
                        <a
                            href="mailto:contact@koman-astro.pages.dev"
                            className="inline-block bg-white text-emerald-900 hover:bg-emerald-50 px-10 py-5 rounded-full font-bold text-lg transition-colors scale-100 hover:scale-105"
                        >
                            {dict.cta.button}
                        </a>
                    </RevealOnScroll>
                </div>
            </section>

            {/* Lightbox Overlay */}
            <AnimatePresence>
                {lightboxIndex !== null && currentPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                        onClick={() => setLightboxIndex(null)}
                    >
                        <button
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                            onClick={() => setLightboxIndex(null)}
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <button
                            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                            onClick={showPrev}
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>

                        <button
                            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                            onClick={showNext}
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>

                        <div
                            className="relative w-full max-w-5xl h-[80vh] flex flex-col items-center justify-center gap-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.div
                                key={lightboxIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="relative w-full h-full flex items-center justify-center"
                            >
                                <img
                                    src={currentPhoto.src}
                                    alt={currentPhoto.alt}
                                    className="object-contain w-full h-full max-w-full max-h-full"
                                />
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-white/90 text-center text-lg md:text-xl font-light max-w-2xl"
                            >
                                {currentPhoto.alt}
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
