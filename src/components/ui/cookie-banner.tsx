"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/i18n/react-context";
import { Link } from "@/i18n/routing";
import { X, Cookie, ShieldCheck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { I18nProvider } from "@/i18n/react-context";

export function CookieBanner({ messages, locale }: { messages?: any; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <CookieBannerContent />
            </I18nProvider>
        );
    }
    return <CookieBannerContent />;
}

function CookieBannerContent() {
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selections, setSelections] = useState({
        analytical: true,
        marketing: false
    });

    const t = useTranslations("CookieBanner");

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleSave = (type: "all" | "necessary" | "custom") => {
        let consentData;
        if (type === "all") {
            consentData = { analytical: true, marketing: true };
        } else if (type === "necessary") {
            consentData = { analytical: false, marketing: false };
        } else {
            consentData = selections;
        }

        localStorage.setItem("cookie-consent", JSON.stringify(consentData));
        setIsVisible(false);
    };

    const toggleSelection = (key: keyof typeof selections) => {
        setSelections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    className="fixed bottom-6 left-6 z-[100] pointer-events-none"
                >
                    <div className="flex items-end">
                        {!isExpanded ? (
                            <motion.button
                                layoutId="cookie-banner-bg"
                                onClick={() => setIsExpanded(true)}
                                className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-4 flex items-center gap-3 group hover:border-primary/50 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <Cookie className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold text-slate-900 pr-2">
                                    Privacy Settings
                                </span>
                            </motion.button>
                        ) : (
                            <motion.div
                                layoutId="cookie-banner-bg"
                                className="pointer-events-auto bg-white/90 backdrop-blur-2xl border border-slate-200 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col gap-6 max-w-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-xl">
                                            <ShieldCheck className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="font-heading font-bold text-slate-900 text-lg">
                                            {t("title")}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setIsExpanded(false)}
                                        className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100/50 p-1.5 rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <p className="text-slate-600 text-[13px] leading-relaxed">
                                    {t("description")}{" "}
                                    <Link
                                        href="/privacy"
                                        className="text-primary font-bold hover:underline"
                                    >
                                        {t("privacyLink")}
                                    </Link>
                                </p>

                                {/* Custom Selection Toggles */}
                                <div className="space-y-4 py-2 border-y border-slate-100">
                                    {/* Necessary (Always on) */}
                                    <div className="flex items-center justify-between opacity-60">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-900">Necessary</span>
                                            <span className="text-[10px] text-slate-500">Required for site to function.</span>
                                        </div>
                                        <div className="w-5 h-5 bg-slate-200 rounded-md flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    </div>

                                    {/* Analytical */}
                                    <button
                                        onClick={() => toggleSelection("analytical")}
                                        className="flex items-center justify-between w-full text-left group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                {t("analytical")}
                                            </span>
                                            <span className="text-[10px] text-slate-500 line-clamp-1">
                                                {t("analyticalDesc")}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "w-5 h-5 rounded-md flex items-center justify-center border transition-all",
                                            selections.analytical ? "bg-primary border-primary" : "border-slate-300"
                                        )}>
                                            {selections.analytical && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </button>

                                    {/* Marketing */}
                                    <button
                                        onClick={() => toggleSelection("marketing")}
                                        className="flex items-center justify-between w-full text-left group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                {t("marketing")}
                                            </span>
                                            <span className="text-[10px] text-slate-500 line-clamp-1">
                                                {t("marketingDesc")}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "w-5 h-5 rounded-md flex items-center justify-center border transition-all",
                                            selections.marketing ? "bg-primary border-primary" : "border-slate-300"
                                        )}>
                                            {selections.marketing && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <button
                                        onClick={() => handleSave("all")}
                                        className="w-full bg-primary text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                                    >
                                        {t("accept")}
                                    </button>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleSave("custom")}
                                            className="bg-white text-slate-900 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-[10px] hover:bg-slate-50 transition-all uppercase tracking-wider"
                                        >
                                            {t("saveSelections")}
                                        </button>
                                        <button
                                            onClick={() => handleSave("necessary")}
                                            className="bg-white text-slate-900 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-[10px] hover:bg-slate-50 transition-all uppercase tracking-wider"
                                        >
                                            {t("acceptNecessary")}
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setIsVisible(false)}
                                        className="w-full text-slate-400 hover:text-slate-600 font-bold text-[10px] transition-all uppercase tracking-widest pt-1"
                                    >
                                        {t("decline")}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
