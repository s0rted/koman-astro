# PRD: Koman Lake site audit fixes (2026-11-02)

| | |
|---|---|
| Status | Ready for implementation. No fixes have been implemented yet (see "Implementation status"). |
| Base | `speed-optimized` @ `2969c65` (production branch) |
| Site | https://www.komanlake.com/ (Astro 5 static site, React islands, Cloudflare Pages) |
| Locales | `en` and `sq` (Albanian). Strings live in `src/i18n/en.json` and `src/i18n/sq.json` |
| Audit tool | `komanlake_i18n_audit.py BASE_URL REPO_DIR OUT_PREFIX [--shots]` (Playwright Chromium, desktop and mobile, 33 pages) |
| Suggested work branch | `fix/site-audit-20261102`, one commit per fix below |

## Implementation status

- The fixes were meant to be done by GLM-5.3-Flash through Hermes on the Mac mini, because Grok Build is out of balance (HTTP 402).
- They were **not run.** Hermes points at z.ai's pay-as-you-go endpoint (`api.z.ai/api/paas/v4`, provider `zai`). z.ai's pricing page lists GLM-5.3-Flash at $0.15 per 1M input tokens and $0.50 per 1M output tokens, so it isn't free. The rule is no paid API calls.
- Free options for later: `glm-4.7-flash` / `glm-4.5-flash`, which are free on z.ai with the same provider; GLM-5.3-Flash on NVIDIA's free API catalog; or Grok Build once its balance is back.
- So this document is the full spec. Every finding below was reproduced, and the root causes for fix 1 were confirmed (evidence included).

## Audit summary (before)

