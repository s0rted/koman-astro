const PATHNAMES: Record<string, Record<string, string>> = {
    '/': { en: '', sq: '' },
    '/about': { en: '/about', sq: '/rreth-nesh' },
    '/gallery': { en: '/gallery', sq: '/galeria' },
    '/conservation': { en: '/conservation', sq: '/konservimi' },
    '/contact': { en: '/contact', sq: '/kontakt' },
    '/tours': { en: '/tours', sq: '/turne' },
    '/book': { en: '/book', sq: '/rezervo' },
    '/privacy': { en: '/privacy', sq: '/politika-e-privatise' },
    '/terms': { en: '/terms', sq: '/termat-dhe-kushtet' },
};

/**
 * Build a locale-aware path.
 * localizedPath('/about', 'sq') => '/sq/rreth-nesh'
 */
export function localizedPath(path: string, locale: string): string {
    const base = PATHNAMES[path]?.[locale] ?? path;
    return `/${locale}${base}`;
}

/**
 * Build a tour detail path.
 * localizedTourPath('boat-tour', 'sq') => '/sq/turne/boat-tour'
 */
export function localizedTourPath(slug: string, locale: string): string {
    const tourBase = locale === 'sq' ? '/turne' : '/tours';
    return `/${locale}${tourBase}/${slug}`;
}
