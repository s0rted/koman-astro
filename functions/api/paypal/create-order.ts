// POST /api/paypal/create-order
// Creates a PayPal Orders v2 order with the amount recomputed server-side.
import {
    CURRENCY, PayPalNotConfigured, encodeBooking, expectedAmount, getAccessToken,
    json, parseBooking, sameOrigin, tourTitle, type Env,
} from "./_paypal";

const BOOKING_PATHS: Record<string, string> = { en: "/en/book/", sq: "/sq/rezervo/" };

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);

    let raw: Record<string, unknown>;
    try {
        raw = (await request.json()) as Record<string, unknown>;
    } catch {
        return json({ error: "invalid_request" }, 400);
    }

    const booking = parseBooking(raw);
    if (!booking) return json({ error: "invalid_booking" }, 400);

    const amount = expectedAmount(booking);
    if (!amount) return json({ error: "not_payable_online" }, 400);

    const name = typeof raw.name === "string" ? raw.name.trim().slice(0, 60) : "";
    const locale = raw.locale === "sq" ? "sq" : "en";
    const origin = new URL(request.url).origin;
    const bookingPath = BOOKING_PATHS[locale];
    const guests = `${booking.adults}A/${booking.children}C/${booking.seniors}S`;
    const description = `${tourTitle(booking.tour)} ${booking.date} ${guests}${name ? ` - ${name}` : ""}`.slice(0, 127);

    let auth;
    try {
        auth = await getAccessToken(env);
    } catch (err) {
        if (err instanceof PayPalNotConfigured) return json({ error: "payments_not_configured" }, 503);
        return json({ error: "paypal_unavailable" }, 502);
    }

    const res = await fetch(`${auth.base}/v2/checkout/orders`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
        },
        body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
                {
                    reference_id: booking.tour,
                    custom_id: encodeBooking(booking),
                    description,
                    amount: { currency_code: CURRENCY, value: amount },
                },
            ],
            payment_source: {
                paypal: {
                    experience_context: {
                        brand_name: "Koman Lake",
                        shipping_preference: "NO_SHIPPING",
                        user_action: "PAY_NOW",
                        locale: locale === "sq" ? "en-AL" : "en-US",
                        return_url: `${origin}${bookingPath}?paypal=return&tour=${encodeURIComponent(booking.tour)}`,
                        cancel_url: `${origin}${bookingPath}?paypal=cancel&tour=${encodeURIComponent(booking.tour)}`,
                    },
                },
            },
        }),
    });

    const order = (await res.json().catch(() => null)) as
        | { id?: string; links?: { rel: string; href: string }[] }
        | null;
    if (!res.ok || !order?.id) {
        console.error("PayPal create order failed", res.status, JSON.stringify(order));
        return json({ error: "paypal_create_failed" }, 502);
    }

    const approveUrl = order.links?.find((l) => l.rel === "payer-action" || l.rel === "approve")?.href;
    if (!approveUrl) return json({ error: "paypal_create_failed" }, 502);

    return json({ id: order.id, approveUrl, amount, currency: CURRENCY });
};
