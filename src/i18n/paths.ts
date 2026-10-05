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
    '/autumn-winter': { en: '/autumn-winter', sq: '/vjeshte-dimer' },
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

/**
 * Localize an internal, locale-less href used by <Link>.
 * localizeHref('/about', 'sq') => '/sq/rreth-nesh'
 * localizeHref('/tours/boat-tour', 'sq') => '/sq/turne/boat-tour'
 * Hrefs that are external, hash/query-only, or already locale-prefixed are returned unchanged.
 */
export function localizeHref(href: string, locale: string): string {
    if (!href.startsWith('/') || href.startsWith('//')) return href;
    if (/^\/(en|sq)(\/|$|\?|#)/.test(href)) return href;
    const m = href.match(/^([^?#]*)(.*)$/);
    const pathPart = m ? m[1] : href;
    const suffix = m ? m[2] : '';
    const trailing = pathPart.length > 1 && pathPart.endsWith('/');
    const clean = trailing ? pathPart.replace(/\/+$/, '') : pathPart;
    let out: string;
    if (clean.startsWith('/tours/')) {
        out = localizedTourPath(clean.slice('/tours/'.length), locale);
    } else {
        out = localizedPath(clean === '' ? '/' : clean, locale);
    }
    if (clean === '/' || clean === '') out = `/${locale}/`;
    else if (!out.endsWith('/')) out = `${out}/`;
    return `${out}${suffix}`;
}

const SQ_SEGMENT_TO_KEY: Record<string, string> = {
    'rreth-nesh': '/about',
    'galeria': '/gallery',
    'konservimi': '/conservation',
    'kontakt': '/contact',
    'turne': '/tours',
    'rezervo': '/book',
    'politika-e-privatise': '/privacy',
    'termat-dhe-kushtet': '/terms',
    'vjeshte-dimer': '/autumn-winter',
};

const EN_SEGMENT_TO_KEY: Record<string, string> = {
    'about': '/about',
    'gallery': '/gallery',
    'conservation': '/conservation',
    'contact': '/contact',
    'tours': '/tours',
    'book': '/book',
    'privacy': '/privacy',
    'terms': '/terms',
    'autumn-winter': '/autumn-winter',
};

/**
 * Map the current localized pathname to the equivalent path in another locale.
 * alternateLocalePath('/en/tours/boat-tour/', 'sq') => '/sq/turne/boat-tour/'
 */
export function alternateLocalePath(pathname: string, targetLocale: 'en' | 'sq'): string {
    const hasTrailingSlash = pathname.endsWith('/');
    const normalized = pathname.replace(/\/+$/, '') || '/';
    const match = normalized.match(/^\/(en|sq)(\/.*)?$/);

    if (!match) {
        const fallback = `/${targetLocale}/`;
        return fallback;
    }

    const currentLocale = match[1] as 'en' | 'sq';
    const rest = match[2] || '';
    const segments = rest.split('/').filter(Boolean);

    if (segments.length === 0) {
        return hasTrailingSlash || pathname.endsWith('/') ? `/${targetLocale}/` : `/${targetLocale}`;
    }

    const first = segments[0];
    const map = currentLocale === 'sq' ? SQ_SEGMENT_TO_KEY : EN_SEGMENT_TO_KEY;
    const logicalBase = map[first] ?? `/${first}`;

    if (logicalBase === '/tours' && segments.length > 1) {
        const slug = segments.slice(1).join('/');
        const path = localizedTourPath(slug, targetLocale);
        return hasTrailingSlash ? `${path}/` : path;
    }

    if (segments.length > 1) {
        const remainder = segments.slice(1).join('/');
        const path = localizedPath(`${logicalBase}/${remainder}`, targetLocale);
        return hasTrailingSlash ? `${path}/` : path;
    }

    const path = localizedPath(logicalBase, targetLocale);
    // localizedPath('/', ...) is not used here; for home we already returned.
    // Prefer trailing slash when the current URL had one (Astro static pages).
    if (hasTrailingSlash && !path.endsWith('/')) {
        return `${path}/`;
    }
    return path;
}
