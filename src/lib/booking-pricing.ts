// Generic booking pricing: line items + per-line early-bird discount.
//
// Self-contained (NO imports): executed by Node TypeScript type stripping in
// scripts/test-promo.mts, so no enums / namespaces / parameter properties /
// type aliases beyond interfaces. No add-on is enumerated by name in the
// pricing logic — everything is driven by the BOOKING_ADDONS table, so a new
// add-on only needs a new entry (and a boolean form field).

export const CHILD_SENIOR_RATE = 0.8;
export const KAYAK_ADDON_PRICE = 20;
export const KAYAK_ADDON_TOURS = ["boat-tour", "custom-tour", "local-experience"] as const;

export interface AddonDef {
    id: string;
    /** Boolean form field name, e.g. "addTransfer". */
    field: string;
    /** Booking.* i18n key for the display label. */
    labelKey: string;
    /** Booking.* i18n key for the description line. */
    descKey: string;
    pricePerPerson: number;
    /** Tour slugs the add-on is offered on; undefined = all tours. */
    appliesTo?: readonly string[];
    /** Tour slugs where it is included free (not priced, not toggleable). */
    includedIn?: readonly string[];
    /** true = children/seniors pay CHILD_SENIOR_RATE of it (extra day). */
    scalesWithGuestRate?: boolean;
    /** English label for the owner message. */
    summaryLabel: string;
}

/** Display order: extraDay, transfer, kayak, ferry. */
export const BOOKING_ADDONS: readonly AddonDef[] = [
    {
        id: "extraDay",
        field: "addExtraDay",
        labelKey: "addExtraDay",
        descKey: "addExtraDayDesc",
        pricePerPerson: 30,
        appliesTo: ["local-experience"],
        scalesWithGuestRate: true,
        summaryLabel: "Extra Day",
    },
    {
        id: "transfer",
        field: "addTransfer",
        labelKey: "transfer",
        descKey: "transferDesc",
        pricePerPerson: 30,
        includedIn: ["boat-tour", "local-experience"],
        summaryLabel: "Transfer",
    },
    {
        id: "kayak",
        field: "addKayak",
        labelKey: "kayak",
        descKey: "kayakDesc",
        pricePerPerson: KAYAK_ADDON_PRICE,
        appliesTo: KAYAK_ADDON_TOURS,
        summaryLabel: "Kayak Rental",
    },
    {
        id: "ferry",
        field: "addFerry",
        labelKey: "ferry",
        descKey: "ferryDesc",
        pricePerPerson: 10,
        summaryLabel: "Ferry Ticket",
    },
];

/** Generic replacement for the "Call"/"Contact" check: any numeric price > 0. */
export function hasFixedPrice(price: unknown): boolean {
    if (typeof price === "number") return Number.isFinite(price) && price > 0;
    if (typeof price === "string") {
        const n = Number(price);
        return price.trim() !== "" && Number.isFinite(n) && n > 0;
    }
    return false;
}

export function isAddonAvailable(addon: AddonDef, tourSlug: string): boolean {
    return !addon.appliesTo || addon.appliesTo.includes(tourSlug);
}

export function isAddonIncluded(addon: AddonDef, tourSlug: string): boolean {
    return !!addon.includedIn && addon.includedIn.includes(tourSlug);
}

export interface LineItem {
    id: string;
    kind: "tour" | "addon";
    labelKey: string;
    summaryLabel: string;
    regular: number;
}

export interface BuildLineItemsInput {
    tourSlug: string;
    tourPrice: unknown;
    adults: number;
    children: number;
    seniors: number;
    /** Form values by boolean field name, e.g. { addKayak: true }. */
    selected: Record<string, boolean | undefined>;
    /** Defaults to BOOKING_ADDONS; injectable for tests. */
    addons?: readonly AddonDef[];
}

/**
 * One line per priced item: the tour base plus every selected, available,
 * not-included add-on. Returns [] for "Call"/"Contact" tours (no fixed price).
 */
export function buildLineItems(input: BuildLineItemsInput): LineItem[] {
    if (!hasFixedPrice(input.tourPrice)) return [];
    const base = Number(input.tourPrice);
    const adults = input.adults || 0;
    const children = input.children || 0;
    const seniors = input.seniors || 0;
    const discountedGuests = children + seniors;

    const lines: LineItem[] = [
        {
            id: "tour",
            kind: "tour",
            labelKey: input.tourSlug,
            summaryLabel: input.tourSlug,
            regular: adults * base + discountedGuests * base * CHILD_SENIOR_RATE,
        },
    ];

    const addons = input.addons ?? BOOKING_ADDONS;
    for (const addon of addons) {
        if (!input.selected[addon.field]) continue;
        if (!isAddonAvailable(addon, input.tourSlug)) continue;
        if (isAddonIncluded(addon, input.tourSlug)) continue;
        const payingGuests = addon.scalesWithGuestRate
            ? adults + discountedGuests * CHILD_SENIOR_RATE
            : adults + discountedGuests;
        lines.push({
            id: addon.id,
            kind: "addon",
            labelKey: addon.labelKey,
            summaryLabel: addon.summaryLabel,
            regular: addon.pricePerPerson * payingGuests,
        });
    }
    return lines;
}

export interface PricedLine extends LineItem {
    discount: number;
    final: number;
}

export interface PromoRate {
    applies: boolean;
    percent: number;
}

export interface PricedBooking {
    lines: PricedLine[];
    regular: number;
    discount: number;
    final: number;
}

/**
 * Whole-euro discount PER LINE, so the displayed rounded regular minus the
 * displayed rounded discount equals the displayed rounded final on every row.
 */
export function priceBooking(lines: LineItem[], promo: PromoRate | null): PricedBooking {
    const priced: PricedLine[] = lines.map((line) => {
        const discount =
            promo && promo.applies ? Math.round((line.regular * promo.percent) / 100) : 0;
        return { ...line, discount, final: line.regular - discount };
    });
    const regular = priced.reduce((sum, line) => sum + line.regular, 0);
    const discount = priced.reduce((sum, line) => sum + line.discount, 0);
    return { lines: priced, regular, discount, final: regular - discount };
}
