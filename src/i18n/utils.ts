import en from './en.json';
import sq from './sq.json';

const messages: Record<string, any> = { en, sq };
export const LOCALES = ['en', 'sq'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Get a nested translation string: t('en', 'Navbar.home') */
export function t(locale: Locale, key: string): string {
    const keys = key.split('.');
    let val: any = messages[locale];
    for (const k of keys) {
        val = val?.[k];
        if (val === undefined) return key;
    }
    return typeof val === 'string' ? val : key;
}

/** Get raw value (arrays, objects) for things like inclusions/itinerary */
export function tRaw(locale: Locale, key: string): any {
    const keys = key.split('.');
    let val: any = messages[locale];
    for (const k of keys) {
        val = val?.[k];
        if (val === undefined) return undefined;
    }
    return val;
}

/** Get full message tree for a locale (to pass into React context) */
export function getMessages(locale: Locale) {
    return messages[locale];
}
