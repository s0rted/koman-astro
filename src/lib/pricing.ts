import { TOURS } from "./tours";

/**
 * Single source of truth for booking prices.
 * Used by the booking form (live total / floating bubble) AND by the
 * Cloudflare Pages Functions that create and verify PayPal orders, so the
 * amount charged is always recomputed server-side from these prices.
 */
export interface PriceInput {
    tour: string;
    adults: number;
    children?: number;
    seniors?: number;
    addTransfer?: boolean;
    addKayak?: boolean;
    addFerry?: boolean;
    addExtraDay?: boolean;
}

export const CHILD_SENIOR_DISCOUNT = 0.7;
export const TRANSFER_PER_GUEST = 30;
export const FERRY_PER_GUEST = 10;
export const EXTRA_DAY_SURCHARGE = 30;
export const TRANSFER_INCLUDED_TOURS = ["boat-tour", "local-experience"];

/** Returns null when the tour has no fixed price ("Call"/"Contact") or is unknown. */
export function computeTotal(input: PriceInput): number | null {
    const tour = TOURS.find((t) => t.slug === input.tour);
    if (!tour) return null;
    let basePrice = Number(tour.price);
    if (!Number.isFinite(basePrice)) return null;

    if (input.tour === "local-experience" && input.addExtraDay) {
        basePrice += EXTRA_DAY_SURCHARGE;
    }

    const adults = input.adults || 0;
    const children = input.children || 0;
    const seniors = input.seniors || 0;
    const totalGuests = adults + children + seniors;

    const adultCost = adults * basePrice;
    const childCost = children * (basePrice * CHILD_SENIOR_DISCOUNT);
    const seniorCost = seniors * (basePrice * CHILD_SENIOR_DISCOUNT);

    const transferIncluded = TRANSFER_INCLUDED_TOURS.includes(input.tour);
    const transferCost = input.addTransfer && !transferIncluded ? TRANSFER_PER_GUEST * totalGuests : 0;
    const ferryCost = input.addFerry ? FERRY_PER_GUEST * totalGuests : 0;
    const kayakAddonPrice = Number(TOURS.find((t) => t.slug === "kayak-rental")?.price) || 20;
    const kayakCost = input.addKayak ? kayakAddonPrice * totalGuests : 0;

    return adultCost + childCost + seniorCost + transferCost + ferryCost + kayakCost;
}

/** Amount string as sent to PayPal (EUR, 2 decimals). */
export function toAmountString(total: number): string {
    return (Math.round(total * 100) / 100).toFixed(2);
}
