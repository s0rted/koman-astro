"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "@/i18n/react-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";


import { Link } from "@/i18n/routing";
import { EUR_TO_LEK, isSeasonalTour } from "@/lib/tours";
import { formatLek } from "@/lib/format";

interface MobileBookingBarProps {
    price: string;
    currency: string;
    title: string;
    tourSlug?: string;
}

import { I18nProvider } from "@/i18n/react-context";

export function MobileBookingBar({ messages, locale, ...props }: MobileBookingBarProps & { messages?: Record<string, any>; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <MobileBookingBarContent {...props} />
            </I18nProvider>
        );
    }
    return <MobileBookingBarContent {...props} />;
}

function MobileBookingBarContent({ price, currency, title, tourSlug }: MobileBookingBarProps) {
    const t = useTranslations('SingleTour.mobile');
    const ts = useTranslations('SingleTour.sidebar');
    const summer = useTranslations('SummerOnly');
    const locale = useLocale();
    const [isVisible, setIsVisible] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling past hero (approx 500px)
            setIsVisible(window.scrollY > 500);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Publish the rendered bar height as --mobile-bar-h so the cookie pill and
    // WhatsApp float can sit just above the bar (client-only, keeps SSR HTML
    // deterministic and avoids hydration mismatches).
    useEffect(() => {
        const el = barRef.current;
        const root = document.documentElement;
        if (!el) {
            root.style.setProperty("--mobile-bar-h", "0px");
            return;
        }
        const publish = () => {
            root.style.setProperty(
                "--mobile-bar-h",
                isVisible ? `${Math.round(el.offsetHeight)}px` : "0px"
            );
        };
        publish();
        const observer = new ResizeObserver(publish);
        observer.observe(el);
        return () => {
            observer.disconnect();
            root.style.setProperty("--mobile-bar-h", "0px");
        };
    }, [isVisible]);

    const isCallPrice = price === "Call" || isNaN(Number(price));
    const numericPrice = Number(price);
    const displayPrice = locale === 'sq' && !isCallPrice
        ? formatLek(numericPrice)
        : price;
    const displayCurrency = locale === 'sq' && !isCallPrice ? ' Lek' : currency;

    return (
        <div
            ref={barRef}
            className={cn(
                "fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.05)] transition-transform duration-300",
                isVisible ? "translate-y-0" : "translate-y-full"
            )}
        >
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <div className="flex flex-col gap-1 mb-1">
                        <p className="text-xs text-slate-500 font-medium line-clamp-1">{title}</p>
                        <div className="flex flex-wrap gap-1">
                            {isSeasonalTour(tourSlug) && (
                                <div className="flex items-center gap-1 bg-sky-100 px-1.5 py-0.5 rounded text-[9px] font-bold text-sky-900 uppercase tracking-tight leading-none whitespace-nowrap w-fit">
                                    <span>{summer('badge')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900">
                            {locale === 'sq' && !isCallPrice ? (
                                <>{displayPrice}{displayCurrency}</>
                            ) : (
                                <>{displayCurrency}{displayPrice}</>
                            )}
                        </span>
                        {!isCallPrice && <span className="text-xs text-slate-500">{ts('perPerson')}</span>}
                    </div>
                </div>
                <Link href={{ pathname: '/book', query: { tour: tourSlug } }} className="block">
                    <Button
                        size="default"
                        className="h-11 px-5 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20"
                    >
                        {isCallPrice ? t('contactUs') : useTranslations('Common')('bookNow')}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
