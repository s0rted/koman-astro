// Recurring seasonal EARLY-BIRD discount: configuration + pure logic.
//
// This file is imported by client components AND executed directly by Node
// (scripts/test-promo.mts) via TypeScript type stripping. It must therefore
// stay self-contained: NO imports, no enums, no namespaces, no parameter
// properties, no path aliases.
//
// Booking window recurs yearly: Oct 1 of year Y through the last day of
// February of Y+1, inclusive ("to": "02-28" means end of February, so Feb 29
// counts in leap years). "Today" is the calendar date in Europe/Tirane.
// Travel window is the season FOLLOWING the booking window: May 1 - Oct 31 of
// seasonYear, where seasonYear is the year the current booking window ends
// (booking Oct-Dec 2026 or Jan-Feb 2027 -> season 2027).

export const EARLY_BIRD = {
    enabled: true,
    percent: 15,
    timeZone: "Europe/Tirane",
    bookingWindow: { from: "10-01", to: "02-28" },
    travelWindow: { from: "05-01", to: "10-31" },
} as const;

export interface EarlyBirdPromo {
    bookingOpen: boolean;
    applies: boolean;
    percent: number;
    bookByDay: number;
    bookByMonth: number;
    bookByYear: number;
    seasonYear: number;
}

export interface EarlyBirdPricing {
    regular: number;
    discount: number;
    final: number;
}

/** Calendar date parts of `now` in the promo time zone (Europe/Tirane). */
function tiraneDateParts(now: Date): { y: number; m: number; d: number } {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: EARLY_BIRD.timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(now);
    const pick = (type: string): number => {
        const part = parts.find((p) => p.type === type);
        return Number(part ? part.value : 0);
    };
    return { y: pick("year"), m: pick("month"), d: pick("day") };
}

/** 28, or 29 in leap years ("to": "02-28" is treated as end of February). */
function daysInFebruary(year: number): number {
    // Day 0 of March is the last day of February.
    return new Date(year, 2, 0).getDate();
}

function monthDay(m: number, d: number): number {
    return m * 100 + d;
}

function inWindow(m: number, d: number, fromM: number, fromD: number, toM: number, toD: number): boolean {
    const md = monthDay(m, d);
    return md >= monthDay(fromM, fromD) && md <= monthDay(toM, toD);
}

/**
 * Evaluate the early-bird promo for `now` (booking side, Tirane calendar
 * date) and an optional trip date (calendar date; the form stores dates as
 * local midnight, so its local getFullYear/getMonth/getDate are used).
 */
export function getPromo(now: Date, tripDate?: Date | null): EarlyBirdPromo {
    const { y, m, d } = tiraneDateParts(now);

    // Booking window: Oct 1 through the last day of February, inclusive,
    // recurs every year (Oct-Dec of year Y, Jan-Feb of year Y+1).
    let bookingOpen = false;
    if (EARLY_BIRD.enabled) {
        if (m >= 10) {
            bookingOpen = monthDay(m, d) >= monthDay(10, 1);
        } else if (m <= 2) {
            bookingOpen = monthDay(m, d) <= monthDay(2, daysInFebruary(y));
        }
        // March-September: closed.
    }

    // Season year = the year in which the current booking window ends
    // (Jan-Feb -> this year; Mar-Dec -> next year). When the booking window
    // is closed this refers to the NEXT window, consistently.
    const seasonYear = m <= 2 ? y : y + 1;

    let applies = false;
    if (bookingOpen && tripDate) {
        const tripY = tripDate.getFullYear();
        const tripM = tripDate.getMonth() + 1;
        const tripD = tripDate.getDate();
        applies =
            tripY === seasonYear &&
            inWindow(tripM, tripD, 5, 1, 10, 31);
    }

    return {
        bookingOpen,
        applies,
        percent: EARLY_BIRD.percent,
        bookByDay: daysInFebruary(seasonYear),
        bookByMonth: 2,
        bookByYear: seasonYear,
        seasonYear,
    };
}

/** Whole-euro discount when the promo applies; final = regular - discount. */
export function applyEarlyBird(regularTotal: number, promo: EarlyBirdPromo): EarlyBirdPricing {
    const discount = promo.applies ? Math.round((regularTotal * promo.percent) / 100) : 0;
    return { regular: regularTotal, discount, final: regularTotal - discount };
}
