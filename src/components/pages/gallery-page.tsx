"use client";

import { useState } from "react";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { GalleryLightbox } from "@/components/gallery/gallery-lightbox"; // Ensure this exists
import { cn } from "@/lib/utils";

interface Photo {
    src: string;
    alt: string;
    type?: "video" | "image";
}

const PHOTOS_EN: Photo[] = [
    { src: "/albums/optimized/DSC_0447.webp", alt: "Tour boat navigating the towering limestone cliffs of Koman Lake, often called the 'Thailand of Albania'." },
    { src: "/albums/optimized/IMG_3101.webp", alt: "Travelers enjoying a traditional fresh lunch at a secluded guesthouse on the banks of Koman Lake." },
    { src: "/albums/optimized/IMG_0878.webp", alt: "Tour guests taking a break to enjoy a refreshing swim in Koman Lake with a stunning view of the mountains." },
    { src: "/albums/optimized/DSC_0516.webp", alt: "Crystal-clear turquoise waters at the confluence of the Shala River and Koman Lake." },
    { src: "/albums/optimized/IMG_3085.webp", alt: "Tour Guests hiking along the scenic mountain trails overlooking the Komani Lake reservoir." },
    { src: "/albums/optimized/IMG_6350.webp", alt: "View from the boat speeding through the deep river canyons of northern Albania." },
    { src: "/albums/optimized/DSC_0415new.webp", alt: "A tour boat carrying passengers through the spectacular gorges." },
    { src: "/albums/optimized/DSC_0411new.webp", alt: "Steep vertical canyon walls rising hundreds of meters above the deep blue reservoir waters." },
    { src: "/albums/optimized/IMG_6309.webp", alt: "Ancient sedimentary rock layers revealing millions of years of geological history in the Shala Canyon." },
    { src: "/albums/optimized/DSC_0524.webp", alt: "Tranquil turquoise waters of the Shala River flanked by sunlit green canyon walls." },
    { src: "/albums/optimized/IMG_3074.webp", alt: "Tourists visiting a traditional stone shepherd's hut nestled in the Accursed Mountains." },
    { src: "/albums/optimized/IMG_3136.webp", alt: "Tourists in safety vests enjoying the thrill of a high-speed boat ride on Koman Lake." },
    { src: "/albums/optimized/IMG_2977.webp", alt: "The remote Dukajin guesthouse flying the Albanian flag, accessible only by boat." },
    { src: "/albums/optimized/IMG_6188.webp", alt: "A quiet, romantic moment aboard a traditional wooden boat with a rustic reed canopy." },
    { src: "/albums/optimized/DSC_0443.webp", alt: "Tour boat passing beneath massive limestone overhangs on the winding Koman Lake route." },
    { src: "/albums/optimized/DSC_0421.webp", alt: "Dramatic limestone peaks of the Accursed Mountains towering above the lake in early summer." },
    { src: "/albums/optimized/IMG_3046.webp", alt: "Local team member navigating through floating debris during a frequent lake cleanup operation." },
    { src: "/albums/optimized/DSC_0532.webp", alt: "Dense Mediterranean pine forests clinging to the steep vertical slopes of the gorge." },
    { src: "/albums/optimized/IMG_3058.webp", alt: "Local community volunteers keeping the Koman Lake pristine." },
    { src: "/albums/optimized/DSC_0470.webp", alt: "Tour boat crossing the widest expanse of the Koman reservoir, surrounded by wild nature." },
    { src: "/albums/optimized/IMG_3021.webp", alt: "Travelers capturing memories at a scenic viewpoint marked by a cross overlooking the lake." },
    { src: "/albums/optimized/DSC_0455.webp", alt: "Tour boat cruising beneath the sheer limestone walls of the canyon." },
    { src: "/albums/optimized/IMG_20230718_091518724_HDR.webp", alt: "Happy tourists relaxing and enjoying the views from inside the tour boat." },
    { src: "/albums/optimized/DSC_0499.webp", alt: "Small natural cave carved into the limestone cliffs, accessible only by kayak or small boat." },
    { src: "/albums/optimized/DSC_0365new.webp", alt: "The dedicated crew of Mario Molla's tours ready to welcome guests at the pier." },
    { src: "/albums/optimized/DSC_0389.webp", alt: "Mirror-like reflection of lush green mountains on the calm morning lake surface." },
    { src: "/albums/optimized/IMG_6315.webp", alt: "Unique geological rock formations along the shoreline sculpted by wind and water." },
    { src: "/albums/optimized/DSC_0433.webp", alt: "Tour boat navigating past the rugged mountain landscapes of the Koman Lake." },
    { src: "/albums/optimized/IMG_3068.webp", alt: "Shaded forest trail leading from the riverbank to hidden swimming spots and hiking paths." },
    { src: "/albums/optimized/DSC_0487.webp", alt: "Intense turquoise waters of a shallow bay, perfect for swimming and relaxation." },
    { src: "/albums/optimized/DSC_0529.webp", alt: "Scenic view of the lush green mountains sloping down to the turquoise water." },
    { src: "/albums/optimized/DSC_0406new.webp", alt: "A tour boat filled with travelers enjoying the sunny cruise through the mountains." },
    { src: "/albums/optimized/DSC_0513.webp", alt: "Lush vegetation growing on the steep limestone cliffs above the turquoise river." },
    { src: "/albums/optimized/DSC_0472new.webp", alt: "A tour boat making its way through the towering mountain landscape." },
    { src: "/albums/optimized/DSC_0452.webp", alt: "Intricate erosion patterns in the canyon walls revealing centuries of geological history." },
    { src: "/albums/optimized/DSC_0541.webp", alt: "The Komani Lake ferry terminal and dam, the starting point of the journey." },
    { src: "/albums/optimized/DSC_0483.webp", alt: "Hardy endemic vegetation clinging to the sheer vertical rock faces of the canyons." },
    { src: "/albums/optimized/IMG_0516.webp", alt: "Group lunch at a traditional guesthouse shaded by grapevines." },
    { src: "/albums/optimized/IMG_3030.webp", alt: "Local fisherman casting a net into the turquoise waters of the Koman Lake." },
    { src: "/albums/optimized/DSC_0510.webp", alt: "A serene moment of symmetry where the river reflects the green mountains perfectly." },
    { src: "/albums/optimized/IMG_6348.webp", alt: "The white wake of the boat cutting through the deep canyon waters." },
    { src: "/albums/optimized/IMG_4685.webp", alt: "Small motorboat crossing the emerald expanse, dwarfed by massive surrounding peaks." },
    { src: "/albums/optimized/IMG_6352.webp", alt: "Serpentine river winding through the deep valley towards the main reservoir." },
    { src: "/albums/optimized/DSC_0395.webp", alt: "Vastness of the Koman Lake reservoir captured from a remote high-altitude viewpoint." },
    { src: "/albums/optimized/DSC_0484.webp", alt: "Traditional stone 'Kulla' house perched precariously on the steep mountain slopes." },
    { src: "/albums/optimized/IMG_6080new.webp", alt: "Tour boat docked at the pier ready for departure." },
    { src: "/albums/optimized/13731947_1060149550689715_2950536427892218900_o.webp", alt: "Tour guests posing for a group photo on the traditional tour boat." },
    { src: "/albums/optimized/DSC_0440.webp", alt: "Tour boat arriving at a scenic riverside stop for exploration." },
    { src: "/albums/optimized/IMG_20230718_083740134.webp", alt: "Passengers enjoying the journey from the shaded wooden deck of the boat." },
    { src: "/albums/optimized/DSC_0437.webp", alt: "Tour boat carrying passengers through the bright turquoise canyon waters." },
    { src: "/albums/optimized/IMG_6186.webp", alt: "Experienced boat captain navigating the Shala River with focus and care." },
    { src: "/albums/optimized/IMG_6322.webp", alt: "Close-up detail of ancient geological striations along the Shala Canyon walls." }
];

