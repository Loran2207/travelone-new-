// TRAVEL1 — Map / Spots / Trips data
// Themed around Poland (Warsaw · Kraków · Gdańsk) to match the imagery.
import type {
  Cat, CatMetaEntry, City, Destination, ExploreSection,
  ListDef, Place, Spot, Stop, Trip,
} from "./types";

export const IMG = "/assets/images/";

// ---- Spot categories → icon + accent color (badges & pins) ----
export const CATS: Record<string, Cat> = {
  Landmark:   { icon: "hugeicons:building-06",   color: "#2563EB", soft: "#E6EEFE" },
  Museum:     { icon: "hugeicons:image-02",       color: "#B4690E", soft: "#F7ECD7" },
  Restaurant: { icon: "hugeicons:restaurant-02",  color: "#E8590C", soft: "#FCEBDD" },
  Cafe:       { icon: "hugeicons:coffee-02",      color: "#9A6B3F", soft: "#F3EADE" },
  Bar:        { icon: "hugeicons:party",           color: "#7C3AED", soft: "#EEE7FC" },
  Park:       { icon: "hugeicons:tree-06",         color: "#2F9E44", soft: "#E3F4E6" },
  Viewpoint:  { icon: "hugeicons:mountain",        color: "#0E7490", soft: "#DEF1F4" },
  Market:     { icon: "hugeicons:store-01",        color: "#BE185D", soft: "#FCE4EF" },
  Hotel:      { icon: "hugeicons:hotel-01",        color: "#0FA3A3", soft: "#E2F5F4" },
};

// ---- per-category "type" eyebrow + emoji badge ----
export const CAT_META: Record<string, CatMetaEntry> = {
  Landmark:   { type: "Attraction",   emoji: "🏛️" },
  Museum:     { type: "Museum",       emoji: "🖼️" },
  Restaurant: { type: "Food & drink", emoji: "🍽️" },
  Cafe:       { type: "Café",         emoji: "☕" },
  Bar:        { type: "Nightlife",    emoji: "🍸" },
  Park:       { type: "Nature",       emoji: "🌳" },
  Viewpoint:  { type: "Viewpoint",    emoji: "⛰️" },
  Market:     { type: "Market",       emoji: "🛍️" },
  Hotel:      { type: "Stay",         emoji: "🏨" },
};
export function catMeta(c: string): CatMetaEntry {
  return CAT_META[c] || { type: "Place", emoji: "📍" };
}

// ---- preference / category label → Hugeicon (chips & badges) ----
const PREF_ICONS: Record<string, string> = {
  history: "hugeicons:castle-02", art: "hugeicons:paint-board", books: "hugeicons:book-02",
  music: "hugeicons:music-note-01", nature: "hugeicons:tree-06", games: "hugeicons:game-controller-01",
  hiking: "hugeicons:route-02", outdoor: "hugeicons:sun-03", architecture: "hugeicons:building-04",
  climbing: "hugeicons:mountain", camping: "hugeicons:fire-02", forest: "hugeicons:tree-07",
  mountains: "hugeicons:mountain", stargazing: "hugeicons:moon-02", urban: "hugeicons:city-01",
  desert: "hugeicons:desert", ocean: "hugeicons:sailboat-coastal", "water sports": "hugeicons:swimming",
  museums: "hugeicons:image-02", museum: "hugeicons:image-02", relax: "hugeicons:beach",
  food: "hugeicons:restaurant-02", "food & drink": "hugeicons:restaurant-02", culture: "hugeicons:knowledge-01",
  viewpoint: "hugeicons:binoculars", viewpoints: "hugeicons:binoculars",
  market: "hugeicons:shopping-bag-02", markets: "hugeicons:shopping-bag-02",
  park: "hugeicons:tree-06", parks: "hugeicons:tree-06", nightlife: "hugeicons:party",
  shopping: "hugeicons:shopping-bag-02", cafe: "hugeicons:coffee-02", "café": "hugeicons:coffee-02",
  bar: "hugeicons:party", bars: "hugeicons:party", landmark: "hugeicons:building-06",
  landmarks: "hugeicons:building-06", "hidden gems": "hugeicons:diamond-02",
  adventure: "hugeicons:compass-01", photography: "hugeicons:camera-01",
  beach: "hugeicons:beach-02", wellness: "hugeicons:flower",
};
export function prefIcon(label: string): string {
  return PREF_ICONS[label.trim().toLowerCase()] || "hugeicons:tag-01";
}

