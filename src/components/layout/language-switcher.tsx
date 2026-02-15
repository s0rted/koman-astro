"use client";

import { useLocale } from '@/i18n/react-context';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function LanguageSwitcher({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
    const locale = useLocale();

    const toggleLanguage = (newLocale: "en" | "sq") => {
        if (newLocale === locale) return;
        const currentPath = window.location.pathname;
        // Swap locale prefix: /en/... → /sq/... or vice versa
        const newPath = currentPath.replace(/^\/(en|sq)/, `/${newLocale}`);
        const search = window.location.search;
        window.location.href = `${newPath}${search}`;
    };

    return (
        <div className="flex items-center gap-1 md:gap-2">
            {(['en', 'sq'] as const).map((lang) => {
                const isActive = locale === lang;
                return (
                    <button
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className="relative px-5 py-2 rounded-full transition-all duration-300 outline-none group"
                    >
                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    layoutId="lang-active-bg"
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
                            "relative z-10 text-[16px] font-bold tracking-tight transition-colors duration-300",
                            isActive
                                ? (variant === 'light' ? "text-white" : "text-slate-900")
                                : (variant === 'light' ? "text-slate-400 group-hover:text-slate-900" : "text-white/40 group-hover:text-white")
                        )}>
                            {lang.toUpperCase()}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
