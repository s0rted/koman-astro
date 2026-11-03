import { EUR_TO_LEK } from "./tours";

// Pinned to en-US so the grouping output is byte-identical in Node (build/SSR)
// and in the browser (hydration). sq-AL cannot be used here: its CLDR data
// differs between ICU builds (Node groups nothing, Chromium groups with ","),
// which is what caused React hydration error #418.
const groupedFormatter = new Intl.NumberFormat("en-US", {
    useGrouping: true,
    maximumFractionDigits: 0,
});

/**
 * Convert a EUR amount to Lek (at the fixed EUR_TO_LEK rate) and format it
 * deterministically: "5724" -> "5 724" (non-breaking space separator,
 * Albanian thousand-grouping convention). Safe on both "54" and 54 inputs.
 */
export function formatLek(eur: number | string): string {
    const numeric = Number(eur);
    if (!Number.isFinite(numeric)) return String(eur);
    return groupedFormatter
        .format(Math.round(numeric * EUR_TO_LEK))
        .replace(/,/g, "\u00A0");
}
