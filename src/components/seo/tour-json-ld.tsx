import type { Tour } from "@/lib/tours";

interface TourJsonLdProps {
    tour: Tour;
    url: string;
}

export function TourJsonLd({ tour, url }: TourJsonLdProps) {
    const tourProductSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": tour.title,
        "description": tour.description,
        "image": `https://koman-astro.pages.dev${tour.banner}`,
        "brand": {
            "@type": "Brand",
            "name": "Komani Lake Tours"
        },
        "offers": {
            "@type": "Offer",
            "url": url,
            "priceCurrency": "EUR",
            "price": tour.price,
            "availability": "https://schema.org/InStock",
            "validFrom": "2026-03-01",
            "seller": {
                "@type": "TravelAgency",
                "name": "Komani Lake Tours",
                "url": "https://koman-astro.pages.dev"
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "127",
            "bestRating": "5",
            "worstRating": "1"
        }
    };

    const tripSchema = {
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
        },
        "offers": {
            "@type": "Offer",
            "price": tour.price,
            "priceCurrency": "EUR"
        }
    };

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
            answer: "The €54 boat tour includes return transfers from Shkoder, traditional boat sailing, full lunch at a riverside village, kayak access, coffee & snacks, and a local guide."
        },
        {
            question: "Is swimming possible at Komani Lake?",
            answer: "Yes! The Shala River (our main stop) has crystal-clear turquoise water perfect for swimming. We allow 1.5 hours of free time for swimming, kayaking, and exploring."
        },
        {
            question: "Do you operate in winter?",
            answer: "Our main season runs from March to November. Winter tours are available on request but depend on weather conditions."
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

// Review aggregate schema
export function ReviewJsonLd() {
    const reviewSchema = {
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        "name": "Komani Lake Tours",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "127",
            "bestRating": "5",
            "worstRating": "1"
        },
        "review": [
            {
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": "Sarah Jenkins"
                },
                "datePublished": "2026-01-15",
                "reviewBody": "Absolutely magical! Mario and his team made this the highlight of our Albania trip. The fjords are breathtaking.",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                }
            },
            {
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": "Marco Rossi"
                },
                "datePublished": "2026-01-10",
                "reviewBody": "Professional service from start to finish. The Shala River is like Thailand but in Europe!",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                }
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
    );
}
