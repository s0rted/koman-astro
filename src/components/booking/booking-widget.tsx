"use client";

import * as React from "react";
import { format } from "date-fns";
import { MapPin, Calendar as CalendarIcon, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useTranslations, useLocale } from '@/i18n/react-context';
import { localizedPath } from "@/i18n/paths";
import { TOURS, EUR_TO_LEK } from "@/lib/tours";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";

import { I18nProvider } from "@/i18n/react-context";

export function BookingWidget({ messages, locale }: { messages?: Record<string, any>; locale?: string }) {
    if (messages && locale) {
        return (
            <I18nProvider messages={messages} locale={locale}>
                <BookingWidgetContent />
            </I18nProvider>
        );
    }
    return <BookingWidgetContent />;
}

function BookingWidgetContent() {
    const t = useTranslations('Booking');
    const td = useTranslations('ToursData');
    const tc = useTranslations('Common');
    const locale = useLocale();
    const [date, setDate] = React.useState<Date>();
    const [tour, setTour] = React.useState<string>("boat-tour");
    const [guests, setGuests] = React.useState<string>("2");

    const selectedTourData = TOURS.find(t => t.slug === tour);

    const calculatePrice = () => {
        if (!selectedTourData) return null;
        if (selectedTourData.price === "Call" || selectedTourData.price === "Contact") return null;

        const priceValue = parseInt(selectedTourData.price);
        if (isNaN(priceValue)) return null;

        const guestCount = guests === '9+' ? 9 : parseInt(guests);
        return priceValue * guestCount;
    };

    const totalPrice = calculatePrice();

    const handleSearch = (e: React.MouseEvent) => {
        e.preventDefault();
        const dateStr = date ? format(date, "yyyy-MM-dd") : "";
        const params = new URLSearchParams({ tour, date: dateStr, guests });
        window.location.href = `${localizedPath('/book', locale)}?${params.toString()}`;
    };

    // Refined "Thin Bar" aesthetics
    const segmentBase = "flex flex-col items-start justify-center h-full px-5 hover:bg-slate-50 transition-all cursor-pointer select-none";
    const labelBase = "text-[9px] uppercase tracking-[0.15em] text-slate-900 font-black mb-0.5 pointer-events-none";
    const valueBase = "font-bold text-slate-900 text-[13px] md:text-sm truncate w-full pointer-events-none leading-none";

    return (
        <div className="w-full max-w-4xl mx-auto px-4 mt-8">
            <div className="bg-white rounded-2xl md:rounded-full shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-stretch border border-slate-100 p-1.5 gap-1.5 md:h-16 relative z-50">

                {/* 1. Tour Type */}
                <div className="flex-[1.2] relative min-w-0">
                    <Select value={tour} onValueChange={setTour}>
                        <SelectTrigger
                            aria-label={t('selectExperience')}
                            className="w-full h-12 md:h-full border-0 bg-transparent hover:bg-slate-50 transition-all rounded-xl md:rounded-l-full px-4 md:px-5 flex items-center !justify-start gap-3 focus:ring-0 focus:ring-offset-0 shadow-none ring-0"
                        >
                            <MapPin className="h-4 w-4 text-primary shrink-0 opacity-80" />
                            <div className="flex-1 flex flex-col items-start overflow-hidden text-left">
                                <span className={labelBase}>{t('selectExperience')}</span>
                                <div className={valueBase}>
                                    {selectedTourData ? td(`${selectedTourData.slug}.title`) : t('selectExperience')}
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 z-[100]" position="popper" sideOffset={8}>
                            {TOURS.map((tourItem) => (
                                <SelectItem
                                    key={tourItem.slug}
                                    value={tourItem.slug}
                                    className="rounded-xl py-3 focus:bg-primary/5 cursor-pointer"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900">{td(`${tourItem.slug}.title`)}</span>
                                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">
                                            {tourItem.price !== "Call" && tourItem.price !== "Contact"
                                                ? `${tourItem.price}${tourItem.currency} ${tc('perPerson')}`
                                                : tourItem.price}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="hidden md:block w-px bg-slate-100 my-4" />

                {/* 2. Date */}
                <div className="flex-1 relative">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                aria-label={t('pickDate')}
                                className={cn(segmentBase, "w-full h-12 md:h-full rounded-xl md:rounded-none flex flex-row items-center gap-3 px-4 md:px-5 group/date")}
                            >
                                <CalendarIcon className="h-4 w-4 text-primary shrink-0 opacity-80" />
                                <div className="flex-1 flex flex-col items-start overflow-hidden text-left">
                                    <span className={labelBase}>{t('pickDate')}</span>
                                    <div className={cn(valueBase, !date && "text-slate-300 font-medium")}>
                                        {date ? format(date, "MMM d, yyyy") : t('pickDate')}
                                    </div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down size-4 opacity-50 shrink-0"><path d="m6 9 6 6 6-6" /></svg>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-3xl shadow-2xl border-0 overflow-hidden z-[100]" align="center" sideOffset={12}>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                disabled={(date) => date < new Date()}
                                className="p-4 bg-white"
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="hidden md:block w-px bg-slate-100 my-4" />

                {/* 3. Number of Guests */}
                <div className="flex-1 relative">
                    <Select value={guests} onValueChange={setGuests}>
                        <SelectTrigger
                            aria-label={t('guests')}
                            className="w-full h-12 md:h-full border-0 bg-transparent hover:bg-slate-50 transition-all rounded-xl md:rounded-none px-4 md:px-5 flex items-center !justify-start gap-3 focus:ring-0 focus:ring-offset-0 shadow-none ring-0"
                        >
                            <User className="h-4 w-4 text-primary shrink-0 opacity-80" />
                            <div className="flex-1 flex flex-col items-start overflow-hidden text-left">
                                <span className={labelBase}>{t('guests')}</span>
                                <div className={valueBase}>
                                    {guests} {parseInt(guests) === 1 ? t('guestSingular') : t('guestPlural')}
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 min-w-[140px] z-[100]" position="popper" sideOffset={8}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, '9+'].map((num) => (
                                <SelectItem key={num} value={num.toString()} className="rounded-xl py-3 focus:bg-primary/5 font-bold cursor-pointer text-sm">
                                    {num} {num === 1 ? t('guestSingular') : t('guestPlural')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* 4. Find Space Button */}
                <div className="flex items-center h-full">
                    <button
                        onClick={handleSearch}
                        className="bg-primary hover:bg-primary/90 text-white w-full h-12 md:h-full md:min-w-[180px] rounded-xl md:rounded-full transition-all flex flex-col items-center justify-center shadow-lg active:scale-[0.97] px-6"
                    >
                        <div className="flex items-center gap-2 font-black text-sm lg:text-base whitespace-nowrap">
                            <Search className="h-4 w-4 stroke-[3px]" />
                            <span>{t('findSpace')}</span>
                        </div>
                        {totalPrice !== null && (
                            <span className="text-[10px] uppercase font-bold text-white mt-0.5 tracking-tighter">
                                {locale === 'sq'
                                    ? `${Math.round(totalPrice * EUR_TO_LEK).toLocaleString('sq-AL')} Lek Total`
                                    : `€${totalPrice} Total`}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