const ALTS_SQ: Record<string, string> = {
    "/albums/optimized/DSC_0447.webp": "Anija turistike duke lundruar midis shkëmbinjve të lartë gëlqerorë të Liqenit të Komanit, i quajtur shpesh 'Tajlanda e Shqipërisë'.",
    "/albums/optimized/IMG_3101.webp": "Udhëtarët duke shijuar një drekë të freskët tradicionale në një bujtinë të izoluar në bregun e Liqenit të Komanit.",
    "/albums/optimized/IMG_0878.webp": "Mysafirët e turit duke bërë një pushim për të shijuar një not freskues në Liqenin e Komanit.",
    "/albums/optimized/DSC_0516.webp": "Ujërat e kristalta bruz në bashkimin e Lumit të Shalës dhe Liqenit të Komanit.",
    "/albums/optimized/IMG_3085.webp": "Mysafirët e turit duke ecur nëpër shtigjet piktoreske malore me pamje nga Liqeni i Komanit.",
    "/albums/optimized/IMG_6350.webp": "Pamje nga anija që lëviz me shpejtësi nëpër kanionet e thella të Shqipërisë së Veriut.",
    "/albums/optimized/DSC_0415new.webp": "Anija turistike duke transportuar pasagjerë nëpër grykat spektakolare.",
    "/albums/optimized/DSC_0411new.webp": "Muret vertikale të kanionit që ngrihen qindra metra mbi ujërat e kaltra të liqenit.",
    "/albums/optimized/IMG_6309.webp": "Shtresat e lashta të gurëve sedimentarë që zbulojnë miliona vite histori gjeologjike në Kanionin e Shalës.",
    "/albums/optimized/DSC_0524.webp": "Ujërat e qeta bruz të Lumit të Shalës rrethuar nga muret e kanionit të ndriçuara nga dielli.",
    "/albums/optimized/IMG_3074.webp": "Turistët duke vizituar një stan tradicional guri në Bjeshkët e Namuna.",
    "/albums/optimized/IMG_3136.webp": "Turistët me jelekë shpëtimi duke shijuar udhëtimin me shpejtësi në Liqenin e Komanit.",
    "/albums/optimized/IMG_2977.webp": "Bujtina e izoluar në Dukajin me flamurin shqiptar, e aksesueshme vetëm me anije.",
    "/albums/optimized/IMG_6188.webp": "Një moment i qetë dhe romantik në një anije tradicionale druri.",
    "/albums/optimized/DSC_0443.webp": "Anija turistike duke kaluar nën muret masive gëlqerore në itinerarin e Komanit.",
    "/albums/optimized/DSC_0421.webp": "Majat dramatike gëlqerore të Bjeshkëve të Namuna mbi liqen.",
    "/albums/optimized/IMG_3046.webp": "Anëtari i ekipit lokal duke pastruar mbetjet në liqen gjatë një operacioni pastrimi.",
    "/albums/optimized/DSC_0470.webp": "Anija turistike duke kaluar pjesën më të gjerë të rezervuarit të Komanit.",
    "/albums/optimized/IMG_20230718_091518724_HDR.webp": "Turistë të lumtur duke u çlodhur dhe duke shijuar pamjet nga brenda anijes.",
    "/albums/optimized/DSC_0499.webp": "Shpellë e vogël natyrore në shkëmbinjtë gëlqerorë.",
    "/albums/optimized/DSC_0365new.webp": "Ekuipazhi i dedikuar i tureve të Mario Mollës gati për të mirëpritur mysafirët.",
    "/albums/optimized/DSC_0389.webp": "Refleksim si pasqyrë i maleve të gjelbra në sipërfaqen e qetë të liqenit në mëngjes.",
    "/albums/optimized/IMG_6080new.webp": "Anija turistike e ankoruar në mol, gati për nisje.",
    "/albums/optimized/DSC_0406new.webp": "Anija turistike e mbushur me udhëtarë që shijojnë lundrimin me diell nëpër male.",
    "/albums/optimized/DSC_0472new.webp": "Anija turistike duke kaluar nëpër peizazhin malor të lartë."
};

