// TRAVEL1 — tab screens: Explore home, Saved, My Trips, Results + cards
import { Fragment, useEffect, useState } from "react";
import { CATS, EXPLORE_SECTIONS, I, IMG, SPOTS, catMeta, cityById, placeMeta, prefEmoji } from "../data/data";
import type { City, Trip } from "../data/types";
import { Emoji, Flag } from "./chrome";

// ---- city card (single card type used in every Explore rail) ----
export function CityCard({ city, onClick }: { city: City; onClick: () => void }) {
  return (
    <div className="citycard" onClick={onClick}>
      <div className="cc-img" style={{ backgroundImage: `url(${city.cover})` }}></div>
      <div className="cc-name">{city.city} <Flag e={city.flag} size={15} /></div>
      <div className="cc-country">{city.country}</div>
    </div>
  );
}

// ---- guide card (results / saved / my trips) ----
export function GuideCard({ trip, saved, onOpen, onHeart }: {
  trip: Trip; saved: boolean; onOpen: () => void; onHeart?: () => void;
}) {
  const pm = placeMeta(trip.place);
  return (
    <div className="guidecard" onClick={onOpen}>
      <div className="gc-cover" style={{ backgroundImage: `url(${trip.cover})` }}>
        {trip.badge && <span className="gc-new">{trip.badge}</span>}
        {onHeart && (
          <button className={"gc-heart" + (saved ? " on" : "")} onClick={(e) => { e.stopPropagation(); onHeart(); }} aria-label="Save guide">
            <iconify-icon icon={saved ? "solar:heart-bold" : "solar:heart-linear"}></iconify-icon>
          </button>
        )}
        <span className="gc-place"><iconify-icon icon="solar:map-point-bold" style={{ fontSize: 14, color: "var(--t1-orange)" }}></iconify-icon>{pm.city} <Flag e={pm.flag} size={13} /></span>
        <span className="gc-count"><iconify-icon icon="hugeicons:image-02"></iconify-icon>1/{trip.stats.places}</span>
      </div>
      <div className="gc-title">{trip.name}{trip.subtitle ? ": " + trip.subtitle : ""}</div>
      <div className="gc-meta">
        <span>{trip.stats.places} places</span>
        <span>{trip.stats.steps} steps</span>
        <span>{trip.stats.km} km</span>
      </div>
      <div className="gc-cats">
        {trip.cats.map((c) => <span key={c} className="gc-tag"><Emoji e={prefEmoji(c)} size={16} />{c}</span>)}
      </div>
    </div>
  );
}

