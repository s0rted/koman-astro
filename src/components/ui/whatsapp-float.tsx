"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "@/components/ui/image";
import { useTranslations } from "@/i18n/react-context";

const WHATSAPP_NUMBER = "355682022686";
const DEFAULT_MESSAGE = "Hi! I'm interested in booking a Komani Lake tour. Can you help me?";

import { I18nProvider } from "@/i18n/react-context";

export function WhatsAppFloat({ messages, locale }: { messages?: any; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <WhatsAppFloatContent />
            </I18nProvider>
        );
    }
    return <WhatsAppFloatContent />;
}

function WhatsAppFloatContent() {
    const t = useTranslations('WhatsApp');
    const [isVisible, setIsVisible] = useState(false);
    const [isPulsing, setIsPulsing] = useState(true);

    // Show button after scrolling past hero
    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 400);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Stop pulsing after first interaction
    const handleClick = () => {
        setIsPulsing(false);
        const message = encodeURIComponent(DEFAULT_MESSAGE);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    };

    return (
        <div
            className={cn(
                "fixed bottom-6 right-6 z-50 transition-all duration-500",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
            )}
        >
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-slate-900 text-white text-sm px-4 py-2 rounded-xl whitespace-nowrap shadow-xl">
                    {t('tooltip')}
                    <div className="absolute top-full right-6 border-8 border-transparent border-t-slate-900" />
                </div>
            </div>

            {/* Main Button */}
            <button
                onClick={handleClick}
                aria-label="Chat on WhatsApp"
                className={cn(
                    "group relative flex items-center justify-center w-16 h-16 rounded-xl bg-white border-2 border-white shadow-2xl hover:scale-110 transition-all overflow-hidden",
                    isPulsing && "animate-wa-flash"
                )}
            >
                {/* Pulse Ring */}
                {isPulsing && (
                    <span className="absolute inset-0 rounded-xl bg-[#25D366] animate-ping opacity-20" />
                )}
                <Image
                    src="/whatsapp.webp"
                    alt="WhatsApp"
                    fill
                    className="object-contain"
                    unoptimized={true}
                />
            </button>

            {/* Badge */}
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                {t('badge')}
            </div>
        </div>
    );
}