// ---- preference / category label → emoji (Figma uses colourful emoji) ----
const PREF_EMOJI: Record<string, string> = {
  history: "⚔️", art: "🎨", books: "📚", music: "🎵", nature: "🌿", games: "🎮",
  hiking: "🥾", outdoor: "🚴", architecture: "🏛️", climbing: "🧗", camping: "⛺",
  forest: "🌲", mountains: "🏔️", stargazing: "🌌", urban: "🏙️", desert: "🏜️",
  ocean: "🌊", "water sports": "🏄", museums: "🖼️", museum: "🖼️", relax: "🏖️",
  food: "🍽️", "food & drink": "🍽️", culture: "🎭", viewpoint: "🌄", viewpoints: "🌄",
  market: "🛍️", markets: "🛍️", park: "🌳", parks: "🌳", nightlife: "🍸",
  shopping: "🛍️", cafe: "☕", "café": "☕", bar: "🍸", bars: "🍸",
  landmark: "🏛️", landmarks: "🏛️", "hidden gems": "💎", adventure: "🧭",
  photography: "📷", beach: "🏖️", wellness: "🧘", archaeology: "🏺",
  "ancient civilizations": "📜", attraction: "🏛️",
};
export function prefEmoji(label: string): string {
  return PREF_EMOJI[label.trim().toLowerCase()] || "📍";
}

// ---- Places (cities) ----
export const PLACES: Record<string, Place> = {
  Warsaw: { city: "Warsaw", country: "Poland", flag: "🇵🇱", cover: IMG + "warsaw-castle.jpg" },
  Krakow: { city: "Kraków", country: "Poland", flag: "🇵🇱", cover: IMG + "city-1.jpg" },
  Gdansk: { city: "Gdańsk", country: "Poland", flag: "🇵🇱", cover: IMG + "city-warsaw.jpg" },
};

// images shorthand
export const I = {
  castle: IMG + "warsaw-castle.jpg",
  palace: IMG + "city-warsaw.jpg",
  park:   IMG + "city-2.jpg",
  air:    IMG + "hero-explore.jpg",
  guide:  IMG + "guide-warsaw.jpg",
  city1:  IMG + "city-1.jpg",
};

