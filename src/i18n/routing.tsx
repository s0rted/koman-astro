import { useLocale } from './react-context';
import { localizeHref } from './paths';

/**
 * Locale-aware anchor. Accepts a locale-less internal path ('/about', '/tours/boat-tour')
 * or an object { pathname, params? } and maps it via the shared table in paths.ts,
 * so links, the language switcher and hreflang all use the same slugs.
 */
export function Link({ href, children, ...props }: any) {
    const locale = useLocale() || 'en';

    let path: string = typeof href === 'string' ? href : href.pathname;

    if (typeof href === 'object' && href.params) {
        Object.entries(href.params).forEach(([key, value]) => {
            path = path.replace(`[${key}]`, String(value));
        });
    }

    const localizedPath = localizeHref(path, locale);

    return (
        <a href={localizedPath} {...props}>
            {children}
        </a>
    );
}
