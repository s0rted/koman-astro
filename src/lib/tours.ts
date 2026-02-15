export interface Tour {
    slug: string;
    title: string;
    price: string;
    currency: string;
    duration: string;
    description: string;
    inclusions: string[];
    itinerary: { time: string; activity: string }[];
    gallery: string[];
    image: string;
    banner: string;
    category: string;
    mp4Src?: string;
    webmSrc?: string;
}

export const EUR_TO_LEK = 106;

export const TOURS: Tour[] = [
    {
        slug: "boat-tour",
        title: "Komani Lake Boat Tour",
        price: "54",
        currency: "€",
        duration: "11 Hours",
        description: "Escape the ordinary and navigate the 'Thailand of Albania' in our traditional boats. Your journey begins with a seamless transfer from Shkoder, leading you deep into the emerald fjords of Komani Lake. Experience the serenity of the Molla Valley, taste authentic village cuisine by the riverside, and immerse yourself in nature with kayaking, trekking, and swimming. This isn't just a tour; it's a sensory awakening.",
        inclusions: [
            "Seamless transfers from Shkoder",
            "Traditional boat navigation",
            "Authentic village lunch",
            "Kayaking, trekking & swimming",
            "Coffee & scenic breaks",
            "Expert local guidance"
        ],
        itinerary: [
            { time: "07:00 AM", activity: "Departing daily from our spots in Shkoder" },
            { time: "09:00 AM", activity: "Boat tour starts" },
            { time: "10:30 AM", activity: "Arrival at Molla valley and river" },
            { time: "12:30 PM", activity: "Lunch break at village" },
            { time: "01:30 PM", activity: "Free time (kayaking, trekking, swimming, fishing)" },
            { time: "03:00 PM", activity: "Return journey begins" },
            { time: "06:00 PM", activity: "Arrival in Shkoder" }
        ],
        gallery: [
            "/albums/optimized/IMG_6309.webp",
            "/albums/optimized/IMG_6350.webp",
            "/albums/optimized/IMG_2977.webp",
            "/albums/optimized/IMG_6080.webp",
            "/albums/optimized/DSC_0499.webp",
            "/albums/optimized/DSC_0447.webp",
            "/albums/optimized/IMG_20230718_083740134.webp",
            "/albums/optimized/DSC_0510.webp",
            "/albums/optimized/DSC_0483.webp",
            "/albums/optimized/DSC_0470.webp",
            "/albums/optimized/IMG_0516.webp",
            "/albums/optimized/13731947_1060149550689715_2950536427892218900_o.webp"
        ],
        image: "/images/tours/boat-featured.webp",
        banner: "/images/tours/boat-tour-hero.webp",
        category: "Full Day Adventure"
    },
    {
        slug: "shkoder-valbona",
        title: "Shkoder - Valbona Transfer",
        price: "30",
        currency: "€",
        duration: "6 Hours",
        description: "Transform your transit into an adventure. Our daily Shkoder-Valbona service combines the efficiency of a direct transfer with the breathtaking beauty of the Komani Lake ferry. Ideal for hikers and explorers, this route offers the most spectacular introduction to the Albanian Alps, surrounding you with towering cliffs and crystal-clear waters.",
        inclusions: [
            "Daily departures",
            "Komani Lake ferry ticket",
            "Complete Shkoder-Valbona route",
            "Hassle-free transfers",
            "Panoramic mountain views"
        ],
        itinerary: [
            { time: "06:30 AM", activity: "Pickup in Shkoder" },
            { time: "09:00 AM", activity: "Ferry departure from Koman" },
            { time: "11:30 AM", activity: "Ferry arrival in Fierza" },
            { time: "01:00 PM", activity: "Arrival in Valbona" }
        ],
        gallery: [],
        image: "/images/tours/shkoder-valbona.webp",
        banner: "/images/tours/shkoder-valbona.webp",
        category: "Transfer"
    },
    {
        slug: "local-experience",
        title: "The Local Experience",
        price: "100",
        currency: "€",
        duration: "2-3 Days",
        description: "Disconnect to reconnect. Immerse yourself in the living history of the Albanian Alps. Spend 2-3 days in authentic Kullas (fortified tower houses), where the walls whisper tales of ancestry and resilience. Savor organic local cuisine, hike to breathtaking peaks at 1250m, and discover hidden tracks. Options for mule riding and fishing allow you to tailor this deep dive into tradition.",
        inclusions: [
            "Seamless transfers from Shkoder",
            "Heritage Kulla accommodation",
            "Organic local cuisine",
            "Guided peak hikes (1250m)",
            "Cultural storytelling & history",
            "Optional: Mule riding & Fishing"
        ],
        itinerary: [
            { time: "Day 1", activity: "Village welcome, traditional dinner & folklore" },
            { time: "Day 2", activity: "Summit hike (1250m) & alpine exploration" },
            { time: "Day 3", activity: "Heritage tracks, fishing & farewell" }
        ],
        gallery: [],
        image: "/images/tours/local-experience.webp",
        banner: "/images/tours/local-experience.webp",
        category: "Multi-Day Immersion"
    },
    {
        slug: "kayak-rental",
        title: "Kayak & Solo Adventure",
        price: "20",
        currency: "€",
        duration: "Rent / Hour",
        description: "Rent a kayak and explore the hidden corners of the Shala River at your own pace. Discover secret beaches accessible only by small boats, paddle through the silent fjords, and find your own private slice of paradise.",
        inclusions: [
            "High-quality Kayak rental",
            "Paddle & Life jacket",
            "Safety briefing",
            "Map of best spots",
            "Storage for belongings"
        ],
        itinerary: [
            { time: "Flexible", activity: "Pick up at Blini Park or Shala River" },
            { time: "Duration", activity: "Rent by hour or full day" }
        ],
        gallery: [],
        image: "/images/tours/kayak-adventure.webp",
        banner: "/images/tours/kayak-adventure.webp",
        category: "Adventure"
    },
    {
        slug: "helicopter-tour",
        title: "Helicopter Sky Cruise",
        price: "Call",
        currency: "",
        duration: "Flexible",
        description: "In collaboration with Viva Air Albania. Fly from Tirana to the Alps, soaring over the Riviera, canyons, and Komani Lake. Optional lunch stop at Shala River.",
        inclusions: [
            "Tirana Heliport departure",
            "Aerial tour of Riviera & Alps",
            "Komani Lake flyover",
            "Optional lunch stop",
            "Professional pilot"
        ],
        itinerary: [
            { time: "TBD", activity: "Departure from Tirana Heliport" },
            { time: "Flight", activity: "Scenic flight over Albanian Alps & Komani Lake" },
            { time: "Land", activity: "Optional landing at Shala River/Theth/Valbona" },
            { time: "Return", activity: "Flight back to Tirana" }
        ],
        gallery: [],
        image: "/albums/optimized/DSC_0510.webp",
        banner: "/albums/optimized/DSC_0510.webp",
        mp4Src: "/videos/helicopter-tour.mp4",
        webmSrc: "/videos/helicopter-tour.webm",
        category: "Premium"
    },
    {
        slug: "custom-tour",
        title: "Custom Tour",
        price: "Contact",
        currency: "",
        duration: "Flexible",
        description: "Tailor your own adventure. Private boat, specific route, or special event - we make it happen.",
        inclusions: [
            "Private specialized guide",
            "Customized itinerary",
            "Flexible timing",
            "Private transportation",
            "Personalized experience"
        ],
        itinerary: [
            { time: "Custom", activity: "Your choice of departure and destinations" }
        ],
        gallery: [],
        image: "/images/tours/boat-featured.webp",
        banner: "/images/tours/boat-tour-hero.webp",
        category: "Private"
    }
];

export function getTourBySlug(slug: string) {
    return TOURS.find((t) => t.slug === slug);
}