// ---- Spots — x/y are % positions used as a local offset on the real map ----
export const SPOTS: Spot[] = [
  // Warsaw
  { id: "castle",   name: "Royal Castle",            cat: "Landmark",   place: "Warsaw", list: "warsaw", img: I.castle,
    rating: 4.8, price: "20 zł", hours: "10:00 – 18:00", dist: "0.4 km",
    desc: "Baroque royal residence on Castle Square — meticulously rebuilt after the war, now a state museum.", x: 58, y: 30 },
  { id: "oldtown",  name: "Old Town Market Square",  cat: "Landmark",   place: "Warsaw", list: "warsaw", img: I.city1,
    rating: 4.7, price: "Free", hours: "Open 24h", dist: "0.6 km",
    desc: "The heart of Warsaw's reconstructed old town — pastel townhouses, the Mermaid statue, café terraces.", x: 47, y: 41 },
  { id: "lazienki", name: "Łazienki Park",           cat: "Park",       place: "Warsaw", list: "warsaw", img: I.park,
    rating: 4.9, price: "Free", hours: "06:00 – 21:00", dist: "2.1 km",
    desc: "Royal gardens with the Palace on the Isle, peacocks, and Sunday Chopin concerts under the oaks.", x: 33, y: 64 },
  { id: "palace",   name: "Palace of Culture",       cat: "Viewpoint",  place: "Warsaw", list: "warsaw", img: I.palace,
    rating: 4.6, price: "25 zł", hours: "10:00 – 20:00", dist: "1.5 km",
    desc: "The city's tallest landmark — ride to the 30th-floor terrace for a 360° panorama of Warsaw.", x: 68, y: 58 },
  { id: "uprising", name: "Warsaw Uprising Museum",  cat: "Museum",     place: "Warsaw", list: "warsaw", img: I.city1,
    rating: 4.8, price: "30 zł", hours: "10:00 – 18:00", dist: "3.0 km",
    desc: "Immersive tribute to the 1944 Uprising — a replica bomber, a beating-heart soundscape, a B&W film.", x: 22, y: 33 },
  { id: "koszyki",  name: "Hala Koszyki",            cat: "Market",     place: "Warsaw", list: "warsaw", img: I.guide,
    rating: 4.5, price: "60 zł", hours: "08:00 – 24:00", dist: "1.8 km",
    desc: "Restored 1908 market hall turned food hall — pierogi, ramen, natural wine under iron arches.", x: 50, y: 73 },
  { id: "polin",    name: "POLIN Museum",            cat: "Museum",     place: "Warsaw", list: "warsaw", img: I.palace,
    rating: 4.8, price: "45 zł", hours: "10:00 – 18:00", dist: "2.4 km",
    desc: "A thousand years of Polish-Jewish history in an award-winning building with a wave-walled core.", x: 38, y: 22 },
  { id: "bristol",  name: "Café Bristol",            cat: "Cafe",       place: "Warsaw", list: "warsaw", img: I.guide,
    rating: 4.6, price: "35 zł", hours: "08:00 – 22:00", dist: "0.5 km",
    desc: "Belle-époque café on the Royal Route — marble, mirrors and the city's most famous Wedel hot chocolate.", x: 62, y: 46 },

  // Kraków
  { id: "wawel",    name: "Wawel Castle",            cat: "Landmark",   place: "Krakow", list: "krakow", img: I.castle,
    rating: 4.9, price: "35 zł", hours: "09:30 – 17:00", dist: "—",
    desc: "Hilltop royal castle above the Vistula — cathedral, state rooms and the legendary dragon's den below.", x: 44, y: 38 },
  { id: "rynek",    name: "Main Market Square",      cat: "Landmark",   place: "Krakow", list: "krakow", img: I.city1,
    rating: 4.8, price: "Free", hours: "Open 24h", dist: "—",
    desc: "Europe's largest medieval square — the Cloth Hall, St. Mary's trumpet call, horse-drawn carriages.", x: 57, y: 52 },
  { id: "kazimierz", name: "Kazimierz",              cat: "Bar",        place: "Krakow", list: "krakow", img: I.guide,
    rating: 4.7, price: "40 zł", hours: "Bars till late", dist: "—",
    desc: "The old Jewish quarter — vintage bars, zapiekanka stalls on Plac Nowy, street art down every lane.", x: 36, y: 66 },
  { id: "schindler", name: "Schindler's Factory",    cat: "Museum",     place: "Krakow", list: "krakow", img: I.palace,
    rating: 4.8, price: "32 zł", hours: "10:00 – 18:00", dist: "—",
    desc: "Oskar Schindler's enamel factory, now a powerful museum of Kraków under Nazi occupation.", x: 66, y: 70 },

  // Gdańsk
  { id: "longmkt",  name: "Long Market",             cat: "Landmark",   place: "Gdansk", list: "gdansk", img: I.city1,
    rating: 4.8, price: "Free", hours: "Open 24h", dist: "—",
    desc: "Gdańsk's grand promenade of merchant houses, Neptune's Fountain and the gilded Golden Gate.", x: 50, y: 40 },
  { id: "crane",    name: "The Crane (Żuraw)",       cat: "Landmark",   place: "Gdansk", list: "gdansk", img: I.castle,
    rating: 4.6, price: "18 zł", hours: "10:00 – 18:00", dist: "—",
    desc: "Medieval port crane on the Motława — once the largest in Europe, now the Maritime Museum's icon.", x: 60, y: 58 },
  { id: "solidarity", name: "Solidarity Centre",     cat: "Museum",     place: "Gdansk", list: "gdansk", img: I.palace,
    rating: 4.7, price: "30 zł", hours: "10:00 – 17:00", dist: "—",
    desc: "Where Solidarity was born — a weathered-steel hall telling the story that toppled the Iron Curtain.", x: 34, y: 28 },
];

