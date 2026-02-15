"use client";

import { Anchor, Facebook, Instagram, Heart, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "@/i18n/react-context";

import { I18nProvider } from "@/i18n/react-context";

export function Footer({ messages, locale }: { messages?: any; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <FooterContent />
            </I18nProvider>
        );
    }
    return <FooterContent />;
}

function FooterContent() {
    const t = useTranslations('Footer');
    const n = useTranslations('Navbar');
    const l = useTranslations('Legal');

    return (
        <footer className="bg-slate-950 text-slate-400 py-20 px-4 border-t border-slate-900 mt-auto">
            <div className="container mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center border border-slate-100/50 overflow-hidden shrink-0 aspect-square">
                                <img
                                    src="/images/logo.svg"
                                    alt="Logo"
                                    className="w-full h-full object-cover scale-[1.1]"
                                />
                            </div>
                            <span className="font-heading text-2xl font-bold text-white tracking-tight">
                                KOMAN LAKE TOURS
                            </span>
                        </Link>
                        <p className="leading-relaxed text-sm">
                            {t('story')}
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://www.instagram.com/molla_mario/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                <Facebook className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">{t('experiences')}</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/tours" className="hover:text-primary transition-colors">{n('tours')}</Link></li>
                            <li><Link href="/about" className="hover:text-primary transition-colors">{n('about')}</Link></li>
                            <li><Link href="/conservation" className="hover:text-primary transition-colors">{n('conservation')}</Link></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">{t('company')}</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/gallery" className="hover:text-primary transition-colors">{n('gallery')}</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">{n('contact')}</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">{l('privacy')}</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">{l('terms')}</Link></li>
                        </ul>
                    </div>

                    {/* Connect Column */}
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">{t('connect')}</h4>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>Koman Terminal, Albania</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-primary" />
                                <span>+355 68 202 2686</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-primary" />
                                <span>info@komanlake.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                    <p>© {new Date().getFullYear()} Koman Lake Tours. {t('rights')}</p>
                    <p className="flex items-center gap-1">
                        {t('madeWith')} <Heart className="w-3 h-3 text-rose-500 fill-current" /> {t('byGuards')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
