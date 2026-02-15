export function JsonLd() {
    const businessSchema = {
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        "name": "Komani Lake Tours",
        "image": "/og-image.jpg",
        "@id": "/",
        "url": "/",
        "telephone": "+35569XXXXXXX",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Koman Terminal",
            "addressLocality": "Koman",
            "addressRegion": "Shkoder",
            "postalCode": "4001",
            "addressCountry": "AL"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 42.1090,
            "longitude": 19.8258
        },
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            "opens": "06:00",
            "closes": "20:00"
        }
    };

    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Mario Molla",
        "jobTitle": "Lead Guide & Founder",
        "affiliation": {
            "@type": "Organization",
            "name": "Komani Lake Tours"
        },
        "description": "Pioneer of Komani Lake tourism and conservation advocate."
    };

    const graphSchema = {
        "@context": "https://schema.org",
        "@graph": [businessSchema, personSchema]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
        />
    );
}
