// POST /api/paypal/capture-order  { orderId }
// Captures an approved order and verifies it before the site may claim "paid".
import {
    CURRENCY, PayPalNotConfigured, decodeBooking, expectedAmount, getAccessToken,
    json, sameOrigin, type Env,
} from "./_paypal";

interface Capture {
    id: string;
    status: string;
    amount?: { currency_code: string; value: string };
}
interface Order {
    id: string;
    status: string;
    purchase_units?: {
        custom_id?: string;
        amount?: { currency_code: string; value: string };
        payments?: { captures?: Capture[] };
    }[];
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);

    let orderId = "";
    try {
        const body = (await request.json()) as { orderId?: unknown };
        orderId = typeof body.orderId === "string" ? body.orderId : "";
    } catch {
        /* fallthrough */
    }
    if (!/^[A-Z0-9]{8,32}$/.test(orderId)) return json({ verified: false, error: "invalid_order" }, 400);

    let auth;
    try {
        auth = await getAccessToken(env);
    } catch (err) {
        if (err instanceof PayPalNotConfigured) return json({ verified: false, error: "payments_not_configured" }, 503);
        return json({ verified: false, error: "paypal_unavailable" }, 502);
    }
    const headers = {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
    };

    // Capture (idempotent via PayPal-Request-Id so refreshes don't double-charge).
    let res = await fetch(`${auth.base}/v2/checkout/orders/${orderId}/capture`, {
        method: "POST",
        headers: { ...headers, "PayPal-Request-Id": `capture-${orderId}` },
    });
    let order = (await res.json().catch(() => null)) as (Order & { details?: { issue?: string }[] }) | null;

    if (!res.ok) {
        const issue = order?.details?.[0]?.issue;
        if (issue === "ORDER_ALREADY_CAPTURED") {
            res = await fetch(`${auth.base}/v2/checkout/orders/${orderId}`, { headers });
            order = (await res.json().catch(() => null)) as Order | null;
            if (!res.ok) return json({ verified: false, error: "paypal_lookup_failed" }, 502);
        } else {
            console.error("PayPal capture failed", res.status, JSON.stringify(order));
            const declined = issue === "INSTRUMENT_DECLINED" || issue === "PAYER_ACTION_REQUIRED";
            return json({ verified: false, error: declined ? "payment_declined" : "capture_failed", issue }, 402);
        }
    }

    const unit = order?.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    const booking = decodeBooking(unit?.custom_id);
    const expected = booking ? expectedAmount(booking) : null;

    const checks = {
        orderCompleted: order?.status === "COMPLETED",
        captureCompleted: capture?.status === "COMPLETED",
        currency: capture?.amount?.currency_code === CURRENCY,
        amount: !!expected && capture?.amount?.value === expected,
    };
    const verified = Object.values(checks).every(Boolean);

    if (!verified) {
        console.error("PayPal verification failed", orderId, JSON.stringify({ checks, status: order?.status, capture }));
        // PENDING captures (e.g. eCheck / review) are real but not yet settled: don't claim paid.
        return json({
            verified: false,
            error: capture?.status === "PENDING" ? "payment_pending" : "verification_failed",
            orderId,
            captureId: capture?.id,
        }, 409);
    }

    return json({
        verified: true,
        orderId,
        captureId: capture!.id,
        amount: capture!.amount!.value,
        currency: CURRENCY,
        booking,
    });
};
