"use client";

import { useLocale } from '@/i18n/react-context';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { alternateLocalePath } from '@/i18n/paths';

export function LanguageSwitcher({ variant = 'dark', layoutId = 'lang-active-bg' }: { variant?: 'light' | 'dark'; layoutId?: string }) {
    const locale = useLocale();

    const toggleLanguage = (newLocale: "en" | "sq") => {
        if (newLocale === locale) return;
        const { pathname, search, hash } = window.location;
        // Same mapping as the hreflang tags (src/i18n/paths.ts), so every page
        // switches to its real counterpart (incl. tour slugs and trailing slashes).
        const target = alternateLocalePath(pathname, newLocale);
        window.location.href = `${target}${search}${hash}`;
    };

    return (
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
            {(['en', 'sq'] as const).map((lang) => {
                const isActive = locale === lang;
                return (
                    <button
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        type="button"
                        aria-label={lang === "en" ? "EN" : "SQ"}
                        aria-pressed={isActive}
                        className="relative px-2 sm:px-3 md:px-5 py-1.5 md:py-2 rounded-full transition-all duration-300 outline-none group"
                    >
                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    layoutId={layoutId}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    className={cn(
                                        "absolute inset-0 rounded-full shadow-lg z-0",
                                        variant === 'light' ? "bg-slate-900" : "bg-white"
                                    )}
                                />
                            )}
                        </AnimatePresence>

                        {/* Hover effect for inactive */}
                        {!isActive && (
                            <div className={cn(
                                "absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 scale-75 group-hover:scale-100 transition-all duration-500 z-0",
                                variant === 'light' ? "bg-slate-900" : "bg-white"
                            )} />
                        )}

                        <span className={cn(
                            "relative z-10 text-sm md:text-base font-bold tracking-tight transition-colors duration-300",
                            isActive
                                ? (variant === 'light' ? "text-white" : "text-slate-900")
                                : (variant === 'light' ? "text-slate-600 group-hover:text-slate-900" : "text-white/70 group-hover:text-white")
                        )}>
                            {lang.toUpperCase()}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
