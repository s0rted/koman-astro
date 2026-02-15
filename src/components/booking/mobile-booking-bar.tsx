"use client";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "@/i18n/react-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Bus } from "lucide-react";


import { Link } from "@/i18n/routing";
import { EUR_TO_LEK } from "@/lib/tours";

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
    const locale = useLocale();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling past hero (approx 500px)
            setIsVisible(window.scrollY > 500);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isCallPrice = price === "Call" || isNaN(Number(price));
    const numericPrice = Number(price);
    const displayPrice = locale === 'sq' && !isCallPrice
        ? Math.round(numericPrice * EUR_TO_LEK).toLocaleString('sq-AL')
        : price;
    const displayCurrency = locale === 'sq' && !isCallPrice ? ' Lek' : currency;

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-4 pb-8 md:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.05)] transition-transform duration-300",
                isVisible ? "translate-y-0" : "translate-y-full"
            )}
        >
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <div className="flex flex-col gap-1 mb-1">
                        <p className="text-xs text-slate-500 font-medium line-clamp-1">{title}</p>
                        {(tourSlug === 'boat-tour' || tourSlug === 'local-experience') && (
                            <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded text-[9px] font-bold text-primary uppercase tracking-tight leading-none whitespace-nowrap w-fit">
                                <Bus className="w-2.5 h-2.5" />
                                <span>Includes Transfer</span>
                            </div>
                        )}
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
                        size="lg"
                        className="rounded-xl px-8 font-bold bg-primary text-white shadow-lg shadow-primary/20"
                    >
                        {isCallPrice ? t('contactUs') : t('bookNow')}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
