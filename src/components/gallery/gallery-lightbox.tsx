"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";


interface Photo {
    src: string;
    alt: string;
    type?: "video" | "image";
}

interface GalleryLightboxProps {
    photos: Photo[];
    currentId: number | null;
    onClose: () => void;
}

export function GalleryLightbox({ photos, currentId, onClose }: GalleryLightboxProps) {
    const [index, setIndex] = useState<number | null>(currentId);

    useEffect(() => {
        setIndex(currentId);
    }, [currentId]);

    const handleNext = useCallback(() => {
        if (index === null) return;
        setIndex((index + 1) % photos.length);
    }, [index, photos.length]);

    const handlePrev = useCallback(() => {
        if (index === null) return;
        setIndex((index - 1 + photos.length) % photos.length);
    }, [index, photos.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, handleNext, handlePrev]);

    if (index === null) return null;

    const currentPhoto = photos[index];

    return (
        <AnimatePresence>
            {index !== null && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col bg-black/98 backdrop-blur-xl"
                    onClick={onClose}
                >
                    {/* Header: Close Button and Counter */}
                    <div className="flex-none h-20 flex items-center justify-between px-8 z-[120]">
                        <div className="text-white/30 text-[10px] tracking-[0.3em] uppercase tabular-nums font-medium">
                            {index + 1} <span className="mx-2 text-white/10">|</span> {photos.length}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/50 hover:text-white transition-all p-2.5 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md border border-white/10"
                            aria-label="Close lightbox"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Main Content: Media and Navigation */}
                    <div className="flex-1 relative flex items-center justify-center p-4 min-h-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrev();
                            }}
                            className="absolute left-6 z-[110] text-white/50 hover:text-white transition-all p-4 hidden md:block hover:bg-white/10 rounded-full group"
                            aria-label="Previous media"
                        >
                            <ChevronLeft size={48} className="group-hover:-translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNext();
                            }}
                            className="absolute right-6 z-[110] text-white/50 hover:text-white transition-all p-4 hidden md:block hover:bg-white/10 rounded-full group"
                            aria-label="Next media"
                        >
                            <ChevronRight size={48} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                            transition={{
                                opacity: { duration: 0.4 },
                                scale: { type: "spring", damping: 25, stiffness: 200 },
                                filter: { duration: 0.4 }
                            }}
                            className="relative w-full h-full max-w-7xl flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {currentPhoto.type === "video" ? (
                                <video
                                    src={currentPhoto.src}
                                    className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                                    controls
                                    autoPlay
                                    loop
                                    playsInline
                                />
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img
                                        src={currentPhoto.src}
                                        alt={currentPhoto.alt}
                                        className="object-contain w-full h-full max-w-full max-h-full shadow-2xl"
                                        style={{ imageOrientation: 'from-image' }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Footer: Caption */}
                    <div className="flex-none min-h-[100px] flex items-start justify-center p-6 text-center z-[110] bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-base md:text-lg font-light max-w-3xl leading-relaxed drop-shadow-md">
                            {currentPhoto.alt}
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}


