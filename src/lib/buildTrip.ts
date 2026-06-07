// TRAVEL1 — generate a day-by-day trip from a list's spots.
// Ported from Map.html's buildTrip(); supports manual day assignment.
import { placeMeta, placesOf, spotsOf } from "../data/data";
import type { Day, ListDef, Spot, Stop, Trip } from "../data/types";

export function buildTrip(list: ListDef, days: number, prefs: string[], assign?: Record<string, number>): Trip {
  const spots = spotsOf(list.id);
  const city = placesOf(list.id)[0] || "Warsaw";
  const dist = (a: Spot, b: Spot) =>
    Math.round((Math.hypot(a.x - b.x, a.y - b.y) * 24) / 50) * 50 + 200;
  const note = (s: Spot) =>
    s.desc.length > 62 ? s.desc.slice(0, 60).trim() + "…" : s.desc;

  // group spots into days: manual assignment if given, else even chunks
  let groups: Spot[][];
  if (assign) {
    groups = Array.from({ length: days }, () => [] as Spot[]);
    spots.forEach((s) => { const d = Math.min(days, Math.max(1, assign[s.id] || 1)); groups[d - 1].push(s); });
  } else {
    const per = Math.max(1, Math.ceil(spots.length / days));
    groups = Array.from({ length: days }, (_, d) => spots.slice(d * per, (d + 1) * per));
  }

  const dayArr: Day[] = [];
  groups.forEach((chunk) => {
    if (!chunk.length) return;
    const stops: Stop[] = chunk.map((s, i) => ({
      id: s.id, name: s.name, cat: s.cat, img: s.img, note: note(s), x: s.x, y: s.y,
      toNext: i < chunk.length - 1 ? dist(chunk[i], chunk[i + 1]) : null,
    }));
    const km = stops.reduce((a, s) => a + (s.toNext || 0), 0) / 1000;
    dayArr.push({ n: dayArr.length + 1, km: +km.toFixed(1), stops });
  });

  const totalKm = +dayArr.reduce((a, d) => a + d.km, 0).toFixed(1);
  return {
    id: "gen-" + Date.now(),
    name: placeMeta(city).city + " in " + dayArr.length + (dayArr.length === 1 ? " day" : " days"),
    subtitle: "Your custom route",
    place: city, badge: null, saved: true, mine: true, cover: list.cover || "",
    cats: prefs.length ? prefs.slice(0, 4) : ["Custom"],
    stats: {
      places: spots.length,
      steps: Math.max(1, Math.round(totalKm * 1.3)) + "k",
      km: totalKm,
      days: dayArr.length,
    },
    days: dayArr,
  };
}
