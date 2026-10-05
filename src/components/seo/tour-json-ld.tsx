import type { Tour } from "@/lib/tours";

interface TourJsonLdProps {
    tour: Tour;
    url: string;
}

function isNumericPrice(price: string): boolean {
    return price !== "Call" && price !== "Contact" && !Number.isNaN(Number(price));
}

/**
 * Verified public ratings for "Komani Lake Ferry" (Google Business / Places):
 * - Google: 4.5/5 from 359 reviews (exa.ai Places snapshot for SH25 4013, Koman;
 *   coords ~42.1088,19.8265). Cross-checked via aggregators citing the same listing
 *   (~360–361 reviews / 4.5). Maps search:
 *   https://www.google.com/maps/search/?api=1&query=Komani+Lake+Ferry+SH25+4013+Albania
 * TripAdvisor: no listing exactly titled "Komani Lake Ferry" found. Closest:
 * - "Komani Lake" attraction: 3.6/5 (155) —
 *   https://www.tripadvisor.com/Attraction_Review-g2284133-d8720833-Reviews-Komani_Lake-Koman_Shkoder_County.html
 * - "Alpin Ferry": 4.4/5 (20) —
 *   https://www.tripadvisor.com/Attraction_Review-g2284133-d8124567-Reviews-Alpin_Ferry-Koman_Shkoder_County.html
 * Prefer Google when scores differ; do not invent named Review objects.
 */
const KOMANI_LAKE_FERRY_AGGREGATE = {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "359",
    "bestRating": "5",
    "worstRating": "1",
} as const;

export function TourJsonLd({ tour, url }: TourJsonLdProps) {
    const tourProductSchema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": tour.title,
        "description": tour.description,
        "image": `https://www.komanlake.com${tour.banner}`,
        "brand": {
            "@type": "Brand",
            "name": "Komani Lake Tours"
        },
        "aggregateRating": { ...KOMANI_LAKE_FERRY_AGGREGATE },
    };

    if (isNumericPrice(tour.price)) {
        tourProductSchema.offers = {
            "@type": "Offer",
            "url": url,
            "priceCurrency": "EUR",
            "price": tour.price,
            "availability": "https://schema.org/InStock",
            "validFrom": "2026-03-01",
            "seller": {
                "@type": "TravelAgency",
                "name": "Komani Lake Tours",
                "url": "https://www.komanlake.com"
            }
        };
    }

    const tripSchema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        "name": tour.title,
        "description": tour.description,
        "touristType": ["Adventure tourists", "Nature lovers", "Photographers"],
        "itinerary": {
            "@type": "ItemList",
            "itemListElement": tour.itinerary.map((step, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": step.activity,
                "description": `${step.time}: ${step.activity}`
            }))
        },
        "provider": {
            "@type": "TravelAgency",
            "name": "Komani Lake Tours",
            "founder": {
                "@type": "Person",
                "name": "Mario Molla"
            }
        }
    };

    if (isNumericPrice(tour.price)) {
        tripSchema.offers = {
            "@type": "Offer",
            "price": tour.price,
            "priceCurrency": "EUR"
        };
    }

    const graphSchema = {
        "@context": "https://schema.org",
        "@graph": [tourProductSchema, tripSchema]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
        />
    );
}

// FAQ Schema for the homepage
export function FaqJsonLd() {
    const faqData = [
        {
            question: "What time do tours depart?",
            answer: "In summer, the €54 boat tours depart daily from Shkoder at 7:00 AM (boat from Koman terminal at 9:00 AM). This classic boat tour is summer season only; for autumn/winter see https://www.komanlake.com/en/autumn-winter/."
        },
        {
            question: "What is included in the boat tour price?",
            answer: "The €54 boat tour includes return transfers from Shkoder, traditional boat sailing, kayak access, and a local guide. Food and beverages are not included."
        },
        {
            question: "Is swimming possible at Komani Lake?",
            answer: "Yes! The Shala River (our main stop) has crystal-clear turquoise water perfect for swimming. We allow 1.5 hours of free time for swimming, kayaking, and exploring."
        },
        {
            question: "Do you operate in winter?",
            answer: "The €54 classic boat tour is summer season only and is not available in autumn/winter. Off-season we offer separate Autumn & Winter experiences on request (weather permitting). See https://www.komanlake.com/en/autumn-winter/."
        },
        {
            question: "How do I book a tour?",
            answer: "You can book directly through our website using the booking form, or contact us via WhatsApp for instant confirmation. No upfront payment is required."
        }
    ];

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
    );
}

/** Agency-level aggregateRating only — no invented Review authors. See sources above. */
export function ReviewJsonLd() {
    const reviewSchema = {
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        "name": "Komani Lake Tours",
        "url": "https://www.komanlake.com",
        "aggregateRating": { ...KOMANI_LAKE_FERRY_AGGREGATE },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
    );
}
