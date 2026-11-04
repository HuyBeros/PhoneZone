// Preserve bookmarked hash routes when moving from HashRouter to BrowserRouter.
export function getLegacyRoute(href) {
    const url = new URL(href);
    if (url.hash.startsWith('#/') && !url.hash.startsWith('#//')) {
        const route = new URL(url.hash.slice(1), url.origin);
        for (const [key, value] of url.searchParams) {
            if (key !== 'login' && !route.searchParams.has(key)) route.searchParams.append(key, value);
        }
        return route.pathname + route.search + route.hash;
    }
    if (url.pathname === '/' && url.searchParams.get('login') === 'true') {
        url.searchParams.delete('login');
        return '/login' + url.search + url.hash;
    }
    return null;
}
