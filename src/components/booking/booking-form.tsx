"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingValues } from "@/lib/validations/booking";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { CheckCircle2, Loader2, Mail, Phone, User as UserIcon, Minus, Plus, Bus, Clock, Calendar as CalendarIcon, Users, MessageSquare, CreditCard, Wallet, X, Copy, MessageCircle } from "lucide-react";
import { TOURS, isSeasonalTour } from "@/lib/tours";
import { formatLek } from "@/lib/format";
import { getPromo, type EarlyBirdPromo } from "@/config/promo";
import { BOOKING_ADDONS, buildLineItems, priceBooking, hasFixedPrice, isAddonAvailable, isAddonIncluded, type AddonDef } from "@/lib/booking-pricing";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "@/i18n/react-context";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { I18nProvider } from "@/i18n/react-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { BookingBadges } from "@/components/booking/booking-badges";

function AddonToggle({
    label,
    description,
    price,
    checked,
    onCheckedChange,
}: {
    label: string;
    description: string;
    price: ReactNode;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <FormItem className="relative rounded-xl border bg-slate-50/50">
            {/* Row label is a sibling of the checkbox (htmlFor -> checkbox id).
                One click writes state only through onCheckedChange. No row onClick,
                so Radix's bubble-input synthetic click cannot flip it again. */}
            <FormLabel className="flex cursor-pointer flex-row items-center justify-between gap-4 p-4">
                <span className="space-y-0.5">
                    <span className="block text-base font-bold text-slate-800">{label}</span>
                    <span className="block text-[13px] font-medium text-slate-500">{description}</span>
                    <span className="block text-[13px] font-bold text-slate-700">{price}</span>
                </span>
                <span className="h-6 w-6 shrink-0" aria-hidden="true" />
            </FormLabel>
            <div className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
                <FormControl>
                    <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => onCheckedChange(value === true)}
                        onClick={(event) => event.stopPropagation()}
                        className="w-6 h-6"
                    />
                </FormControl>
            </div>
        </FormItem>
    );
}

/** One row of the compact per-line price breakdown. */
interface BreakdownRow {
    key: string;
    label: string;
    regular: number;
    discount: number;
    final: number;
}

/** Compact per-line price list: each row struck when the promo discounts it. */
function PriceBreakdown({ heading, lines, formatAmount }: {
    heading: string;
    lines: BreakdownRow[];
    formatAmount: (amount: number) => string;
}) {
    if (lines.length === 0) return null;
    return (
        <div className="rounded-xl bg-white border border-slate-100 px-4 py-3 space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{heading}</p>
            {lines.map(row => (
                <div key={row.key} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="text-slate-600 font-medium min-w-0 truncate">{row.label}</span>
                    <span className="shrink-0 font-semibold text-slate-800">
                        {row.discount > 0 ? (
                            <>
                                <span className="line-through text-slate-400 font-normal mr-1.5">{formatAmount(row.regular)}</span>
                                {formatAmount(row.final)}
                            </>
                        ) : (
                            formatAmount(row.final)
                        )}
                    </span>
                </div>
            ))}
        </div>
    );
}

interface BookingFormProps {
    initialValues: Partial<BookingValues>;
}

export function BookingForm({ messages, locale, ...props }: BookingFormProps & { messages?: Record<string, any>; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <BookingFormContent {...props} />
            </I18nProvider>
        );
    }
    return <BookingFormContent {...props} />;
}

