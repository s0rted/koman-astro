"use client";

import { useEffect, useState } from "react";
import { Leaf, X, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { I18nProvider, useTranslations } from "@/i18n/react-context";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "koman-season-banner-dismissed-v1";

export function SeasonBanner({ messages, locale }: { messages?: any; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <SeasonBannerContent />
            </I18nProvider>
        );
    }
    return <SeasonBannerContent />;
}

function SeasonBannerContent() {
    const t = useTranslations("SeasonBanner");
    // Rendered in the static HTML; hidden on hydration if previously dismissed.
    // The banner sits below the hero (off-screen on load), so there is no visible flash.
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        try {
            if (localStorage.getItem(STORAGE_KEY) === "1") {
                setVisible(false);
            }
        } catch {
            /* ignore */
        }
    }, []);

    const dismiss = () => {
        try {
            localStorage.setItem(STORAGE_KEY, "1");
        } catch {
            /* ignore */
        }
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            className={cn(
                "relative z-20 w-full border-y border-emerald-900/10",
                "bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 text-white"
            )}
            role="region"
            aria-label="Seasonal announcement"
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between gap-3 py-2.5 md:py-3">
                    <Link
                        href="/autumn-winter"
                        className="group flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3 hover:opacity-95 transition-opacity"
                    >
                        <span className="hidden sm:inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/15">
                            <Leaf className="w-4 h-4 text-emerald-300" />
                        </span>
                        <span className="min-w-0 text-[13px] sm:text-sm font-medium leading-snug">
                            <span className="font-bold text-emerald-200">{t("cta")}: </span>
                            <span className="text-white/95">{t("text")}</span>
                        </span>
                        <ArrowRight className="hidden md:block w-4 h-4 shrink-0 text-emerald-300 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <button
                        type="button"
                        onClick={dismiss}
                        aria-label={t("dismiss")}
                        className="shrink-0 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
