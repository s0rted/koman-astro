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
    // Sits at the top of the hero, just under the navbar.
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

    // Highlight the short "New:" / "E re:" prefix without a separate label.
    const full = t("text");
    const idx = full.indexOf(": ");
    const prefix = idx > 0 && idx < 12 ? full.slice(0, idx) : "";
    const rest = prefix ? full.slice(idx + 2) : full;
    const shortFull = t("short");
    const sIdx = shortFull.indexOf(": ");
    const shortRest = prefix && sIdx > 0 ? shortFull.slice(sIdx + 2) : shortFull;

    return (
        <div className="flex w-full justify-center px-2" role="region" aria-label={t("region")}>
            <div
                className={cn(
                    "inline-flex max-w-full items-center gap-1 rounded-full pl-3 pr-0.5 py-0 sm:py-1 sm:pl-4 sm:pr-1",
                    "bg-emerald-950/55 backdrop-blur-md border border-white/20 shadow-lg text-white"
                )}
            >
                <Link
                    href="/autumn-winter"
                    className="group flex min-w-0 items-center gap-2 py-1.5 sm:py-1 hover:opacity-95 transition-opacity"
                >
                    <Leaf className="hidden sm:block w-4 h-4 shrink-0 text-emerald-300" />
                    <span className="min-w-0 text-[13px] sm:text-sm font-medium leading-snug text-left">
                        {prefix && <span className="font-bold text-emerald-200">{prefix}: </span>}
                        <span className="text-white/95 underline-offset-2 group-hover:underline whitespace-nowrap sm:hidden">{shortRest}</span>
                        <span className="text-white/95 underline-offset-2 group-hover:underline hidden sm:inline">{rest}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0 text-emerald-300 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <button
                    type="button"
                    onClick={dismiss}
                    aria-label={t("dismiss")}
                    className="shrink-0 ml-1 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
