// Tests for the recurring early-bird promo logic (src/config/promo.ts) and
// the generic booking pricing pipeline (src/lib/booking-pricing.ts).
// Run directly with Node (TS type stripping): node scripts/test-promo.mts
import assert from "node:assert/strict";
import { getPromo, applyEarlyBird } from "../src/config/promo.ts";
import {
    buildLineItems,
    priceBooking,
    hasFixedPrice,
    BOOKING_ADDONS,
    type AddonDef,
} from "../src/lib/booking-pricing.ts";

// Build a Date from Tirane calendar date/time, independent of the machine's
// local time zone: pass UTC ms offset for Europe/Tirane (+1, +2 DST).
function tz(hours: number, minutes = 0): number {
    return hours * 3600000 + minutes * 60000;
}
// Tirane offset on the dates below: CEST (+2) until late Oct, CET (+1) after.
function mkDate(y: number, m: number, d: number, utcOffsetHours: number): Date {
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - tz(utcOffsetHours));
}

let failures = 0;
let count = 0;

function check(name: string, fn: () => void): void {
    count++;
    try {
        fn();
        console.log(`PASS ${name}`);
    } catch (err) {
        failures++;
        console.log(`FAIL ${name}: ${err instanceof Error ? err.message : String(err)}`);
    }
}

// --- Booking window edges (Tirane calendar dates) ---
// Sep 30, 2026 is CEST (+2): closed.
check("2026-09-30 closed", () => {
    const p = getPromo(mkDate(2026, 9, 30, 2));
    assert.equal(p.bookingOpen, false);
    assert.equal(p.applies, false);
});
// Oct 1, 2026 is CEST (+2): open, season 2027, book by Feb 28, 2027.
check("2026-10-01 open", () => {
    const p = getPromo(mkDate(2026, 10, 1, 2));
    assert.equal(p.bookingOpen, true);
    assert.equal(p.bookByDay, 28);
    assert.equal(p.bookByMonth, 2);
    assert.equal(p.bookByYear, 2027);
    assert.equal(p.seasonYear, 2027);
});
// Feb 28, 2027 is CET (+1): open.
check("2027-02-28 open", () => {
    const p = getPromo(mkDate(2027, 2, 28, 1));
    assert.equal(p.bookingOpen, true);
});
// Mar 1, 2027 is CET (+1): closed.
check("2027-03-01 closed", () => {
    const p = getPromo(mkDate(2027, 3, 1, 1));
    assert.equal(p.bookingOpen, false);
});
// Leap year: Feb 29, 2028 is CET (+1): open ("to 02-28" == end of February).
check("2028-02-29 open (leap)", () => {
    const p = getPromo(mkDate(2028, 2, 29, 1));
    assert.equal(p.bookingOpen, true);
    assert.equal(p.bookByDay, 29);
});
// Mar 1, 2028: closed.
check("2028-03-01 closed", () => {
    const p = getPromo(mkDate(2028, 3, 1, 1));
    assert.equal(p.bookingOpen, false);
});

// --- Time-zone edges ---
// 2026-09-30T22:30:00Z is Oct 1, 2026 00:30 in Tirane: open.
check("2026-09-30T22:30Z == Oct 1 00:30 Tirane: open", () => {
    const p = getPromo(new Date("2026-09-30T22:30:00Z"));
    assert.equal(p.bookingOpen, true);
});
// 2027-02-28T23:30:00Z is Mar 1, 2027 00:30 in Tirane: closed.
check("2027-02-28T23:30Z == Mar 1 00:30 Tirane: closed", () => {
    const p = getPromo(new Date("2027-02-28T23:30:00Z"));
    assert.equal(p.bookingOpen, false);
});

// --- Travel window (now = 2026-11-03, season 2027) ---
const now = mkDate(2026, 11, 3, 1);
function mkTrip(y: number, m: number, d: number): Date {
    // Local-midnight trip date, built the same way the form stores dates
    // (local getters must report the given calendar day on any machine).
    return new Date(y, m - 1, d);
}
check("trip 2027-04-30: no discount", () => {
    assert.equal(getPromo(now, mkTrip(2027, 4, 30)).applies, false);
});
check("trip 2027-05-01: discount", () => {
    assert.equal(getPromo(now, mkTrip(2027, 5, 1)).applies, true);
});
check("trip 2027-10-31: discount", () => {
    assert.equal(getPromo(now, mkTrip(2027, 10, 31)).applies, true);
});
check("trip 2027-11-01: no discount", () => {
    assert.equal(getPromo(now, mkTrip(2027, 11, 1)).applies, false);
});
check("trip outside season year (2026-07-15): no discount", () => {
    assert.equal(getPromo(now, mkTrip(2026, 7, 15)).applies, false);
});
check("no trip date: applies false", () => {
    assert.equal(getPromo(now, null).applies, false);
});

// --- applyEarlyBird ---
const openPromo = getPromo(now, mkTrip(2027, 7, 15));
check("open promo has applies=true", () => {
    assert.equal(openPromo.applies, true);
});
check("applyEarlyBird(100) -> 15 / 85", () => {
    const r = applyEarlyBird(100, openPromo);
    assert.equal(r.regular, 100);
    assert.equal(r.discount, 15);
    assert.equal(r.final, 85);
});
check("applyEarlyBird(130) -> 20 / 110 (rounded)", () => {
    const r = applyEarlyBird(130, openPromo);
    assert.equal(r.discount, 20);
    assert.equal(r.final, 110);
});
check("applyEarlyBird with closed promo -> no discount", () => {
    const closed = getPromo(mkDate(2026, 9, 30, 2));
    const r = applyEarlyBird(100, closed);
    assert.equal(r.discount, 0);
    assert.equal(r.final, 100);
});

