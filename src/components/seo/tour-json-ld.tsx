import type { Tour } from "@/lib/tours";

interface TourJsonLdProps {
    tour: Tour;
    url: string;
}

function isNumericPrice(price: string): boolean {
    return price !== "Call" && price !== "Contact" && !Number.isNaN(Number(price));
}

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
        // Re-add aggregateRating only with a verifiable public source (e.g. Google/TripAdvisor).
        // Previous values (4.9 / 127) had no citable origin and were removed.
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
            answer: "All boat tours depart daily from Shkoder at 7:00 AM. The boat journey begins at 9:00 AM from Koman terminal."
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
            answer: "Our main season runs from March to November. Winter tours are available on request but depend on weather conditions. See https://www.komanlake.com/en/autumn-winter/ for seasonal experiences."
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

// Business review aggregate removed — no verifiable public source for invented reviews
// (e.g. 'Sarah Jenkins', 'Marco Rossi') or aggregateRating 4.9/127.
// Re-add only when backed by a real Google/TripAdvisor (or similar) listing.
export function ReviewJsonLd() {
    return null;
}