// ---- Lists. "My Spots" is the special catch-all collection. ----
export const LISTS: ListDef[] = [
  { id: "myspots", name: "My Spots", special: true, pin: true },
  { id: "warsaw",  name: "Warsaw Favourites", cover: I.castle, collab: true, note: "Built with Marta" },
  { id: "krakow",  name: "Kraków",  cover: I.city1 },
  { id: "gdansk",  name: "Gdańsk Weekend", cover: I.palace },
];

// ---- Day route colors ----
export const DAY_COLORS = ["#0A84FF", "#F59E0B", "#EC4D6B", "#7C5CFC", "#15A06B"];

// ---- Trips — multi-day itineraries ----
export const TRIPS: Trip[] = [
  {
    id: "war-history", name: "History from ruins", subtitle: "The war that shaped a city",
    place: "Warsaw", badge: "New", saved: false, mine: false, cover: I.castle,
    cats: ["History", "Architecture", "Museums", "Memorials"],
    stats: { places: 6, steps: "40k", km: 8.5, days: 3 },
    days: [
      { n: 1, km: 3.2, stops: [
        { id: "polin",   name: "POLIN Museum",    cat: "Museum",   img: I.palace, note: "Open with a thousand years of history", x: 38, y: 22, toNext: 900 },
        { id: "uprising", name: "Uprising Museum", cat: "Museum",   img: I.city1,  note: "Allow 2 hours — it's intense", x: 22, y: 38, toNext: 1400 },
        { id: "oldtown", name: "Old Town Square", cat: "Landmark", img: I.city1,  note: "Lunch on the terrace", x: 47, y: 55, toNext: null },
      ]},
      { n: 2, km: 2.8, stops: [
        { id: "castle",  name: "Royal Castle",      cat: "Landmark", img: I.castle, note: "Start at Castle Square", x: 58, y: 30, toNext: 600 },
        { id: "bristol", name: "Café Bristol",      cat: "Cafe",     img: I.guide,  note: "Wedel hot chocolate stop", x: 62, y: 46, toNext: 1100 },
        { id: "palace",  name: "Palace of Culture", cat: "Viewpoint", img: I.palace, note: "Sunset from the 30th floor", x: 68, y: 64, toNext: null },
      ]},
      { n: 3, km: 2.5, stops: [
        { id: "lazienki", name: "Łazienki Park",   cat: "Park",     img: I.park,   note: "Chopin concert at noon (summer)", x: 33, y: 64, toNext: 1800 },
        { id: "koszyki", name: "Hala Koszyki",     cat: "Market",   img: I.guide,  note: "Farewell dinner under the arches", x: 56, y: 50, toNext: null },
      ]},
    ],
  },
  {
    id: "war-green", name: "Green Warsaw", subtitle: "Parks, palaces & slow mornings",
    place: "Warsaw", badge: null, saved: true, mine: false, cover: I.park,
    cats: ["Nature", "Architecture", "Relax"],
    stats: { places: 4, steps: "22k", km: 5.0, days: 1 },
    days: [
      { n: 1, km: 5.0, stops: [
        { id: "lazienki", name: "Łazienki Park",        cat: "Park",     img: I.park,   note: "Peacocks & the Palace on the Isle", x: 30, y: 30, toNext: 1600 },
        { id: "bristol", name: "Café Bristol",          cat: "Cafe",     img: I.guide,  note: "Mid-walk coffee", x: 50, y: 48, toNext: 900 },
        { id: "castle",  name: "Royal Castle gardens",  cat: "Park",     img: I.castle, note: "Riverside terraces", x: 64, y: 60, toNext: 700 },
        { id: "oldtown", name: "Vistula Boulevards",    cat: "Viewpoint", img: I.city1, note: "Sunset by the river", x: 72, y: 74, toNext: null },
      ]},
    ],
  },
  {
    id: "krk-oldtown", name: "Kraków old town crawl", subtitle: "Squares, cellars & vodka bars",
    place: "Krakow", badge: null, saved: false, mine: false, cover: I.city1,
    cats: ["Food & Drink", "History", "Nightlife"],
    stats: { places: 4, steps: "18k", km: 4.2, days: 2 },
    days: [
      { n: 1, km: 2.2, stops: [
        { id: "wawel",   name: "Wawel Castle",       cat: "Landmark", img: I.castle, note: "Beat the crowds — go early", x: 44, y: 30, toNext: 800 },
        { id: "rynek",   name: "Main Market Square", cat: "Landmark", img: I.city1,  note: "Cloth Hall & St. Mary's", x: 57, y: 52, toNext: null },
      ]},
      { n: 2, km: 2.0, stops: [
        { id: "schindler", name: "Schindler's Factory", cat: "Museum", img: I.palace, note: "Book a timed ticket", x: 66, y: 40, toNext: 1500 },
        { id: "kazimierz", name: "Kazimierz",           cat: "Bar",    img: I.guide,  note: "Zapiekanka on Plac Nowy", x: 36, y: 66, toNext: null },
      ]},
    ],
  },
  {
    id: "war-food", name: "Eat your way through Warsaw", subtitle: "Milk bars, food halls & pierogi",
    place: "Warsaw", badge: "New", saved: false, mine: false, cover: I.guide,
    cats: ["Food & Drink", "Markets", "Cafés", "Local"],
    stats: { places: 5, steps: "26k", km: 6.2, days: 2 },
    days: [
      { n: 1, km: 3.4, stops: [
        { id: "koszyki", name: "Hala Koszyki",     cat: "Market",     img: I.guide,  note: "Brunch under iron arches", x: 40, y: 26, toNext: 1100 },
        { id: "bristol", name: "Café Bristol",     cat: "Cafe",       img: I.guide,  note: "Wedel hot chocolate", x: 56, y: 44, toNext: 1500 },
        { id: "oldtown", name: "Old Town pierogi", cat: "Restaurant", img: I.city1,  note: "Classic ruskie pierogi", x: 50, y: 62, toNext: null },
      ]},
      { n: 2, km: 2.8, stops: [
        { id: "palace",   name: "Rooftop sundowner",  cat: "Bar",     img: I.palace, note: "Cocktails at golden hour", x: 64, y: 34, toNext: 900 },
        { id: "koszyki2", name: "Night market bites", cat: "Market",  img: I.guide,  note: "Late ramen & wine", x: 52, y: 56, toNext: null },
      ]},
    ],
  },
  {
    id: "gda-weekend", name: "Gdańsk in a weekend", subtitle: "Amber, the Baltic & old port lanes",
    place: "Gdansk", badge: null, saved: false, mine: false, cover: I.palace,
    cats: ["History", "Architecture", "Coast"],
    stats: { places: 4, steps: "19k", km: 4.5, days: 2 },
    days: [
      { n: 1, km: 2.5, stops: [
        { id: "longmkt", name: "Long Market",       cat: "Landmark", img: I.city1,  note: "Start at the Golden Gate", x: 40, y: 28, toNext: 1300 },
        { id: "crane",   name: "The Crane (Żuraw)", cat: "Landmark", img: I.castle, note: "Riverside photo stop", x: 60, y: 50, toNext: null },
      ]},
      { n: 2, km: 2.0, stops: [
        { id: "solidarity", name: "Solidarity Centre", cat: "Museum",   img: I.palace, note: "Allow 90 minutes", x: 34, y: 30, toNext: 1600 },
        { id: "crane2",     name: "Motława boardwalk", cat: "Viewpoint", img: I.castle, note: "Sunset by the water", x: 58, y: 64, toNext: null },
      ]},
    ],
  },
];

