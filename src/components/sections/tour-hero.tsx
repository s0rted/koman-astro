"use client";

import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import Image from "@/components/ui/image";

interface TourHeroProps {
    title: string;
    category: string;
    duration: string;
    bannerImg: string;
}

export function TourHero({ title, category, duration, bannerImg }: TourHeroProps) {
    return (
        <section className="relative h-[65vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden bg-slate-900">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-slate-900/40 to-transparent z-10" />
                <Image
                    src={bannerImg}
                    alt={title}
                    fill
                    className="object-cover object-center scale-105"
                    priority
                    unoptimized={true}
                />
            </div>

            <div className="container relative z-20 mx-auto px-4 md:px-6">
                <div className="max-w-3xl">
                    <RevealOnScroll direction="up">
                        <Badge className="mb-6 bg-primary text-white hover:bg-primary/90 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                            {category}
                        </Badge>
                        <h1 className="font-heading text-4xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-xl">
                            {title}
                        </h1>
                        <div className="flex items-center gap-6 text-white/90 font-medium">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                <span>{duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span>Koman Lake, Albania</span>
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>
            </div>
        </section>
    );
}
