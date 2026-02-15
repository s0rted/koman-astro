"use client";

import { useState, useEffect } from "react";
import { Link } from '@/i18n/routing';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Anchor, Menu, X } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { useTranslations, useLocale } from '@/i18n/react-context';
import { LanguageSwitcher } from "./language-switcher";
import { I18nProvider } from '@/i18n/react-context';

export function Navbar({ messages, locale, pathname }: { messages?: any; locale?: string; pathname?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <NavbarContent pathname={pathname || ''} />
            </I18nProvider>
        );
    }
    return <NavbarContent pathname={pathname || ''} />;
}

function NavbarContent({ pathname }: { pathname: string }) {
    const t = useTranslations('Navbar');
    const locale = useLocale();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Explicitly check for both English and Albanian localized slugs to determine light pages
    const isLightPage =
        pathname?.includes('/contact') || pathname?.includes('/kontakt') ||
        pathname?.includes('/tours') || pathname?.includes('/turne') ||
        pathname?.includes('/gallery') || pathname?.includes('/galeria') ||
        pathname?.includes('/book') || pathname?.includes('/rezervo') ||
        pathname?.includes('/privacy') || pathname?.includes('/politika-e-privatise') ||
        pathname?.includes('/terms') || pathname?.includes('/termat-dhe-kushtet');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const NAV_LINKS = [
        { label: t('tours'), href: '/tours' as const },
        { label: t('about'), href: '/about' as const },
        { label: t('gallery'), href: '/gallery' as const },
        { label: t('conservation'), href: '/conservation' as const },
        { label: t('contact'), href: '/contact' as const },
    ];

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8",
                    isScrolled || isLightPage
                        ? "py-2 lg:py-4 bg-white z-[60] shadow-sm border-b border-slate-100"
                        : "py-4 lg:py-6 bg-transparent"
                )}
            >
                <div className="container mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-white w-10 h-10 rounded-full shadow-md group-hover:scale-110 transition-transform flex items-center justify-center border border-slate-100/50 overflow-hidden shrink-0 aspect-square">
                            <img
                                src="/images/logo-icon.svg"
                                alt="Koman Lake Tours Logo"
                                className="w-full h-full object-cover scale-[1.1]"
                            />
                        </div>
                        <span className={cn(
                            "font-heading text-lg lg:text-xl font-bold tracking-tight transition-colors",
                            isScrolled || isLightPage ? "text-slate-900" : "text-white"
                        )}>
                            KOMAN LAKE TOURS
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden lg:flex items-center gap-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    isScrolled || isLightPage ? "text-slate-600" : "text-white/90"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 md:gap-4">
                        <LanguageSwitcher variant={isScrolled || isLightPage ? 'light' : 'dark'} />

                        <div className="hidden md:block">
                            <Link href="/book">
                                <MagneticButton className={cn(
                                    "h-10 lg:h-11 px-6 rounded-full font-bold transition-all",
                                    isScrolled || isLightPage
                                        ? "bg-primary text-white"
                                        : "bg-white text-slate-900 hover:bg-slate-100"
                                )}>
                                    {t('bookNow')}
                                </MagneticButton>
                            </Link>
                        </div>

                        <button
                            className={cn(
                                "p-2 lg:hidden",
                                isScrolled || isLightPage ? "text-slate-900" : "text-white"
                            )}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? t('closeMenu') : t('openMenu')}
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu - Moved outside nav to prevent style inheritance issues */}
            <div className={cn(
                "fixed inset-0 bg-white z-[100] flex flex-col p-4 md:p-8 transition-transform duration-500 lg:hidden",
                isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="flex justify-between items-center mb-6 lg:mb-12 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="bg-white w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center shadow-md overflow-hidden shrink-0 aspect-square">
                            <img
                                src="/images/logo-icon.svg"
                                alt="Koman Lake Tours Logo"
                                className="w-full h-full object-cover scale-[1.1]"
                            />
                        </div>
                        <span className="font-heading text-lg font-bold text-slate-900">KOMAN LAKE TOURS</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 bg-slate-200 rounded-full"
                        aria-label={t('closeMenu') || 'Close menu'}
                    >
                        <X className="w-6 h-6 text-slate-900" />
                    </button>
                </div>

                <div className="flex flex-col gap-4 lg:gap-8 mb-8 overflow-y-auto">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="text-2xl lg:text-4xl font-heading font-bold text-slate-900 hover:text-primary transition-colors border-b border-slate-50 pb-2 lg:pb-4"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="mt-auto pt-4 lg:pt-8 border-t border-slate-100 space-y-4 lg:space-y-6 shrink-0">
                    <Link href="/book" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full h-12 lg:h-16 rounded-xl lg:rounded-2xl text-lg lg:text-xl font-bold bg-primary text-white shadow-xl shadow-primary/20">
                            {t('bookNow')}
                        </Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
