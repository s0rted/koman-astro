import React from 'react';
import { Calendar, UserCheck, Leaf, ShieldCheck } from 'lucide-react';
import { useTranslations } from '@/i18n/react-context';

export const BookingBadges: React.FC = () => {
    const t = useTranslations('Booking.badges');

    const badges = [
        { key: 'season', icon: Calendar },
        { key: 'guides', icon: UserCheck },
        { key: 'eco', icon: Leaf },
        { key: 'secure', icon: ShieldCheck },
    ];

    return (
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {badges.map((badge) => {
                const Icon = badge.icon;
                return (
                    <div
                        key={badge.key}
                        className="py-4 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3 text-center transition-all hover:shadow-md hover:border-primary/20 group"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-600 transition-colors">
                            {t(badge.key)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
