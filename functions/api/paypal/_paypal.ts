// Shared helpers for the PayPal Pages Functions.
// Files starting with "_" are not routed by Cloudflare Pages.
import { TOURS } from "../../../src/lib/tours";
import { computeTotal, toAmountString, type PriceInput } from "../../../src/lib/pricing";

export interface Env {
    PAYPAL_CLIENT_ID?: string;
    PAYPAL_CLIENT_SECRET?: string;
    PAYPAL_ENV?: string; // "sandbox" | "live"
}

export const CURRENCY = "EUR";

export class PayPalNotConfigured extends Error {}

export function paypalBase(env: Env): string {
    const mode = (env.PAYPAL_ENV || "").trim().toLowerCase();
    if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) throw new PayPalNotConfigured("missing credentials");
    if (mode === "live") return "https://api-m.paypal.com";
    if (mode === "sandbox") return "https://api-m.sandbox.paypal.com";
    throw new PayPalNotConfigured("PAYPAL_ENV must be 'sandbox' or 'live'");
}

export async function getAccessToken(env: Env): Promise<{ base: string; token: string }> {
    const base = paypalBase(env);
    const res = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: "Basic " + btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });
    if (!res.ok) {
        console.error("PayPal OAuth failed", res.status, await res.text().catch(() => ""));
        throw new Error("paypal_auth_failed");
    }
    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) throw new Error("paypal_auth_failed");
    return { base, token: data.access_token };
}

export function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
}

/** Rejects cross-site POSTs (browsers always send Origin on POST fetches). */
export function sameOrigin(request: Request): boolean {
    const origin = request.headers.get("Origin");
    return !origin || origin === new URL(request.url).origin;
}

export interface BookingParams extends PriceInput {
    date: string; // yyyy-MM-dd
}

const MAX_GUESTS = 50;

function int(v: unknown, min: number): number | null {
    const n = typeof v === "string" ? Number(v) : v;
    if (typeof n !== "number" || !Number.isInteger(n) || n < min || n > MAX_GUESTS) return null;
    return n;
}

/** Validates untrusted booking fields. Returns null if invalid. */
export function parseBooking(raw: Record<string, unknown>): BookingParams | null {
    const tour = typeof raw.tour === "string" ? raw.tour : "";
    if (!TOURS.some((t) => t.slug === tour)) return null;
    const date = typeof raw.date === "string" ? raw.date : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const adults = int(raw.adults, 1);
    const children = int(raw.children ?? 0, 0);
    const seniors = int(raw.seniors ?? 0, 0);
    if (adults === null || children === null || seniors === null) return null;
    if (adults + children + seniors > MAX_GUESTS) return null;
    return {
        tour,
        date,
        adults,
        children,
        seniors,
        addTransfer: raw.addTransfer === true,
        addKayak: raw.addKayak === true,
        addFerry: raw.addFerry === true,
        addExtraDay: raw.addExtraDay === true,
    };
}

/** Compact, PayPal custom_id-safe encoding (max 127 chars) of the priced fields. */
export function encodeBooking(b: BookingParams): string {
    const flags = [b.addTransfer, b.addKayak, b.addFerry, b.addExtraDay].map((f) => (f ? "1" : "0")).join("");
    return ["v1", b.tour, b.date, b.adults, b.children, b.seniors, flags].join("|");
}

export function decodeBooking(s: string | undefined): BookingParams | null {
    if (!s) return null;
    const [v, tour, date, a, c, sn, flags] = s.split("|");
    if (v !== "v1" || !flags || flags.length !== 4) return null;
    return parseBooking({
        tour,
        date,
        adults: Number(a),
        children: Number(c),
        seniors: Number(sn),
        addTransfer: flags[0] === "1",
        addKayak: flags[1] === "1",
        addFerry: flags[2] === "1",
        addExtraDay: flags[3] === "1",
    });
}

/** Server-trusted amount for a booking, or null when it cannot be paid online. */
export function expectedAmount(b: BookingParams): string | null {
    const total = computeTotal(b);
    if (total === null || !(total > 0)) return null;
    return toAmountString(total);
}

export function tourTitle(slug: string): string {
    return TOURS.find((t) => t.slug === slug)?.title || slug;
}