interface GalleryPageProps {
    title: string;
    subtitle: string;
    locale: string;
}

export function GalleryPage({ title, subtitle, locale }: GalleryPageProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const photos = PHOTOS_EN.map(p => ({
        ...p,
        alt: locale === 'sq' ? (ALTS_SQ[p.src] || p.alt) : p.alt
    }));

    return (
        <main className="min-h-screen pt-40 pb-16 bg-white overflow-x-hidden">
            <div className="container mx-auto px-4">
                <RevealOnScroll className="text-center mb-12 md:mb-20">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 tracking-tighter text-balance uppercase">
                        {title}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed text-pretty">
                        {subtitle}
                    </p>
                </RevealOnScroll>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
                    {photos.map((photo, i) => (
                        <div
                            key={i}
                            className="relative aspect-[4/5] rounded-lg md:rounded-xl bg-slate-100 group overflow-hidden cursor-zoom-in shadow-sm hover:shadow-xl transition-all duration-500"
                            onClick={() => setLightboxIndex(i)}
                        >
                            <RevealOnScroll
                                delay={i < 12 ? (i % 4) * 0.08 : 0}
                                className="w-full h-full relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex flex-col justify-end p-4">
                                    <p className="text-white text-xs md:text-sm font-medium line-clamp-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                        {photo.alt}
                                    </p>
                                </div>

                                <div className="absolute inset-0 bg-slate-950/5 group-hover:bg-transparent transition-colors duration-500 z-10" />

                                <img
                                    src={photo.src}
                                    alt={photo.alt}
                                    className={cn(
                                        "absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105",
                                        photo.src.includes("IMG_2977") && "-rotate-90"
                                    )}
                                // Removed Next.js Image props, using regular img
                                />
                            </RevealOnScroll>
                        </div>
                    ))}
                </div>
            </div>

            <GalleryLightbox
                photos={photos}
                currentId={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
            />
        </main>
    );
}
