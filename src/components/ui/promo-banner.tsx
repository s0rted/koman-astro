"use client";

import { useEffect, useState } from "react";
import { Tag, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { I18nProvider, useTranslations } from "@/i18n/react-context";
import { cn } from "@/lib/utils";
import { getPromo } from "@/config/promo";

export function PromoBanner({ messages, locale }: { messages?: any; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <PromoBannerContent />
            </I18nProvider>
        );
    }
    return <PromoBannerContent />;
}

function PromoBannerContent() {
    const t = useTranslations("PromoBanner");
    // Render nothing on the server and on the first client render, so the
    // static HTML never bakes a date or promo state in (no hydration mismatch).
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
    }, []);

    // Nothing date-dependent during SSR / first render.
    if (!now) return null;

    const promo = getPromo(now);
    if (!promo.bookingOpen) return null;

    return (
        <div className="mb-1.5 flex w-full justify-center px-2" role="region" aria-label={t("region")}>
            <Link
                href="/book"
                className={cn(
                    "group inline-flex max-w-full items-center justify-center gap-1.5 rounded-full px-4 py-2 sm:py-1.5",
                    "bg-amber-400/90 text-slate-900 shadow-lg hover:bg-amber-300/90 transition-colors",
                )}
            >
                <Tag className="hidden sm:block w-4 h-4 shrink-0" />
                <span className="min-w-0 text-[13px] sm:text-sm font-semibold leading-snug text-center">
                    {t("text", {
                        day: promo.bookByDay,
                        year: promo.bookByYear,
                        percent: promo.percent,
                        season: promo.seasonYear,
                    })}
                </span>
                <ArrowRight className="hidden sm:block w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
        </div>
    );
}
