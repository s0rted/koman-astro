"use client";

import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { cn } from "@/lib/utils";
import Image from "@/components/ui/image";

interface TourGalleryProps {
    images: string[];
}

export function TourGallery({ images }: TourGalleryProps) {
    if (!images || images.length === 0) {
        return null; // Don't render empty section
    }

    return (
        <section className="py-20 bg-slate-50">
            <div className="container mx-auto px-4 md:px-6">
                <RevealOnScroll direction="up">
                    <h2 className="font-heading text-3xl font-bold text-slate-900 mb-12">
                        Captured Moments
                    </h2>
                </RevealOnScroll>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((src, index) => (
                        <RevealOnScroll
                            key={index}
                            delay={index * 0.1}
                            className={cn(
                                "relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm group",
                                // Make the first image span 2 columns on desktop for visual interest
                                index === 0 && "md:col-span-2 md:aspect-[2/1]"
                            )}
                        >
                            <div className="absolute inset-0 bg-slate-200 animate-pulse" /> {/* Placeholder skeleton */}

                            {/* 
                                ideally we use next/image here with real assets. 
                                For now using a div with bg-color to simulate loading/missing asset 
                                nicely instead of broken img icon 
                            */}
                            <div className="relative w-full h-full bg-slate-200 transition-transform duration-700 group-hover:scale-105">
                                <Image
                                    src={src}
                                    alt={`Gallery image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    unoptimized
                                />
                            </div>

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                        </RevealOnScroll>
                    ))}
                </div>
            </div>
        </section>
    );
}