| Severity | Type | Local build (127.0.0.1:4321) | Live (komanlake.com) |
|---|---|---|---|
| HIGH | console (React #418) | 12 | 16 |
| HIGH | missing-key | 1 | 1 |
| MED | english-text-on-sq-page | 118 | 118 |
| MED | identical-to-en-page | 68 | 68 |
| MED | missing-key | 1 | 1 |
| LOW | form-input-no-label | 14 | 14 |
| LOW | console (warnings) | 11 | 13 |
| LOW | seo-description-long | 1 | 1 |
| | **Total** | **226** | **232** |

There are 4 more HIGH findings on live than on local: `/en/book/` and `/sq/rezervo/` (desktop and mobile). That's expected, and it's explained in fix 1b.

No broken internal links or missing assets were reported. EN pages show no hydration errors except `/en/book/` on live.

---

## Fix 1 (HIGH): React hydration error #418 (text mismatch)

**Symptom.** `pageerror: Minified React error #418; ...args[]=text` fires on page load, on both desktop and mobile. When hydration fails, React drops the server HTML for that island and re-renders it on the client. That causes layout shift and slower interactivity, and on some pages it fires twice.

**Pages**
- Local and live: `/sq/`, `/sq/turne/`, `/sq/turne/boat-tour/`, `/sq/turne/kayak-rental/`, `/sq/turne/local-experience/`, `/sq/turne/shkoder-valbona/`
- Live only: `/en/book/`, `/sq/rezervo/`

There are two separate root causes. Both are confirmed.

### 1a. Lek price formatting differs between Node (build) and the browser

On `sq`, prices are converted from EUR to Lek and formatted with `toLocaleString('sq-AL')`:

- `src/components/sections/tour-grid.tsx:102`
- `src/components/booking/booking-sidebar.tsx:43`
- `src/components/booking/mobile-booking-bar.tsx:51`
- `src/components/booking/booking-widget.tsx:186`
- `src/components/booking/booking-form.tsx:217, 442, 892`
- Rate: `EUR_TO_LEK = 106` in `src/lib/tours.ts:18`

Evidence, from the same number (54 EUR × 106 = 5724):

- Node (build, ICU 78.3): `(5724).toLocaleString('sq-AL')` gives `"5724"`. The CLDR Albanian minimum grouping digits is 2, so 4-digit numbers aren't grouped.
- Chromium (client): the same call gives `"5,724"`.
- Live SSR HTML for `/sq/turne/boat-tour/` contains `5724<!-- --> Lek`. After hydration the DOM shows `5,724 Lek`, and #418 fires twice on that page.

That explains why every sq page with a numeric Lek price errors. EN pages show EUR as-is and are clean. Helicopter and custom-tour have "Call" prices, so they're clean too.

**Fix**
1. Add one deterministic formatter in `src/lib/` (for example `formatLek(eur: number | string): string`) that doesn't depend on the runtime's ICU data.
   - One option is to group thousands with a fixed separator via regex: `String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')`, using U+00A0 or a plain space, consistently.
   - Another is `Intl.NumberFormat('en-US', { useGrouping: true })` with a pinned locale that formats the same in Node and Chrome.
   - Pick the style the owner wants. Albanian usage is normally `5 724` (space), and `5.724` is also seen.
2. Replace all 7 call sites above with the helper. The total calculation in booking-widget and booking-form must use the same helper.
3. Key parity: `en.json:359` has `ToursData.boat-tour.priceLek: "5,700"` while `sq.json:359` has `ToursData.boat-tour.priceEur: "54"`. Make both files carry the same keys (or delete the unused one after grepping for use). This clears the HIGH and MED `missing-key` findings.

### 1b. Booking pages bake the build date into HTML

The live SSR HTML of `/en/book/` contains `aria-label="Today, Monday, October 5th, 2026, selected"`, which is the day the site was last built. The client renders the real "today" (Nov 2, 2026), so the text differs and #418 fires. Locally it didn't fire only because the build and the test ran on the same day. Sources:

- `src/components/booking/booking-form.tsx:106`: `date: initialValues.date || new Date()`, which is evaluated at build time
- `src/components/booking/booking-form.tsx:529`: the disabled-days predicate uses `new Date()`
- `src/components/booking/booking-widget.tsx:139`: `disabled={(date) => date < new Date()}`
- `src/components/ui/calendar.tsx`: `toLocaleString("default", ...)` and `toLocaleDateString()` depend on the runtime locale
- `src/components/layout/footer.tsx:111`: `new Date().getFullYear()`. This is harmless until Jan 1, when a build from the previous year would mismatch. Fix it the same way.

**Fix**
- Don't render anything that depends on "now" during SSR.
  - Start the date as `undefined` (or a fixed placeholder) and set it in `useEffect` after mount.
  - Or render the calendar only on the client (`client:only="react"`, or a `mounted` guard that shows a skeleton on the server).
- Pass an explicit locale (`en-GB`/`en-US` or `sq`) instead of `"default"` in `calendar.tsx`.
- Related i18n issue on `/sq/rezervo/`: the calendar's aria-labels are English ("Today, Monday, November 2nd, 2026, selected", "Previous month", "Next month"). Pass the `sq` date-fns locale (`import { sq } from 'date-fns/locale'`) and translated nav labels when `locale === 'sq'`.

**Acceptance criteria**
- Run Playwright on desktop and mobile against a production build (`npm run build && npm run preview`) and against the Cloudflare preview. There should be zero `pageerror` / #418 on all 8 pages above.
- On `/en/book/` and `/sq/rezervo/`, check this with the test machine's clock set to a different day from the build day. For example, build, then run the audit with Playwright's `clock` / a `timezoneId` and date override set one day ahead.
- Lek prices render the same before and after hydration (the SSR HTML string matches the post-hydration DOM text).
- `en.json` and `sq.json` have identical key sets under `ToursData`.
- EN pages stay clean.

---

## Fix 2 (MED): Gallery captions and alt text in English on `/sq/galeria/`

**Evidence.** 50+ findings on `/sq/galeria/`: each photo's `<p>` caption and `<img alt>` are English. They appear under both `english-text-on-sq-page` and `identical-to-en-page`.

**Root cause.** `src/components/pages/gallery-page.tsx` has 52 photos (`{ src, alt }`) and an `ALTS_SQ` map (line 69) with only **25** entries. Line 108 falls back to English: `ALTS_SQ[p.src] || p.alt`. These **27** photos have no Albanian text:

```
DSC_0532 IMG_3058 IMG_3021 DSC_0455 IMG_6315 DSC_0433 IMG_3068 DSC_0487 DSC_0529
DSC_0513 DSC_0452 DSC_0541 DSC_0483 IMG_0516 IMG_3030 DSC_0510 IMG_6348 IMG_4685
IMG_6352 DSC_0395 DSC_0484 13731947_1060149550689715_2950536427892218900_o
DSC_0440 IMG_20230718_083740134 DSC_0437 IMG_6186 IMG_6322   (all /albums/optimized/*.webp)
```

Some of the English captions that need translating: "Tour boat cruising beneath the sheer limestone walls of the canyon.", "Local fisherman casting a net into the turquoise waters of the Koman Lake.", "Traditional stone 'Kulla' house perched precariously on the steep mountain slopes.", "Experienced boat captain navigating the Shala River with focus and care.", "Group break at a traditional guesthouse shaded by grapevines.", and 22 more. The full list is in the audit output.

**Fix**
- Add the 27 missing entries to `ALTS_SQ` in natural Albanian. Match the style of the existing 25: "Liqeni i Komanit", "Lumi i Shalës", "kulla", "bujtinë".
- Keep proper nouns as they are: Komani/Koman, Shala, Kulla.
- Optional hardening: make the fallback a dev-time warning, so a new photo without a translation shows up during the build.

**Acceptance criteria**
- `/sq/galeria/` has zero `english-text-on-sq-page` / `identical-to-en-page` findings for `<p>` and `<img alt>`.
- An Albanian speaker (Mario or Sam's reviewer) signs off on the 27 new strings.

---

## Fix 3 (MED): Privacy and terms body text in English on sq pages

**Pages and files**
- `/sq/politika-e-privatise/`: `src/pages/sq/politika-e-privatise.astro` (72 lines). The title, description, and "last updated" text are already translated via `t(locale, 'Legal.*')`. The headings and paragraphs are hard-coded English, for example "2. How We Use Your Data", "4. Your Rights (GDPR)", "We collect personal information that you provide to us directly…", "We use essential cookies… (like Google Analytics)…", "We implement industry-standard security measures…", "As a user, you have the right to access, correct, or delete…", "If you have any questions about our Privacy Policy…".
- `/sq/termat-dhe-kushtet/`: `src/pages/sq/termat-dhe-kushtet.astro` (72 lines). It has 6 sections in English: booking confirmation ("By booking a tour with Komani Lake Tours (Mario Molla)…"), payment ("cash payments (Euro or Albanian LEK)…"), cancellation ("free of charge up to 48 hours…"), safety ("Komani Lake and the Shala River are alpine environments…"), liability ("fully insured vessels…"), and "6. Governing Law".

**Fix**
- Translate every `<h2>` and `<p>` into Albanian, in place in the two sq `.astro` files. You can also move them into `Legal.*` keys in both json files and render them from there, which keeps en and sq in step.
- Legal text needs care: keep "48 orë", "Republika e Shqipërisë", the GDPR reference, and the "Euro ose Lek" meaning exact.
- Flag for review: legal wording should be checked by a native speaker or the business owner before going live.

**Acceptance criteria**
- Both pages have zero English `<h2>`/`<p>` findings.
- The meaning matches the EN pages one-to-one, with the same section count and numbering.

---

## Fix 4 (MED): Footer social aria-labels in English on every sq page

**Evidence.** `[@aria-label<a>] Follow us on Facebook` and `Follow us on Instagram` appear on all 16 sq pages, which is 32 findings.

**File.** `src/components/layout/footer.tsx:51` (Instagram) and `:60` (Facebook), both hard-coded. The footer already uses `t(...)` (see `t('rights')` at line 111).

**Fix.** Add `Footer.followInstagram` and `Footer.followFacebook` keys (or whatever the footer namespace is called) to both json files and use `aria-label={t('followInstagram')}`.
- Suggested sq: "Na ndiqni në Instagram" / "Na ndiqni në Facebook". These are common and natural, but still confirm them.

**Acceptance criteria.** No English aria-labels on sq pages, and EN unchanged.

---

## Fix 5 (MED): Helicopter inclusion "Aerial tour of Riviera & Alps" in English on sq

**Evidence.** `[span] Aerial tour of Riviera & Alps` on `/sq/` and `/sq/turne/`, in both finding types.

**Root cause.** `src/components/sections/tour-grid.tsx:273` renders `helicopter.inclusions.slice(0, 3)` straight from the English `TOURS` data in `src/lib/tours.ts:145`. It doesn't use the translated `td(...)` (`useTranslations('ToursData')`, line 89). The Albanian already exists in `sq.json` → `ToursData.helicopter-tour.inclusions[1]` = "Tur ajror i Rivierës & Alpeve".
- Only the 2nd item is flagged, because "Tirana Heliport departure" and "Komani Lake flyover" passed language detection by luck. All three are English on sq.

**Fix.** Read the inclusions from `td.raw('helicopter-tour.inclusions')` (or the project's equivalent) when the locale is `sq`. Check the other tour cards and related-tour cards for the same raw-`TOURS` pattern (title, duration, summary).

**Acceptance criteria.** On `/sq/` and `/sq/turne/`, the helicopter card shows "Nisja nga Heliporti i Tiranës", "Tur ajror i Rivierës & Alpeve", "Fluturim mbi Liqenin e Komanit".

---

## Fix 6 (LOW): Form inputs without accessible labels (14)

| Page | Inputs |
|---|---|
| `/en/book/`, `/sq/rezervo/` | name, email, phone, plus 1 unnamed input (likely the Radix Select hidden input or the date trigger) |
| `/en/contact/`, `/sq/kontakt/` | name, email, message (textarea) |

**Root cause**
- Contact: `src/components/pages/contact-page.tsx:98, 102, 107` use plain `<label>` with no `htmlFor`, and the `<Input>`/`<Textarea>` have no `id`.
- Booking: `src/components/booking/booking-form.tsx` uses shadcn `FormLabel` (line 694). The `<Input>` sits inside an icon wrapper `div` (lines 698–748), so `FormControl` probably doesn't pass its `id` / `aria-describedby` to the actual input.

**Fix**
- Contact: add `id` plus `htmlFor` pairs, or wrap each input in its label.
- Booking: make sure `<FormControl>` wraps the `<Input>` directly (put the icon in a sibling absolutely-positioned element), or add `aria-label={t('fullName')}` and so on.
- For the unnamed input, add an `aria-label` or `aria-hidden` / `tabIndex=-1` if it's a hidden mirror input.
- Also: `booking-form.tsx:412` has a hard-coded English `placeholder="Select a tour"`, which shows on `/sq/rezervo/`. Translate it.

**Acceptance criteria.** The audit shows 0 `form-input-no-label`. Screen-reader names match the visible labels in each locale. Forms still submit (test against a staging target only; don't submit real bookings).

---

## Fix 7 (LOW): `/sq/vjeshte-dimer/` meta description is 172 characters

**Key.** `sq.json` → `AutumnWinterPage.metaDescription`. Current text (172 chars):

> Ngadalësoni ritmin dhe jetoni si vendasit. Udhëtime me varkë, ecje, peshkim tradicional, raki shtëpie dhe qëndrim në bujtinë gjatë vjeshtës dhe dimrit në Liqenin e Komanit.

**Fix.** Trim it to 160 characters or fewer and keep the meaning. Suggestion (144 chars, needs review):

> Jetoni si vendasit në Liqenin e Komanit këtë vjeshtë e dimër: udhëtime me varkë, ecje, peshkim tradicional, raki shtëpie dhe qëndrim në bujtinë.

**Acceptance criteria.** Length ≤ 160, and the audit shows 0 `seo-description-long`.

---

## Out of scope (known, intentionally not changed)

- `/conservation` and `/sq/konservimi/` console warnings "No available adapters" and "Unrecognized feature: 'web-share'". These come from a third-party embed.
- `preload ... boat-featured-mid/small.webp ... not used` warnings. This is perf tuning on the speed-optimized branch and should be handled separately.
- `[head] Self-hosted Fonts - eliminates 3rd party connection`. This is an HTML comment, not visible text. It produces 16 false-positive findings. It's optional to remove, and the audit could also be taught to skip comments.

## Expected audit after all fixes

- HIGH: 0
- MED: 16 (only the font-comment false positives remain), or 0 if the comment is removed
- LOW: about 11–13 out-of-scope console warnings only

## Verification plan

1. Gate for every commit: `npm ci && npm run build` with no new warnings.
2. Run `npm run preview` (or serve `dist/`), then run `python3 komanlake_i18n_audit.py http://127.0.0.1:4321 <repo> after-local --shots`. Compare against `before-local.txt`.
3. For 1b, re-run the booking-page check with the browser clock at least 1 day after the build date.
4. Push the work branch. Cloudflare builds a preview URL. Run the audit against the preview URL.
5. Native-speaker review of every new Albanian string: 27 gallery captions, privacy and terms text, footer labels, the meta description, the calendar labels, and the "Select a tour" placeholder.
6. Merge to `speed-optimized` only after Sam approves.