// ---- Cities (Explore · wizard destinations) ----
export const CITIES: City[] = [
  { id: "Berlin",  city: "Berlin",  country: "Germany", flag: "🇩🇪", cover: IMG + "city-2.jpg",       guides: 128, tint: "#FBF6D9" },
  { id: "Krakow",  city: "Kraków",  country: "Poland",  flag: "🇵🇱", cover: IMG + "city-1.jpg",        guides: 96,  tint: "#FCE7EA" },
  { id: "Warsaw",  city: "Warsaw",  country: "Poland",  flag: "🇵🇱", cover: IMG + "warsaw-castle.jpg",  guides: 100, tint: "#FCE9EC" },
  { id: "Gdansk",  city: "Gdańsk",  country: "Poland",  flag: "🇵🇱", cover: IMG + "city-warsaw.jpg",    guides: 64,  tint: "#FBE6DC" },
  { id: "Toronto", city: "Toronto", country: "Canada",  flag: "🇨🇦", cover: IMG + "hero-explore.jpg",   guides: 142, tint: "#FCE7EA" },
  { id: "Madrid",  city: "Madrid",  country: "Spain",   flag: "🇪🇸", cover: IMG + "guide-warsaw.jpg",   guides: 88,  tint: "#FBE6DC" },
  { id: "Prague",  city: "Prague",  country: "Czechia", flag: "🇨🇿", cover: IMG + "city-2.jpg",         guides: 110, tint: "#FCE7EA" },
  { id: "Lublin",  city: "Lublin",  country: "Poland",  flag: "🇵🇱", cover: IMG + "guide-warsaw.jpg",   guides: 38,  tint: "#FBE6DC" },
];

