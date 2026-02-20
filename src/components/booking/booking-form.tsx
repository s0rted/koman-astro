"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingValues } from "@/lib/validations/booking";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Mail, Phone, User as UserIcon, Minus, Plus, Bus, Clock, Calendar as CalendarIcon, Users, MessageSquare, CreditCard, Wallet } from "lucide-react";
import { TOURS, EUR_TO_LEK } from "@/lib/tours";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "@/i18n/react-context";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { I18nProvider } from "@/i18n/react-context";

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
    const locale = useLocale();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);

    const form = useForm<BookingValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(bookingSchema) as any,
        defaultValues: {
            tour: initialValues.tour || "boat-tour",
            date: initialValues.date || new Date(),
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
    const isCallPrice = selectedTour?.price === "Call" || selectedTour?.price === "Contact";

    const countAdults = form.watch("adults");
    const countChildren = form.watch("children") || 0;
    const countSeniors = form.watch("seniors") || 0;
    const hasTransfer = form.watch("addTransfer");
    const hasKayak = form.watch("addKayak");
    const hasFerry = form.watch("addFerry");

    const hasExtraDay = form.watch("addExtraDay");

    const isTransferIncluded = selectedTourSlug === 'boat-tour' || selectedTourSlug === 'local-experience';

    useEffect(() => {
        if (!selectedTour) return;

        let basePrice = Number(selectedTour.price) || 0;

        // Handle Local Experience Extra Day logic (Base 100 -> 130)
        if (selectedTourSlug === 'local-experience' && hasExtraDay) {
            basePrice += 30;
        }

        if (isNaN(basePrice)) {
            setTotalPrice(0);
            return;
        }

        const adultCost = countAdults * basePrice;
        const discountMult = 0.7;
        const childCost = countChildren * (basePrice * discountMult);
        const seniorCost = countSeniors * (basePrice * discountMult);

        const totalGuests = countAdults + countChildren + countSeniors;

        // Transfers are free/included for boat-tour and local-experience
        const transferCost = (hasTransfer && !isTransferIncluded) ? (30 * totalGuests) : 0;
        const ferryCost = hasFerry ? (10 * totalGuests) : 0;
        const kayakCost = hasKayak ? (20 * totalGuests) : 0;

        setTotalPrice(adultCost + childCost + seniorCost + transferCost + ferryCost + kayakCost);

    }, [countAdults, countChildren, countSeniors, hasTransfer, hasKayak, hasFerry, hasExtraDay, selectedTour, selectedTourSlug, isTransferIncluded]);

    const onSubmit = async (data: BookingValues) => {
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    const handleGuestChange = (type: "adults" | "children" | "seniors", operation: "add" | "sub") => {
        const current = form.getValues(type) || 0;
        const newVal = operation === "add" ? current + 1 : Math.max(0, current - 1);
        if (type === 'adults' && newVal < 1) return;
        form.setValue(type, newVal);
    };

    if (isSuccess) {
        return (
            <div className="text-center py-20 space-y-6">
                <div className="flex justify-center">
                    <CheckCircle2 className="w-20 h-20 text-primary animate-in zoom-in duration-500" />
                </div>
                <h2 className="text-4xl font-bold text-slate-900">{t('successTitle')}</h2>
                <p className="text-slate-500 max-w-md mx-auto">
                    {t('successMessage', {
                        name: form.getValues('name'),
                        tour: selectedTour?.title || form.getValues('tour'),
                        email: form.getValues('email')
                    })}
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl max-w-sm mx-auto border border-slate-100">
                    <p className="text-sm text-slate-500 mb-2">{t('estimatedTotal')}</p>
                    <p className="text-3xl font-bold text-primary">€{totalPrice.toFixed(0)}</p>
                </div>

                {form.getValues('paymentMethod') === 'payNow' && (
                    <div className="bg-primary/5 p-6 rounded-2xl max-w-sm mx-auto border border-primary/20 space-y-3">
                        <div className="flex justify-center">
                            <CreditCard className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                            {locale === 'en'
                                ? "Complete Payment via PayPal"
                                : "Përfundoni Pagesën përmes PayPal"}
                        </p>
                        <p className="text-xs text-slate-600">
                            {locale === 'en'
                                ? "Please send the total amount to our PayPal email to confirm your slot:"
                                : "Ju lutemi dërgoni shumën totale në emailin tonë të PayPal për të konfirmuar vendin tuaj:"}
                        </p>
                        <p className="text-base font-bold text-primary select-all">mariomolla@outlook.com</p>
                    </div>
                )}
                <Button onClick={() => window.location.href = "/"} variant="outline" className="rounded-full">
                    Return Home
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            {/* Live Price Header */}
            <div className="bg-slate-900 text-white p-6 md:px-12 flex justify-between items-center sticky top-0 md:relative z-10">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Select value={selectedTourSlug} onValueChange={(value) => form.setValue("tour", value)}>
                            <SelectTrigger className="bg-transparent border-none text-white font-heading font-bold text-lg md:text-xl p-0 h-auto focus:ring-0 focus:ring-offset-0 shadow-none hover:bg-white/10 px-2 rounded-lg transition-colors w-fit gap-2">
                                <SelectValue placeholder="Select a tour" />
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
                    <p className="text-slate-400 text-sm px-2">{format(form.getValues('date'), 'MMMM do, yyyy')}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Total</p>
                    <p className="text-3xl md:text-4xl font-bold leading-none">
                        {isCallPrice ? (locale === 'sq' ? 'Kontakto' : 'Call') : (
                            locale === 'sq'
                                ? `${Math.round(totalPrice * EUR_TO_LEK).toLocaleString('sq-AL')} Lek`
                                : `€${totalPrice.toFixed(0)}`
                        )}
                    </p>
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
                                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">{t('duration')}</span>
                                <p className="text-sm font-bold text-slate-900 leading-none">
                                    {selectedTour && td(`${selectedTour.slug}.duration`)}
                                </p>
                            </div>
                        </div>

                        <div className="hidden md:block h-10 w-px bg-slate-200" />
                        <div className="block md:hidden h-px w-full bg-slate-100" />

                        <div className="flex-1">
                            <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">{t('summary')}</span>
                            <p className="text-sm text-slate-600 font-medium italic leading-relaxed">
                                {selectedTour && td(`${selectedTour.slug}.summary`)}
                            </p>
                        </div>
                    </div>

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

            <div className="p-8 md:p-12">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        <div className="space-y-6 pb-8 border-b border-slate-100">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                {t('guests')}
                            </h4>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-700">{t('adults')}</p>
                                    <p className="text-xs text-slate-400">13+ years</p>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 rounded-full p-1 border border-slate-100">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleGuestChange("adults", "sub")}>
                                        <Minus className="w-4 h-4 text-slate-600" />
                                    </Button>
                                    <span className="font-bold w-4 text-center">{countAdults}</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleGuestChange("adults", "add")}>
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
                                    <p className="text-xs text-slate-400">4-12 years</p>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 rounded-full p-1 border border-slate-100">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleGuestChange("children", "sub")}>
                                        <Minus className="w-4 h-4 text-slate-600" />
                                    </Button>
                                    <span className="font-bold w-4 text-center">{countChildren}</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleGuestChange("children", "add")}>
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
                                    <p className="text-xs text-slate-400">65+ years</p>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 rounded-full p-1 border border-slate-100">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleGuestChange("seniors", "sub")}>
                                        <Minus className="w-4 h-4 text-slate-600" />
                                    </Button>
                                    <span className="font-bold w-4 text-center">{countSeniors}</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleGuestChange("seniors", "add")}>
                                        <Plus className="w-4 h-4 text-slate-600" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pb-8 border-b border-slate-100">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                {t('addons')}
                            </h4>

                            <div className="grid gap-4">

                                {selectedTourSlug === 'local-experience' && (
                                    <FormField
                                        control={form.control}
                                        name="addExtraDay"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-slate-50/50 cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base font-bold text-slate-800">{t('addExtraDay')}</FormLabel>
                                                    <p className="text-[13px] text-slate-500 font-medium">{t('addExtraDayDesc')}</p>
                                                </div>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="w-6 h-6" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {!isTransferIncluded ? (
                                    <FormField
                                        control={form.control}
                                        name="addTransfer"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-slate-50/50 cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base font-bold text-slate-800">{t('transfer')}</FormLabel>
                                                    <p className="text-[13px] text-slate-500 font-medium">{t('transferDesc')}</p>
                                                </div>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="w-6 h-6" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                ) : (
                                    <div className="flex flex-row items-center justify-between rounded-xl border border-primary/20 p-4 bg-primary/5">
                                        <div className="space-y-0.5">
                                            <p className="text-base font-bold text-primary flex items-center gap-2">
                                                <Bus className="w-5 h-5" />
                                                {t('transfer')}
                                            </p>
                                            <p className="text-[13px] text-primary/70 font-medium">
                                                {locale === 'sq' ? 'Transferta nga Shkodra është e përfshirë në çmim!' : 'Shkoder transfer is included in your tour price!'}
                                            </p>
                                        </div>
                                        <Badge className="bg-primary text-white border-none">{locale === 'sq' ? 'E përfshirë' : 'Included'}</Badge>
                                    </div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="addKayak"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-slate-50/50 cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base font-bold text-slate-800">{t('kayak')}</FormLabel>
                                                <p className="text-[13px] text-slate-500 font-medium">{t('kayakDesc')}</p>
                                            </div>
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="w-6 h-6" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="addFerry"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-slate-50/50 cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base font-bold text-slate-800">{t('ferry')}</FormLabel>
                                                <p className="text-[13px] text-slate-500 font-medium">{t('ferryDesc')}</p>
                                            </div>
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="w-6 h-6" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                {t('contact')}
                            </h4>

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('fullName')}</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Input placeholder={t('placeholderLocation')} className="pl-10 h-11 rounded-xl bg-slate-50/50" {...field} />
                                                </div>
                                            </FormControl>
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
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Input placeholder={t('placeholderEmail')} className="pl-10 h-11 rounded-xl bg-slate-50/50" {...field} />
                                                </div>
                                            </FormControl>
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
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Input placeholder={t('placeholderPhone')} className="pl-10 h-11 rounded-xl bg-slate-50/50" {...field} />
                                                </div>
                                            </FormControl>
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
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                                {t('paymentMethod')}
                            </h4>

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

                        <div className="pt-4">
                            <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-white font-bold" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : t('submit')}
                            </Button>
                            <p className="text-center text-xs text-slate-400 mt-4">{t('noPayment')}</p>
                        </div>
                    </form>
                </Form>
            </div>
        </div >
    );
}
