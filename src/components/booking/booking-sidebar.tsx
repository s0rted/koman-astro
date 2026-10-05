"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ShieldCheck, Zap, Bus } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { useTranslations, useLocale } from "@/i18n/react-context";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { EUR_TO_LEK, isSeasonalTour } from "@/lib/tours";

interface BookingSidebarProps {
    price: string;
    currency: string;
    tourSlug?: string;
}



import { I18nProvider } from "@/i18n/react-context";

export function BookingSidebar({ messages, locale, ...props }: BookingSidebarProps & { messages?: Record<string, any>; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <BookingSidebarContent {...props} />
            </I18nProvider>
        );
    }
    return <BookingSidebarContent {...props} />;
}

function BookingSidebarContent({ price, currency, tourSlug }: BookingSidebarProps) {
    const t = useTranslations('SingleTour.sidebar');
    const td = useTranslations('ToursData');
    const summer = useTranslations('SummerOnly');
    const locale = useLocale();
    const isCallPrice = price === "Call" || price === "Contact" || isNaN(Number(price));

    // Get locale-specific price
    const numericPrice = Number(price);
    const displayPrice = locale === 'sq' && !isCallPrice
        ? Math.round(numericPrice * EUR_TO_LEK).toLocaleString('sq-AL')
        : price;
    const displayCurrency = locale === 'sq' && !isCallPrice ? ' Lek' : currency;

    // Check if this is the boat tour (transfers included)
    const isBoatTour = tourSlug === 'boat-tour';
    const isSeasonal = isSeasonalTour(tourSlug);
    const transfersIncludedText = isBoatTour ? td('boat-tour.transfersIncluded') : null;

    return (
        <Card className="sticky top-28 border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white p-8">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                        {locale === 'sq' && !isCallPrice ? (
                            <>{displayPrice}{displayCurrency}</>
                        ) : (
                            <>{displayCurrency}{displayPrice}</>
                        )}
                    </span>
                    {!isCallPrice && <span className="text-white/60">{t('perPerson')}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {isSeasonal && (
                        <Badge className="bg-sky-500/20 text-sky-100 border-sky-400/30 hover:bg-sky-500/30">
                            {summer('badge')}
                        </Badge>
                    )}
                    {isBoatTour && transfersIncludedText && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                            <Bus className="w-3 h-3 mr-1" />
                            {transfersIncludedText}
                        </Badge>
                    )}
                </div>
                {isSeasonal && (
                    <p className="text-xs text-white/70 mt-3 leading-relaxed">
                        {summer('short')}{' '}
                        <Link href="/autumn-winter" className="text-sky-200 underline underline-offset-2 hover:text-white">
                            {summer('link')}
                        </Link>
                    </p>
                )}
                <p className="text-white/40 text-xs mt-2 uppercase tracking-widest font-bold">
                    {t('bestPrice')}
                </p>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-1 rounded-full text-primary mt-1">
                            <Check className="w-3 h-3" />
                        </div>
                        <p className="text-sm text-slate-600">{t('instant')}</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-1 rounded-full text-primary mt-1">
                            <Zap className="w-3 h-3" />
                        </div>
                        <p className="text-sm text-slate-600">{t('skipLine')}</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-1 rounded-full text-primary mt-1">
                            <ShieldCheck className="w-3 h-3" />
                        </div>
                        <p className="text-sm text-slate-600">{t('trusted')}</p>
                    </div>
                </div>

                <Link href={{ pathname: '/book', query: { tour: tourSlug } }} className="w-full">
                    <MagneticButton className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20">
                        {isCallPrice ? t('contactQuote') : useTranslations('Common')('bookNow')}
                    </MagneticButton>
                </Link>
            </CardContent>

            <CardFooter className="bg-slate-50 p-6 flex justify-center border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium italic">
                    {useTranslations('Booking')('noPayment')}
                </p>
            </CardFooter>
        </Card>
    );
}