export const EXPLORE_SECTIONS: ExploreSection[] = [
  { id: "popular", title: "Popular right now", cities: ["Krakow", "Warsaw", "Gdansk"] },
  { id: "nearby",  title: "Nearby to you",     cities: ["Gdansk", "Berlin", "Krakow", "Lublin"] },
  { id: "top",     title: "Top picks for you", cities: ["Berlin", "Prague", "Madrid", "Toronto"] },
];
export function cityById(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

// wizard "Where?" suggested destinations (Nearby first, then cities)
export const DESTINATIONS: Destination[] = [
  { id: "nearby", city: "Nearby", country: "Find what's around you", flag: "", nearby: true, avatar: true },
  ...(["Warsaw", "Berlin", "Krakow", "Toronto", "Madrid", "Gdansk"]
    .map((id) => CITIES.find((c) => c.id === id))
    .filter(Boolean) as City[]),
];

export const WIZARD_PREFS = [
  "History", "Art", "Books", "Music", "Nature", "Games", "Hiking", "Outdoor",
  "Architecture", "Climbing", "Camping", "Forest", "Mountains", "Stargazing",
  "Urban", "Desert", "Ocean", "Water Sports",
];

export const DURATIONS = ["Half day", "1 day", "2 days", "3 days", "4 days", "5 days", "7 days", "10 days", "14 days", "20 days"];

export function citiesWithGuides(place: string): Trip[] {
  return TRIPS.filter((t) => t.place === place);
}

// ---- helpers ----
export function spotsOf(listId: string): Spot[] {
  if (listId === "myspots") return SPOTS;
  return SPOTS.filter((s) => s.list === listId);
}
export function placesOf(listId: string): string[] {
  return [...new Set(spotsOf(listId).map((s) => s.place))];
}
export function tripsForPlace(place: string): Trip[] {
  return TRIPS.filter((t) => t.place === place);
}
export function tripStops(trip: Trip): Stop[] {
  return trip.days.reduce<Stop[]>((a, d) => a.concat(d.stops), []);
}
export function placeMeta(p: string): Place {
  return PLACES[p] || { city: p, country: "", flag: "" };
}

export interface CountryGroup {
  flag: string;
  cities: Record<string, Spot[]>;
}
export function groupByCountry(spots: Spot[]): Record<string, CountryGroup> {
  const byCountry: Record<string, CountryGroup> = {};
  spots.forEach((s) => {
    const pm = placeMeta(s.place);
    const grp = (byCountry[pm.country] = byCountry[pm.country] || { flag: pm.flag, cities: {} });
    grp.flag = pm.flag;
    (grp.cities[s.place] = grp.cities[s.place] || []).push(s);
  });
  return byCountry;
}