function BookingFormContent({ initialValues }: BookingFormProps) {
    const t = useTranslations('Booking');
    const td = useTranslations('ToursData');
    const summer = useTranslations('SummerOnly');
    const locale = useLocale();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isPaypalSuccess, setIsPaypalSuccess] = useState(false);
    const [pendingSend, setPendingSend] = useState<{ subject: string; body: string; mailtoUrl: string; whatsappUrl: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [showFloatingTotal, setShowFloatingTotal] = useState(true);
    const [cookieBannerVisible, setCookieBannerVisible] = useState(false);
    const [floatDismissed, setFloatDismissed] = useState(false);
    // Client-only "now": a new Date() during SSR would freeze the build date
    // into the static HTML (React #418). Null until mounted.
    const [now, setNow] = useState<Date | null>(null);
    const submitTotalRef = useRef<HTMLDivElement>(null);
    const floatVisible = showFloatingTotal && !floatDismissed;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            setIsSuccess(true);
            setIsPaypalSuccess(true);
        }
        // Static build: Astro.url.searchParams is empty at build time, so apply
        // ?tour= / ?guests= / ?date= on the client after mount.
        const qTour = params.get('tour');
        if (qTour && TOURS.some(t => t.slug === qTour)) form.setValue('tour', qTour);
        const qGuests = parseInt(params.get('guests') || '', 10);
        if (qGuests > 0) form.setValue('adults', qGuests);
        const qDate = params.get('date');
        if (qDate && !isNaN(Date.parse(qDate))) form.setValue('date', new Date(qDate + 'T00:00:00'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const form = useForm<BookingValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(bookingSchema) as any,
        defaultValues: {
            tour: initialValues.tour || "boat-tour",
            // Start undefined so SSR never bakes the build-day date into the
            // HTML (React #418); set to today after mount below.
            date: initialValues.date || undefined,
            adults: initialValues.adults || 2,
            children: 0,
            seniors: 0,
            addTransfer: false,
            addKayak: false,
            addFerry: false,
            name: "",
            email: "",
            phone: "",
            specialRequests: "",
            paymentMethod: "payInPerson" as const,
        },
    });

    const selectedTourSlug = form.watch("tour");
    const selectedTour = TOURS.find(t => t.slug === selectedTourSlug);
    const isCallPrice = !hasFixedPrice(selectedTour?.price);

    // Set "today" only after mount: during SSR a `new Date()` would freeze the
    // build date into the HTML and trigger React hydration error #418.
    useEffect(() => {
        setNow(new Date());
    }, []);

    useEffect(() => {
        if (!form.getValues("date")) {
            form.setValue("date", new Date(), { shouldDirty: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // The calendar marks "today" and past days as disabled at render time, so
    // its markup depends on the current date. Render it only on the client,
    // after mount, with a static skeleton for SSR.
    const [calendarMounted, setCalendarMounted] = useState(false);
    useEffect(() => {
        setCalendarMounted(true);
    }, []);

    const countAdults = form.watch("adults");
    const countChildren = form.watch("children") || 0;
    const countSeniors = form.watch("seniors") || 0;
    const watchedForm = form.watch();

    const transferAddon: AddonDef = BOOKING_ADDONS.find(a => a.id === "transfer")!;

    const isTransferIncluded = isAddonIncluded(transferAddon, selectedTourSlug);

    // Generic add-on clearing: when the tour changes to one where an add-on
    // isn't offered (or is included free), clear its checkbox so it isn't
    // priced or submitted. Driven by the BOOKING_ADDONS table, not by names.
    useEffect(() => {
        for (const addon of BOOKING_ADDONS) {
            const available = isAddonAvailable(addon, selectedTourSlug) && !isAddonIncluded(addon, selectedTourSlug);
            if (!available && (form.getValues() as Record<string, unknown>)[addon.field]) {
                form.setValue(addon.field as keyof BookingValues, false);
            }
        }
    }, [selectedTourSlug, form]);

    useEffect(() => {
        const readBanner = () => {
            const w = window as Window & { __komanCookieBannerVisible?: boolean };
            // Undefined until the banner mounts. It stays hidden for 1.5s and
            // whenever cookie-consent is already stored, so default to hidden.
            setCookieBannerVisible(w.__komanCookieBannerVisible === true);
        };
        const onBanner = (event: Event) => {
            const visible = Boolean((event as CustomEvent<{ visible?: boolean }>).detail?.visible);
            setCookieBannerVisible(visible);
        };
        const onStorage = (event: StorageEvent) => {
            if (event.key === "cookie-consent") setCookieBannerVisible(!event.newValue);
        };
        readBanner();
        setFloatDismissed(sessionStorage.getItem("booking-float-dismissed") === "1");
        window.addEventListener("koman:cookie-banner", onBanner);
        window.addEventListener("storage", onStorage);
        return () => {
            window.removeEventListener("koman:cookie-banner", onBanner);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    const dismissFloatingTotal = () => {
        sessionStorage.setItem("booking-float-dismissed", "1");
        setFloatDismissed(true);
    };

    useEffect(() => {
        const node = submitTotalRef.current;
        if (!node || typeof IntersectionObserver === "undefined") return;
        // Above the cookie chip the bubble occupies ~112px + its height.
        // Once the chip is gone it sits at bottom-6, so the covered band is shorter.
        const covered = cookieBannerVisible ? 176 : 96;
        const observer = new IntersectionObserver(
            ([entry]) => setShowFloatingTotal(!entry.isIntersecting),
            { threshold: 0, rootMargin: `0px 0px -${covered}px 0px` },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [cookieBannerVisible]);

    const paymentMethod = form.watch("paymentMethod");

    // Pricing is derived during render from watched values so it stays live
    // when date / tour / guests / add-ons change: one line per priced item,
    // per-line early-bird discount. `now` is client-only, so during SSR and
    // the first render the promo state is neutral (no UI).
    // "Call"/"Contact" tours have no computed price, so no promo UI for them.
    const watchedDate = form.watch("date");
    const promo: EarlyBirdPromo | null = now && !isCallPrice
        ? getPromo(now, watchedDate)
        : null;
    // Add-on selection as a plain boolean record keyed by form field name.
    const selectedAddons: Record<string, boolean | undefined> = {};
    for (const addon of BOOKING_ADDONS) {
        selectedAddons[addon.field] = (watchedForm as Record<string, unknown>)[addon.field] === true;
    }
    const lines = buildLineItems({
        tourSlug: selectedTourSlug,
        tourPrice: selectedTour?.price,
        adults: countAdults,
        children: countChildren,
        seniors: countSeniors,
        selected: selectedAddons,
    });
    const priced = priceBooking(lines, promo);
    const pricing = {
        regular: priced.regular,
        discount: priced.discount,
        final: priced.final,
    };

    // Regular total in the display currency of the current locale.
    const formatTotal = (amount: number): string =>
        locale === 'sq' ? `${formatLek(amount)} Lek` : `€${amount.toFixed(0)}`;

    const liveTotalLabel = isCallPrice
        ? (locale === 'sq' ? 'Kontakto' : 'Call')
        : (locale === 'sq'
            ? `${formatLek(priced.final)} Lek`
            : `€${priced.final.toFixed(0)}`);

    // EUR amount with decimals only when needed: 25 -> "25", 25.5 -> "25.50".
    const formatEur = (amount: number): string => {
        const rounded = Math.round(amount * 100) / 100;
        return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2);
    };

    // Per-line amount in the display currency of the current locale.
    const formatLine = (amount: number): string =>
        locale === 'sq' ? `${formatLek(Math.round(amount))} Lek` : `€${formatEur(amount)}`;

    // Add-on per-person price from data (not i18n strings), with the promo
    // discount shown crossed out next to the discounted price when it applies.
    const addonPriceNode = (addon: AddonDef): ReactNode => {
        const price = addon.pricePerPerson;
        const perPerson = locale === 'sq' ? `për person` : `per person`;
        if (promo?.applies) {
            const discounted = price * (1 - promo.percent / 100);
            return (
                <>
                    <span className="line-through text-slate-400 mr-1.5">+€{formatEur(price)} {perPerson}</span>
                    <span className="text-primary">+€{formatEur(discounted)} {perPerson}</span>
                </>
            );
        }
        return <>+€{formatEur(price)} {perPerson}</>;
    };

    const getLocalizedTourName = () => {
        const slug = selectedTourSlug;
        const translated = td(`${slug}.title`);
        // If translation returns the key itself, fall back to TOURS data
        return translated !== `${slug}.title` ? translated : (selectedTour?.title || slug);
    };

    // Guest-count suffix for the tour line of the price breakdown, e.g.
    // "2 adults, 1 child". Localized via the existing Booking.* keys.
    const lineGuestsLabel = [
        `${countAdults} ${t('adults')}`,
        countChildren > 0 ? `${countChildren} ${t('children')}` : "",
        countSeniors > 0 ? `${countSeniors} ${t('seniors')}` : "",
    ].filter(Boolean).join(", ");

    const bookingPagePath = locale === 'en' ? 'en/book' : 'sq/rezervo';

    const buildBookingSummary = (data: BookingValues) => {
        const tourName = getLocalizedTourName();
        const dateStr = data.date ? format(data.date, "PPP") : "Not specified";
        const totalGuests = data.adults + (data.children || 0) + (data.seniors || 0);
        // Owner message "Add-ons:" built generically from the priced lines
        // (selected, available, not included) via their English summaryLabel.
        const addons = priced.lines
            .filter(line => line.kind === "addon")
            .map(line => line.summaryLabel)
            .join(", ") || "None";
        const breakdownLines = priced.lines.map(line => {
            const label = line.kind === "tour" ? tourName : line.summaryLabel;
            return line.discount > 0
                ? `${label}: €${formatEur(line.regular)} → €${formatEur(line.final)}`
                : `${label}: €${formatEur(line.regular)}`;
        });

        return {
            tourName,
            dateStr,
            totalGuests,
            addons,
            subject: `New Booking Request: ${tourName} — ${data.name}`,
            body: [
                `NEW BOOKING REQUEST`,
                ``,
                `Tour: ${tourName}`,
                `Date: ${dateStr}`,
                `Guests: ${data.adults} adults, ${data.children || 0} children, ${data.seniors || 0} seniors (${totalGuests} total)`,
                `Add-ons: ${addons}`,
                `Price breakdown:`,
                ...breakdownLines,
                ...(promo?.applies
                    ? [
                        `Regular Total: €${formatEur(pricing.regular)}`,
                        `Early-bird discount (−${promo.percent}%): −€${formatEur(pricing.discount)}`,
                        `Final Total: €${formatEur(pricing.final)}`,
                    ]
                    : [`Estimated Total: €${formatEur(pricing.final)}`]),
                `Payment: Pay in Person`,
                ``,
                `CONTACT DETAILS`,
                `Name: ${data.name}`,
                `Email: ${data.email}`,
                `Phone: ${data.phone}`,
                data.specialRequests ? `Special Requests: ${data.specialRequests}` : ``,
            ].filter(Boolean).join("\n"),
        };
    };

    const onSubmit = async (data: BookingValues) => {
        setIsSubmitting(true);

        if (data.paymentMethod === "payNow") {
            // === PAYPAL FLOW: Redirect to PayPal checkout ===
            const tourName = getLocalizedTourName();
            const earlyBirdSuffix = promo?.applies ? ` (early-bird −${promo.percent}%)` : "";
            const itemName = encodeURIComponent(`${tourName} — ${data.name} (${data.adults}A/${data.children || 0}C/${data.seniors || 0}S)${earlyBirdSuffix}`);
            // Same computed total shown in the sticky bar (guests, transfer,
            // kayak, ferry, extra day), minus the early-bird discount.
            const amount = pricing.final.toFixed(2);
            const returnUrl = encodeURIComponent(window.location.origin + `/${bookingPagePath}?success=true&tour=${data.tour}`);
            const cancelUrl = encodeURIComponent(window.location.origin + `/${bookingPagePath}?tour=${data.tour}`);

            const paypalUrl = `https://www.paypal.com/cgi-bin/webscr`
                + `?cmd=_xclick`
                + `&business=mariomolla%40outlook.com`
                + `&item_name=${itemName}`
                + `&amount=${amount}`
                + `&currency_code=EUR`
                + `&no_shipping=1`
                + `&return=${returnUrl}`
                + `&cancel_return=${cancelUrl}`;

            window.location.href = paypalUrl;
            // Don't setIsSubmitting(false) — page is redirecting
        } else {
            // === RESERVATION FLOW: show send-step (do NOT claim received) ===
            const { subject, body } = buildBookingSummary(data);
            const mailtoUrl = `mailto:mariomolla@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            const whatsappUrl = `https://wa.me/355682022686?text=${encodeURIComponent(body)}`;
            setPendingSend({ subject, body, mailtoUrl, whatsappUrl });
            setIsSubmitting(false);
            setIsSuccess(true);
        }
    };

    const handleGuestChange = (type: "adults" | "children" | "seniors", operation: "add" | "sub") => {
        const current = form.getValues(type) || 0;
        const newVal = operation === "add" ? current + 1 : Math.max(0, current - 1);
        if (type === 'adults' && newVal < 1) return;
        form.setValue(type, newVal);
    };

    if (isSuccess && isPaypalSuccess) {
        return (
            <div className="text-center py-20 space-y-6">
                <div className="flex justify-center">
                    <CheckCircle2 className="w-20 h-20 text-primary animate-in zoom-in duration-500" />
                </div>
                <h2 className="text-4xl font-bold text-slate-900">{t('paypalSuccessTitle')}</h2>
                <div className="text-slate-500 max-w-md mx-auto">
                    <p>{t('paypalSuccessMessage')}</p>
                </div>
                <Button onClick={() => window.location.href = "/en/"} variant="outline" className="rounded-full h-12 px-8">
                    {locale === 'en' ? 'Return Home' : 'Kthehu në Faqe'}
                </Button>
            </div>
        );
    }

    if (isSuccess && pendingSend) {
        const copySummary = async () => {
            try {
                await navigator.clipboard.writeText(pendingSend.body);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch {
                // Fallback for older browsers
                const ta = document.createElement('textarea');
                ta.value = pendingSend.body;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        };

        return (
            <div className="text-center py-12 md:py-16 space-y-6 px-4">
                <div className="flex justify-center">
                    <MessageSquare className="w-16 h-16 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{t('sendStepTitle')}</h2>
                <p className="text-slate-600 max-w-lg mx-auto leading-relaxed">{t('sendStepMessage')}</p>
                <p className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 max-w-md mx-auto">
                    {t('sendStepNote')}
                </p>

                <div className="bg-slate-50 p-6 rounded-2xl max-w-md mx-auto border border-slate-100 text-left space-y-2">
                    <p className="text-sm text-slate-500">{t('estimatedTotal')}</p>
                    <p className="text-3xl font-bold text-primary flex items-baseline gap-2 flex-wrap">
                        {promo?.applies ? (
                            <>
                                <span className="text-base text-slate-400 line-through">{formatTotal(pricing.regular)}</span>
                                <span>{formatTotal(pricing.final)}</span>
                            </>
                        ) : (
                            <span>{formatTotal(pricing.final)}</span>
                        )}
                    </p>
                    {promo?.applies && (
                        <p className="text-sm font-semibold text-amber-700">
                            {t('earlyBirdLine', {
                                percent: promo.percent,
                                amount: locale === 'sq' ? `${formatLek(pricing.discount)} Lek` : `€${pricing.discount.toFixed(0)}`,
                            })}
                        </p>
                    )}
                    <PriceBreakdown
                        heading={locale === 'sq' ? 'Përbërja e çmimit' : 'Price breakdown'}
                        lines={priced.lines.map(line => ({
                            key: line.id,
                            label: line.kind === 'tour'
                                ? `${getLocalizedTourName()} — ${lineGuestsLabel}`
                                : t(line.labelKey),
                            regular: line.regular,
                            discount: line.discount,
                            final: line.final,
                        }))}
                        formatAmount={formatLine}
                    />
                    <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans bg-white rounded-xl p-4 border border-slate-100 max-h-48 overflow-auto">
{pendingSend.body}
                    </pre>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
                    <a
                        href={pendingSend.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white font-bold h-14 px-8 text-base shadow-lg hover:brightness-95 transition-all"
                    >
                        <MessageCircle className="w-5 h-5" />
                        {t('sendWhatsApp')}
                    </a>
                    <a
                        href={pendingSend.mailtoUrl}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white font-bold h-14 px-8 text-base shadow-lg hover:bg-slate-800 transition-all"
                    >
                        <Mail className="w-5 h-5" />
                        {t('sendEmail')}
                    </a>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button type="button" variant="outline" className="rounded-full h-12 px-6" onClick={copySummary}>
                        <Copy className="w-4 h-4 mr-2" />
                        {copied ? t('copiedSummary') : t('copySummary')}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full h-12 px-6"
                        onClick={() => {
                            setIsSuccess(false);
                            setPendingSend(null);
                            setCopied(false);
                        }}
                    >
                        {t('editBooking')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            {/* Live Price Header */}
            <div className="bg-slate-900 text-white p-6 md:px-12 flex justify-between items-center sticky top-0 md:relative z-10">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Select value={selectedTourSlug} onValueChange={(value) => form.setValue("tour", value)}>
                            <SelectTrigger aria-label={t("selectExperience")} className="bg-transparent border-none text-white font-heading font-bold text-lg md:text-xl p-0 h-auto focus:ring-0 focus:ring-offset-0 shadow-none hover:bg-white/10 px-2 rounded-lg transition-colors w-fit gap-2">
                                <SelectValue placeholder={t("selectExperience")} />
                            </SelectTrigger>
                            <SelectContent>
                                {TOURS.map((tour) => (
                                    <SelectItem key={tour.slug} value={tour.slug} className="font-medium">
                                        {td(`${tour.slug}.title`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isTransferIncluded && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1">
                                <Bus className="w-3 h-3" />
                                <span className="text-[10px] uppercase font-bold tracking-tighter">Transfers Included</span>
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-2 px-2">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        <p className="text-slate-400 text-sm font-medium">
                            {form.getValues('date') ? format(form.getValues('date'), 'MMMM do, yyyy') : t('pickDate')}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Total</p>
                    {promo?.applies ? (
                        <>
                            <p className="text-sm text-slate-400 line-through leading-none mb-0.5">{formatTotal(pricing.regular)}</p>
                            <p className="text-3xl md:text-4xl font-bold leading-none">{formatTotal(pricing.final)}</p>
                            <p className="text-xs font-semibold text-amber-300 mt-1">
                                {t('earlyBirdLine', {
                                    percent: promo.percent,
                                    amount: locale === 'sq' ? `${formatLek(pricing.discount)} Lek` : `€${pricing.discount.toFixed(0)}`,
                                })}
                            </p>
                        </>
                    ) : (
                        <p className="text-3xl md:text-4xl font-bold leading-none">
                            {isCallPrice ? (locale === 'sq' ? 'Kontakto' : 'Call') : (
                                locale === 'sq'
                                    ? `${formatLek(priced.final)} Lek`
                                    : `€${priced.final.toFixed(0)}`
                            )}
                        </p>
                    )}
                </div>
            </div>

            {/* Dynamic Tour Information */}
            <div className="bg-slate-50 border-b border-slate-100 p-6 md:p-10">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 min-w-fit">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-600 mb-0.5">{t('duration')}</span>
                                <p className="text-sm font-bold text-slate-900 leading-none">
                                    {selectedTour && td(`${selectedTour.slug}.duration`)}
                                </p>
                            </div>
                        </div>

                        <div className="hidden md:block h-10 w-px bg-slate-200" />
                        <div className="block md:hidden h-px w-full bg-slate-100" />

                        <div className="flex-1">
                            <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-600 mb-0.5">{t('summary')}</span>
                            <p className="text-sm text-slate-600 font-medium italic leading-relaxed">
                                {selectedTour && td(`${selectedTour.slug}.summary`)}
                            </p>
                        </div>
                    </div>

                    {isSeasonalTour(selectedTourSlug) && (
                        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950" role="status">
                            <p className="font-bold uppercase tracking-wide text-[11px] text-sky-800 mb-1">{summer('badge')}</p>
                            <p className="leading-relaxed">
                                {selectedTourSlug === 'boat-tour'
                                    ? summer('bookingNotice')
                                    : selectedTourSlug === 'shkoder-valbona'
                                        ? summer('bookingNoticeFerry')
                                        : summer('bookingNoticeGeneric')}{' '}
                                <a href={locale === 'sq' ? '/sq/vjeshte-dimer/' : '/en/autumn-winter/'} className="font-bold text-primary underline underline-offset-2">
                                    {summer('link')}
                                </a>
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-0.5 bg-emerald-500 rounded-full" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{t('whatsIncluded')}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedTour && Array.isArray(td.raw(`${selectedTour.slug}.inclusions`)) && (td.raw(`${selectedTour.slug}.inclusions`) as string[]).map((inclusion, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    <span className="text-xs font-semibold text-slate-700">{inclusion}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12 pb-28 md:pb-32">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        {/* Step 1: Date */}
                        <div className="space-y-6 pb-8 border-b border-slate-100">
                            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                {t('selectDate')}
                            </h2>
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-center">
                                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 w-full sm:w-auto shadow-sm flex justify-center">
                                            {calendarMounted ? (
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                                    }
                                                    calendarLocale={locale === 'sq' ? 'sq' : 'en'}
                                                    className="rounded-md"
                                                    initialFocus
                                                />
                                            ) : (
                                                <div
                                                    className="h-[352px] w-[352px] max-w-full animate-pulse rounded-md bg-slate-200/70"
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Step 2: Guests */}
                        <div className="space-y-6 pb-8 border-b border-slate-100">
                            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                {t('guests')}
                            </h2>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-700">{t('adults')}</p>
                                    <p className="text-xs text-slate-600">13+ years</p>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 rounded-full p-1 border border-slate-100">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={locale === "sq" ? "Ul të rriturit" : "Decrease adults"} onClick={() => handleGuestChange("adults", "sub")}>
                                        <Minus className="w-4 h-4 text-slate-600" />
                                    </Button>
                                    <span className="font-bold w-4 text-center">{countAdults}</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={locale === "sq" ? "Shto të rritur" : "Increase adults"} onClick={() => handleGuestChange("adults", "add")}>
                                        <Plus className="w-4 h-4 text-slate-600" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-700">{t('children')}</p>
                                        <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">{t('discount')}</Badge>
                                    </div>
                                    <p className="text-xs text-slate-600">4-12 years</p>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 rounded-full p-1 border border-slate-100">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={locale === "sq" ? "Ul fëmijët" : "Decrease children"} onClick={() => handleGuestChange("children", "sub")}>
                                        <Minus className="w-4 h-4 text-slate-600" />
                                    </Button>
                                    <span className="font-bold w-4 text-center">{countChildren}</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={locale === "sq" ? "Shto fëmijë" : "Increase children"} onClick={() => handleGuestChange("children", "add")}>
                                        <Plus className="w-4 h-4 text-slate-600" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-700">{t('seniors')}</p>
                                        <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">{t('discount')}</Badge>
                                    </div>
                                    <p className="text-xs text-slate-600">65+ years</p>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 rounded-full p-1 border border-slate-100">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={locale === "sq" ? "Ul të moshuarit" : "Decrease seniors"} onClick={() => handleGuestChange("seniors", "sub")}>
                                        <Minus className="w-4 h-4 text-slate-600" />
                                    </Button>
                                    <span className="font-bold w-4 text-center">{countSeniors}</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={locale === "sq" ? "Shto të moshuar" : "Increase seniors"} onClick={() => handleGuestChange("seniors", "add")}>
                                        <Plus className="w-4 h-4 text-slate-600" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pb-8 border-b border-slate-100">
                            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                {t('addons')}
                            </h2>

                            <div className="grid gap-4">
                                {/* Add-ons render generically from the BOOKING_ADDONS
                                    table (display order: extraDay, transfer, kayak,
                                    ferry). Available ones get a toggle with the price
                                    from data; included ones get the "Included" box. */}
                                {BOOKING_ADDONS.map((addon) => {
                                    if (!isAddonAvailable(addon, selectedTourSlug)) return null;
                                    const fieldName = addon.field as keyof BookingValues;
                                    if (isAddonIncluded(addon, selectedTourSlug)) {
                                        return (
                                            <div key={addon.id} className="flex flex-row items-center justify-between rounded-xl border border-primary/20 p-4 bg-primary/5">
                                                <div className="space-y-0.5">
                                                    <p className="text-base font-bold text-primary flex items-center gap-2">
                                                        <Bus className="w-5 h-5" />
                                                        {t(addon.labelKey)}
                                                    </p>
                                                    <p className="text-[13px] text-primary/70 font-medium">
                                                        {locale === 'sq' ? 'Transferta nga Shkodra është e përfshirë në çmim!' : 'Shkoder transfer is included in your tour price!'}
                                                    </p>
                                                </div>
                                                <Badge className="bg-primary text-white border-none">{locale === 'sq' ? 'E përfshirë' : 'Included'}</Badge>
                                            </div>
                                        );
                                    }
                                    return (
                                        <FormField
                                            key={addon.id}
                                            control={form.control}
                                            name={fieldName}
                                            render={({ field }) => (
                                                <AddonToggle
                                                    label={t(addon.labelKey)}
                                                    description={t(addon.descKey)}
                                                    price={addonPriceNode(addon)}
                                                    checked={!!field.value}
                                                    onCheckedChange={(checked) => field.onChange(checked)}
                                                />
                                            )}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-6 pb-8 border-b border-slate-100">
                            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                                {t('contact')}
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('fullName')}</FormLabel>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                                                <FormControl>
                                                    <Input placeholder={t('placeholderLocation')} className="pl-10 h-11 rounded-xl bg-slate-50/50" {...field} />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('email')}</FormLabel>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                                                <FormControl>
                                                    <Input placeholder={t('placeholderEmail')} className="pl-10 h-11 rounded-xl bg-slate-50/50" {...field} />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>{t('phone')}</FormLabel>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                                                <FormControl>
                                                    <Input placeholder={t('placeholderPhone')} className="pl-10 h-11 rounded-xl bg-slate-50/50" {...field} />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="specialRequests"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('specialRequests')}</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder={t('placeholderSpecial')} className="min-h-[100px] resize-none rounded-xl bg-slate-50/50" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-6">
                            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                                {t('paymentMethod')}
                            </h2>

                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <div className="grid gap-4">
                                        <div
                                            className={cn(
                                                "flex flex-row items-center justify-between rounded-xl border p-4 cursor-pointer transition-all",
                                                field.value === 'payNow' ? "border-primary bg-primary/5 shadow-md" : "bg-slate-50/50 border-slate-100"
                                            )}
                                            onClick={() => field.onChange('payNow')}
                                        >
                                            <div className="flex gap-4 items-center">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                    field.value === 'payNow' ? "bg-primary text-white" : "bg-white text-slate-400 border border-slate-100"
                                                )}>
                                                    <CreditCard className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-base font-bold text-slate-800">{t('payNow')}</p>
                                                    <p className="text-[12px] text-slate-500 font-medium leading-tight">{t('payNowDesc')}</p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                                field.value === 'payNow' ? "border-primary bg-primary" : "border-slate-200"
                                            )}>
                                                {field.value === 'payNow' && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                        </div>

                                        <div
                                            className={cn(
                                                "flex flex-row items-center justify-between rounded-xl border p-4 cursor-pointer transition-all",
                                                field.value === 'payInPerson' ? "border-primary bg-primary/5 shadow-md" : "bg-slate-50/50 border-slate-100"
                                            )}
                                            onClick={() => field.onChange('payInPerson')}
                                        >
                                            <div className="flex gap-4 items-center">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                    field.value === 'payInPerson' ? "bg-primary text-white" : "bg-white text-slate-400 border border-slate-100"
                                                )}>
                                                    <Wallet className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-base font-bold text-slate-800">{t('payInPerson')}</p>
                                                    <p className="text-[12px] text-slate-500 font-medium leading-tight">{t('payInPersonDesc')}</p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                                field.value === 'payInPerson' ? "border-primary bg-primary" : "border-slate-200"
                                            )}>
                                                {field.value === 'payInPerson' && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>

                        <div className="pt-4 space-y-3">
                            <PriceBreakdown
                                heading={locale === 'sq' ? 'Përbërja e çmimit' : 'Price breakdown'}
                                lines={priced.lines.map(line => ({
                                    key: line.id,
                                    label: line.kind === 'tour'
                                        ? `${getLocalizedTourName()} — ${lineGuestsLabel}`
                                        : t(line.labelKey),
                                    regular: line.regular,
                                    discount: line.discount,
                                    final: line.final,
                                }))}
                                formatAmount={formatLine}
                            />
                            <div ref={submitTotalRef} className="flex items-center gap-4">
                                <div className="shrink-0 text-left">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Total</p>
                                    {promo?.applies ? (
                                        <>
                                            <p className="text-sm text-slate-400 line-through leading-none mb-0.5">{formatTotal(pricing.regular)}</p>
                                            <p className="text-2xl font-bold leading-none text-slate-900">{formatTotal(pricing.final)}</p>
                                        </>
                                    ) : (
                                        <p className="text-2xl font-bold leading-none text-slate-900">{liveTotalLabel}</p>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    {paymentMethod === 'payNow' ? (
                                        <Button type="submit" className="w-full h-14 rounded-2xl bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold text-base gap-2" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                                                <>
                                                    <CreditCard className="w-5 h-5" />
                                                    {t('payNow')}
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-white font-bold" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                                                <>
                                                    <Wallet className="w-5 h-5 mr-2" />
                                                    {t('submit')}
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {promo?.bookingOpen && !promo?.applies && !isCallPrice && (
                                <p className="text-center text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
                                    {t('earlyBirdHint', { season: promo.seasonYear, percent: promo.percent })}
                                </p>
                            )}
                            <p className="text-center text-xs text-slate-600">
                                {paymentMethod === 'payNow'
                                    ? (locale === 'en'
                                        ? "You will be redirected to PayPal to complete your payment."
                                        : "Do të ridrejtoheni në PayPal për të përfunduar pagesën.")
                                    : t('noPayment')}
                            </p>
                        </div>

                        {/* Integration of Booking Badges at the bottom of the form island */}
                        <div className="pt-8 border-t border-slate-100">
                            <BookingBadges t={t} />
                        </div>
                    </form>
                </Form>
            </div>
        </div>

            <div
                aria-hidden={!floatVisible}
                className={cn(
                    "fixed left-6 z-40 w-max max-w-[min(18rem,calc(100%-8rem))] rounded-2xl border border-white/10 bg-slate-900/80 text-white shadow-lg backdrop-blur-md pl-4 pr-8 py-2.5 transition-all duration-200",
                    cookieBannerVisible ? "bottom-28" : "bottom-6",
                    floatVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[calc(100%+8rem)] opacity-0",
                )}
            >
                <button
                    type="button"
                    onClick={dismissFloatingTotal}
                    aria-label={locale === 'sq' ? 'Mbyll totalin' : 'Close total'}
                    className="absolute right-1.5 top-1.5 rounded-md p-1 text-slate-300 hover:bg-white/10 hover:text-white"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-300">Total</p>
                <p className="text-xs text-slate-300 truncate">{getLocalizedTourName()}</p>
                {promo?.applies ? (
                    <p className="text-xl font-bold leading-none mt-1 flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-xs font-medium text-slate-400 line-through">{formatTotal(pricing.regular)}</span>
                        <span>{formatTotal(pricing.final)}</span>
                    </p>
                ) : (
                    <p className="text-xl font-bold leading-none mt-1">
                        {isCallPrice ? (locale === 'sq' ? 'Kontakto' : 'Call') : (
                            locale === 'sq'
                                ? `${formatLek(priced.final)} Lek`
                                : `€${priced.final.toFixed(0)}`
                        )}
                    </p>
                )}
            </div>
        </>
    );
}
