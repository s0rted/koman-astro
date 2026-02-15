"use client";

import { createContext, useContext, useCallback } from 'react';

interface I18nContextValue {
    locale: string;
    messages: Record<string, any>;
}

const I18nContext = createContext<I18nContextValue>({ locale: 'en', messages: {} });

export function I18nProvider({
    locale,
    messages,
    children,
}: {
    locale: string;
    messages: Record<string, any>;
    children: React.ReactNode;
}) {
    return (
        <I18nContext.Provider value={{ locale, messages }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useLocale() {
    return useContext(I18nContext).locale;
}

/** Drop-in replacement for next-intl's useTranslations */
export function useTranslations(namespace?: string) {
    const { messages } = useContext(I18nContext);
    const base = namespace ? messages?.[namespace] : messages;

    const translate = useCallback(
        (key: string, values?: Record<string, any>): string => {
            const keys = key.split('.');
            let val: any = base;
            for (const k of keys) {
                val = val?.[k];
            }
            let text = typeof val === 'string' ? val : key;

            if (values) {
                Object.entries(values).forEach(([k, v]) => {
                    text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
                });
            }
            return text;
        },
        [base]
    );

    // Mimic next-intl's t.raw() for arrays / objects
    (translate as any).raw = (key: string): any => {
        const keys = key.split('.');
        let val: any = base;
        for (const k of keys) {
            val = val?.[k];
        }
        return val;
    };

    return translate as ((key: string, values?: Record<string, any>) => string) & { raw: (key: string) => any };
}

/** Drop-in replacement for next-intl's useMessages */
export function useMessages() {
    return useContext(I18nContext).messages;
}
