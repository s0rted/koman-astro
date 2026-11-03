// Tests for the recurring early-bird promo logic (src/config/promo.ts).
// Run directly with Node (TS type stripping): node scripts/test-promo.mts
import assert from "node:assert/strict";
import { getPromo, applyEarlyBird } from "../src/config/promo.ts";

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

console.log(`\n${count - failures}/${count} passed`);
if (failures > 0) {
    process.exit(1);
}