// --- Generic per-line pricing (src/lib/booking-pricing.ts) ---
// now = 2026-11-03 (booking window open), trip 2027-07-15 (season 2027).
const openRate = { applies: openPromo.applies, percent: openPromo.percent };
const closedRate = { applies: false, percent: 0 };

// Boat tour (€54), 2 adults + 1 child, kayak + ferry selected.
check("boat-tour 2A+1C kayak+ferry: per-line discount, totals sum", () => {
    const lines = buildLineItems({
        tourSlug: "boat-tour",
        tourPrice: "54",
        adults: 2,
        children: 1,
        seniors: 0,
        selected: { addKayak: true, addFerry: true },
    });
    // tour: 2*54 + 1*54*0.7 = 145.8; kayak+ferry: flat per person, 3 guests.
    assert.equal(lines.length, 3);
    assert.equal(lines[0].regular, 145.8);
    assert.equal(lines[1].regular, 60);
    assert.equal(lines[2].regular, 30);
    const p = priceBooking(lines, openRate);
    assert.deepEqual(
        p.lines.map(l => l.discount),
        p.lines.map(l => Math.round((l.regular * 15) / 100)),
    );
    assert.equal(p.discount, p.lines.reduce((s, l) => s + l.discount, 0));
    assert.equal(p.final, p.regular - p.discount);
    // Displayed rounded regular minus discount equals displayed rounded final.
    for (const line of p.lines) {
        assert.equal(Math.round(line.regular) - line.discount, Math.round(line.final));
    }
});

// Local experience (€100), extra day + kayak + transfer: transfer is
// included on local-experience, so it must NOT appear as a line.
check("local-experience extraDay+kayak+transfer: transfer omitted, others discounted", () => {
    const lines = buildLineItems({
        tourSlug: "local-experience",
        tourPrice: "100",
        adults: 2,
        children: 0,
        seniors: 0,
        selected: { addTransfer: true, addKayak: true, addExtraDay: true },
    });
    assert.equal(lines.length, 3);
    assert.ok(!lines.some(l => l.id === "transfer" || l.summaryLabel === "Transfer"));
    const p = priceBooking(lines, openRate);
    // tour 200, extra day scales with guest rate (2 adults -> 60), kayak 40.
    assert.equal(p.regular, 300);
    assert.equal(p.discount, 45);
    assert.equal(p.final, 255);
    assert.ok(p.lines.every(l => l.discount > 0));
});

// A fake FUTURE add-on injected through the addons param: priced and
// discounted generically, with no change to the pricing code.
check("injected fake add-on is priced and discounted generically", () => {
    const fake: AddonDef = {
        id: "fakeSnorkel",
        field: "addFakeSnorkel",
        labelKey: "fakeSnorkel",
        descKey: "fakeSnorkelDesc",
        pricePerPerson: 40,
        summaryLabel: "Snorkel Set",
    };
    const lines = buildLineItems({
        tourSlug: "shkoder-valbona",
        tourPrice: "30",
        adults: 2,
        children: 0,
        seniors: 0,
        selected: { addFakeSnorkel: true },
        addons: [...BOOKING_ADDONS, fake],
    });
    const snorkel = lines.find(l => l.id === "fakeSnorkel");
    assert.ok(snorkel, "fake add-on line missing");
    assert.equal(snorkel.regular, 80);
    const p = priceBooking(lines, openRate);
    const snorkelPriced = p.lines.find(l => l.id === "fakeSnorkel")!;
    assert.equal(snorkelPriced.discount, 12);
    assert.equal(snorkelPriced.final, 68);
});

// Same booking, non-qualifying trip date: no discount anywhere.
check("non-qualifying trip 2027-11-01: discount 0 on every line", () => {
    const closed = getPromo(now, mkTrip(2027, 11, 1));
    assert.equal(closed.applies, false);
    const lines = buildLineItems({
        tourSlug: "boat-tour",
        tourPrice: "54",
        adults: 2,
        children: 1,
        seniors: 0,
        selected: { addKayak: true, addFerry: true },
    });
    const p = priceBooking(lines, { applies: closed.applies, percent: closed.percent });
    assert.equal(p.discount, 0);
    assert.ok(p.lines.every(l => l.discount === 0 && l.final === l.regular));
    assert.equal(p.final, p.regular);
});

// hasFixedPrice: generic "Call"/"Contact" replacement.
check("hasFixedPrice truth table", () => {
    assert.equal(hasFixedPrice("Call"), false);
    assert.equal(hasFixedPrice("Contact"), false);
    assert.equal(hasFixedPrice(0), false);
    assert.equal(hasFixedPrice(""), false);
    assert.equal(hasFixedPrice("54"), true);
    assert.equal(hasFixedPrice(54), true);
});

// "Call" tours produce no line items at all.
check("buildLineItems with tourPrice 'Call' -> []", () => {
    assert.deepEqual(
        buildLineItems({
            tourSlug: "helicopter-tour",
            tourPrice: "Call",
            adults: 2,
            children: 0,
            seniors: 0,
            selected: { addFerry: true },
        }),
        [],
    );
    assert.deepEqual(
        buildLineItems({
            tourSlug: "custom-tour",
            tourPrice: "Contact",
            adults: 4,
            children: 0,
            seniors: 0,
            selected: { addKayak: true },
        }),
        [],
    );
});

console.log(`\n${count - failures}/${count} passed`);
if (failures > 0) {
    process.exit(1);
}