// ---- EXPLORE home ----
export function ExploreScreen({ onSearch, onOpenCity }: {
  onSearch: () => void; onOpenCity: (c: City) => void;
  savedTrips?: Set<string>; onOpenGuide?: (id: string) => void; onHeart?: (t: Trip) => void;
}) {
  return (
    <div className="screen explore">
      <div className="hero">
        <div className="hero-photo" style={{ backgroundImage: `url(${IMG}hero-explore.jpg)` }}></div>
        <div className="hero-inner">
          <div className="hero-eyebrow">TRAVEL1</div>
          <h1 className="hero-title">Travel guides for every city on earth</h1>
          <button className="hero-search" onClick={onSearch}>
            <iconify-icon icon="solar:magnifer-linear"></iconify-icon> Explore guides
          </button>
        </div>
      </div>
      <div className="panel screen-pad">
        {EXPLORE_SECTIONS.map((sec) => (
          <div key={sec.id} className="explore-sec">
            <div className="section-h"><div className="h">{sec.title}</div></div>
            <div className="rail">
              {sec.cities.map((id) => cityById(id)).filter(Boolean).map((c, i) => (
                <CityCard key={sec.id + "-" + (c as City).id + "-" + i} city={c as City} onClick={() => onOpenCity(c as City)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- country filter chips ----
export function CountryChips({ countries, value, onChange }: {
  countries: { country: string; flag: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="tabchips">
      <button className={"tabchip" + (value === "all" ? " on" : "")} onClick={() => onChange("all")}>All</button>
      {countries.map((c) => (
        <button key={c.country} className={"tabchip" + (value === c.country ? " on" : "")} onClick={() => onChange(c.country)}>
          {c.country} <Flag e={c.flag} size={14} />
        </button>
      ))}
    </div>
  );
}

// ---- SAVED tab ----
export function SavedScreen({ allTrips, savedTrips, filter, sort, onFilter, onOpenGuide, onHeart, onExplore, onMap }: {
  allTrips: Trip[]; savedTrips: Set<string>; filter: string; sort?: string; onFilter: (f: string) => void;
  onOpenGuide: (id: string) => void; onHeart: (t: Trip) => void; onExplore: () => void; onMap: () => void;
}) {
  const sortTrips = (arr: Trip[]) => {
    if (sort === "name") return [...arr].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "places") return [...arr].sort((a, b) => b.stats.places - a.stats.places);
    return arr;
  };
  const saved = allTrips.filter((t) => savedTrips.has(t.id));
  const countries = [...new Map(saved.map((t) => [placeMeta(t.place).country, { country: placeMeta(t.place).country, flag: placeMeta(t.place).flag }])).values()];
  const shown = filter === "all" ? saved : saved.filter((t) => placeMeta(t.place).country === filter);
  return (
    <div className="screen screen-pad">
      <div className="screen-title"><h1>Saved</h1></div>
      {saved.length === 0 ? (
        <div className="emptystate">
          <div className="es-title">Nothing saved yet</div>
          <div className="es-sub">Tap <iconify-icon icon="solar:heart-linear"></iconify-icon> on any guide to save it for later</div>
          <button className="es-cta" onClick={onExplore}><iconify-icon icon="solar:magnifer-linear"></iconify-icon> Explore guides</button>
          <button className="es-cta2" onClick={onMap}><iconify-icon icon="solar:map-bold"></iconify-icon> Open the map</button>
        </div>
      ) : (
        <Fragment>
          <CountryChips countries={countries} value={filter} onChange={onFilter} />
          {sortTrips(shown).map((t) => <GuideCard key={t.id} trip={t} saved onOpen={() => onOpenGuide(t.id)} onHeart={() => onHeart(t)} />)}
        </Fragment>
      )}
    </div>
  );
}

// ---- MY TRIPS tab ----
export function MyTripsScreen({ allTrips, myTrips, savedTrips, filter, sort, onFilter, onOpenGuide, onHeart, onExplore, onMap }: {
  allTrips: Trip[]; myTrips: Set<string>; savedTrips: Set<string>; filter: string; sort?: string; onFilter: (f: string) => void;
  onOpenGuide: (id: string) => void; onHeart: (t: Trip) => void; onExplore: () => void; onMap: () => void;
}) {
  const sortTrips = (arr: Trip[]) => {
    if (sort === "name") return [...arr].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "places") return [...arr].sort((a, b) => b.stats.places - a.stats.places);
    return arr;
  };
  const mine = allTrips.filter((t) => myTrips.has(t.id));
  const countries = [...new Map(mine.map((t) => [placeMeta(t.place).country, { country: placeMeta(t.place).country, flag: placeMeta(t.place).flag }])).values()];
  const shown = filter === "all" ? mine : mine.filter((t) => placeMeta(t.place).country === filter);
  return (
    <div className="screen screen-pad">
      <div className="screen-title"><h1>My Trips</h1></div>
      {mine.length === 0 ? (
        <div className="emptystate">
          <div className="es-title">No trips planned yet</div>
          <div className="es-sub">Open any guide and tap “+ My Trips”, or build one from a list on the map</div>
          <button className="es-cta" onClick={onExplore}><iconify-icon icon="solar:magnifer-linear"></iconify-icon> Explore guides</button>
          <button className="es-cta2" onClick={onMap}><iconify-icon icon="solar:map-bold"></iconify-icon> Open the map</button>
        </div>
      ) : (
        <Fragment>
          <CountryChips countries={countries} value={filter} onChange={onFilter} />
          {sortTrips(shown).map((t) => <GuideCard key={t.id} trip={t} saved={savedTrips.has(t.id)} onOpen={() => onOpenGuide(t.id)} onHeart={() => onHeart(t)} />)}
        </Fragment>
      )}
    </div>
  );
}

// ---- RESULTS (after the wizard) ----
export interface ResultsQuery { place: string; duration?: string; prefs?: string[]; mode?: string }
export function ResultsScreen({ query, onBack, allTrips, savedTrips, onOpenGuide, onHeart, onFilters }: {
  query: ResultsQuery; onBack: () => void; allTrips: Trip[]; savedTrips: Set<string>;
  onOpenGuide: (id: string) => void; onHeart: (t: Trip) => void; onFilters: () => void;
}) {
  const pm = placeMeta(query.place);
  const [si, setSi] = useState(0);
  const SORTS = [{ k: "rec", l: "Recommended" }, { k: "places", l: "Most places" }, { k: "short", l: "Shortest" }];
  let guides = query.place ? allTrips.filter((t) => t.place === query.place) : allTrips.slice();
  if (guides.length === 0) guides = allTrips.slice();
  if (query.prefs && query.prefs.length) {
    guides = [...guides].sort((a, b) => {
      const score = (t: Trip) => t.cats.filter((c) => query.prefs!.some((p) => c.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(c.toLowerCase()))).length;
      return score(b) - score(a);
    });
  }
  if (SORTS[si].k === "places") guides = [...guides].sort((a, b) => b.stats.places - a.stats.places);
  else if (SORTS[si].k === "short") guides = [...guides].sort((a, b) => parseFloat(String(a.stats.km)) - parseFloat(String(b.stats.km)));
  return (
    <div className="screen screen-pad">
      <div className="results-head">
        <button className="glassbtn sm" onClick={onBack} aria-label="Back"><iconify-icon icon="solar:alt-arrow-left-linear"></iconify-icon></button>
        <div className="rh-title">
          <div className="where">{pm.city || "Anywhere"} <Flag e={pm.flag} size={15} /></div>
          <div className="when">{query.duration || "Flexible"}</div>
        </div>
        <button className="glassbtn sm" onClick={onFilters} aria-label="Filters"><iconify-icon icon="solar:tuning-2-bold"></iconify-icon></button>
      </div>
      <div className="rh-sort">
        <div className="cnt">{guides.length} {guides.length === 1 ? "guide" : "guides"}</div>
        <button className="sort" onClick={() => setSi((si + 1) % SORTS.length)}>{SORTS[si].l} <iconify-icon icon="solar:sort-vertical-bold"></iconify-icon></button>
      </div>
      {guides.map((t) => <GuideCard key={t.id} trip={t} saved={savedTrips.has(t.id)} onOpen={() => onOpenGuide(t.id)} onHeart={() => onHeart(t)} />)}
    </div>
  );
}

// ---- resolve a typed name / address to a real place ----
const AP_KW: [RegExp, string][] = [
  [/museum|gallery|exhibit|muzeum/, "Museum"],
  [/park|garden|ogród|las|botanic/, "Park"],
  [/caf[eé]|coffee|kawa|espresso/, "Cafe"],
  [/\bbar\b|pub|club|night|cocktail/, "Bar"],
  [/market|hala|bazaar|targ|food hall/, "Market"],
  [/restau|bistro|kitchen|trattoria|osteria|grill/, "Restaurant"],
  [/hotel|hostel|\binn\b|stay|resort/, "Hotel"],
  [/view|tower|terrace|panorama|lookout|rooftop/, "Viewpoint"],
  [/castle|palace|cathedral|church|square|gate|monument|zamek/, "Landmark"],
];
export function matchPlace(query: string): { img: string; name: string; cat: string; exact?: boolean } | null {
  const raw = query.trim();
  const q = raw.toLowerCase();
  if (q.length < 2) return null;
  const hit = SPOTS.find((s) => { const n = s.name.toLowerCase(); return n.includes(q) || (q.length > 3 && q.includes(n)); });
  if (hit) return { img: hit.img, name: hit.name, cat: hit.cat, exact: true };
  let cat = "Landmark";
  for (const [re, c] of AP_KW) if (re.test(q)) { cat = c; break; }
  const first = raw.split(",")[0].trim().replace(/\s+/g, " ");
  const name = first.replace(/\b([a-zà-ž])/g, (m) => m.toUpperCase());
  const img = ({ Museum: I.palace, Park: I.park, Cafe: I.guide, Market: I.guide, Restaurant: I.guide, Bar: I.guide, Viewpoint: I.palace, Hotel: I.guide } as Record<string, string>)[cat] || I.city1;
  return { img, name, cat };
}

// ---- ADD PLACE sheet (guide detail) ----
export function AddPlaceSheet({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (name: string) => void }) {
  const [val, setVal] = useState("");
  useEffect(() => { if (open) setVal(""); }, [open]);
  const match = matchPlace(val);
  const cm = match ? catMeta(match.cat) : null;
  return (
    <div className={"modal ap-sheet" + (open ? " open" : "")}>
      <div className="grab-zone"><div className="grabber"></div></div>
      <div className="ap-head">
        <button className="x" onClick={onClose} aria-label="Close"><iconify-icon icon="hugeicons:cancel-01"></iconify-icon></button>
        <div className="t">Add place</div>
      </div>
      <div className="ap-body">
        <div className="q">What you would add?</div>
        <input className="ap-input" value={val} onChange={(e) => setVal(e.target.value)}
          placeholder="Name or paste address…" autoFocus
          onKeyDown={(e) => { if (e.key === "Enter" && match) onAdd(match.name); }} />
        {!val.trim() && (
          <div className="ap-suggest">
            <div className="ap-sug-h">Quick add</div>
            {SPOTS.slice(0, 5).map((s) => (
              <button key={s.id} className="ap-sug-row" onClick={() => onAdd(s.name)}>
                <div className="ap-sug-th" style={{ backgroundImage: `url(${s.img})` }}></div>
                <div className="ap-sug-body"><div className="n">{s.name}</div><div className="t">{catMeta(s.cat).type} · {placeMeta(s.place).city}</div></div>
                <iconify-icon icon="hugeicons:add-01"></iconify-icon>
              </button>
            ))}
          </div>
        )}
        {match && cm && (
          <div className="tl-card ap-result">
            <div className="tl-thumb" style={{ backgroundImage: `url(${match.img})` }}></div>
            <div className="tl-info">
              <div className="tl-type">{cm.type}</div>
              <div className="tl-name">{match.name}</div>
              <span className="tl-badge"><iconify-icon icon={CATS[match.cat]?.icon || "solar:map-point-bold"} style={{ color: CATS[match.cat]?.color }}></iconify-icon>{match.cat}</span>
            </div>
          </div>
        )}
      </div>
      {match && (
        <div className="ap-foot">
          <button className="ap-add" onClick={() => onAdd(match.name)}>
            Add place <iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon>
          </button>
        </div>
      )}
    </div>
  );
}
