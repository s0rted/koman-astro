import { useLocale } from './react-context';

export function Link({ href, children, ...props }: any) {
    const locale = useLocale();

    let path = typeof href === 'string' ? href : href.pathname;

    if (typeof href === 'object' && href.params) {
        Object.entries(href.params).forEach(([key, value]) => {
            path = path.replace(`[${key}]`, String(value));
        });
    }

    // Prefix with locale if not already present and not internal link/hash
    let localizedPath = path;
    if (locale === 'sq') {
        if (path.startsWith('/tours/')) {
            localizedPath = path.replace('/tours/', '/turne/');
        } else if (path === '/tours') {
            localizedPath = '/turne';
        } else if (path === '/contact') {
            localizedPath = '/kontakt';
        } else if (path === '/about') {
            localizedPath = '/rreth-nesh';
        } else if (path === '/gallery') {
            localizedPath = '/galeria';
        }

        if (!localizedPath.startsWith('/sq') && !localizedPath.startsWith('http')) {
            localizedPath = `/sq${localizedPath}`;
        }
    } else {
        if (!localizedPath.startsWith('/en') && !localizedPath.startsWith('http')) {
            localizedPath = `/en${localizedPath}`;
        }
    }

    return (
        <a href={localizedPath} {...props}>
            {children}
        </a>
    );
}
