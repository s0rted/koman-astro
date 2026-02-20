# Social Preview & SEO Production Checklist

This document details the fixes implemented to resolve the "Invalid Image Content Type" and "Redirect to Wix" issues encountered during the staging phase on Cloudflare Pages. Follow this checklist when migrating the site from staging (`koman-astro.pages.dev`) to production (`komanlake.com`).

## The Core Problem
Social media crawlers (Facebook, WhatsApp, LinkedIn) follow the `og:url` and `link rel="canonical"` tags. If these point to the old production domain (`komanlake.com`) while it is still hosted on Wix, the crawler will leave the staging site and scrape the old site instead. This results in:
- Outdated text/images.
- "Invalid Image Content Type" errors (if the crawler tries to fetch a Wix image using a Cloudflare path).
- Missing previews.

---

## Production Switch Checklist

When pointing the final DNS to Cloudflare and going live, you **MUST** update the following files to use `https://komanlake.com`:

### 1. Astro Configuration
**File:** `astro.config.mjs`
- **Change:** Ensure the `site` property points to the production domain.
```javascript
export default defineConfig({
  site: 'https://komanlake.com', 
  // ...
});
```

### 2. Main Layout (Meta Tags)
**File:** `src/layouts/Layout.astro`
- **Change:** Update the `siteUrl` variable.
```astro
---
// Change this from staging to production
const siteUrl = 'https://komanlake.com';
const ogImageUrl = `${siteUrl}/og-image.jpg`;
---
```
- **Verify:** Ensure `<meta property="og:url" content={siteUrl + Astro.url.pathname} />` and `<link rel="canonical" href={siteUrl + Astro.url.pathname} />` are using this variable.

### 3. Individual Tour Pages
To ensure specific tours share correctly, update the canonical logic in the page templates.
**Files:** 
- `src/pages/en/tours/[slug].astro`
- `src/pages/sq/turne/[slug].astro`

- **Change:** Update the `siteUrl` constant inside the frontmatter.
```astro
const siteUrl = 'https://komanlake.com';
const canonical = `${siteUrl}/en/tours/${slug}`;
```

### 4. JSON-LD Schemas (SEO)
Search engines and crawlers use these blocks for rich snippets.
**Files:**
- `src/components/seo/json-ld.tsx` (Main Business Schema)
- `src/components/seo/tour-json-ld.tsx` (Specific Tour Schema)

- **Change:** Replace all instances of `koman-astro.pages.dev` with `komanlake.com`.
```typescript
// example in tour-json-ld.tsx
"image": `https://komanlake.com${tour.banner}`,
"url": "https://komanlake.com",
```

### 5. Search Engines (Robots & Sitemap)
**File:** `public/robots.txt`
- **Change:** Update the Sitemap URL.
```text
Sitemap: https://komanlake.com/sitemap.xml
```

---

## Technical Reminders
1. **Facebook App ID**: We added `<meta property="fb:app_id" content="966242223397117" />` to `Layout.astro`. This is required for the Facebook Debugger to properly authorize the scrape.
2. **Absolute URLs**: OpenGraph images **MUST** use absolute URLs (including `https://`). Relative paths (`/og-image.jpg`) often fail to render on WhatsApp.
3. **Cache Busting**: After switching to production, if the old Wix image still appears, use the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and click **"Scrape Again"**. For WhatsApp, you can force a refresh by appending a query string: `https://komanlake.com/?v=1`.
