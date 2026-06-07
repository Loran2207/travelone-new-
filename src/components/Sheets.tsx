// TRAVEL1 — bottom-sheet browse content: All · Lists · Trips · Nearby
import { Fragment } from "react";
import { CATS, LISTS, SPOTS, TRIPS, placeMeta, prefEmoji, spotsOf, tint } from "../data/data";
import type { ListDef, Spot, Trip } from "../data/types";
import { Emoji, Flag } from "./chrome";

export function FilterRow({ tab, onTab, onSearch }: { tab: string; onTab: (id: string) => void; onSearch: () => void }) {
  const T = (id: string, icon: string | null, label: string) => (
    <button className={"fchip" + (tab === id ? " on" : "")} onClick={() => onTab(id)}>
      {icon && <iconify-icon icon={icon}></iconify-icon>}
      {label}
    </button>
  );
  return (
    <div className="filterrow">
      <button className="fchip icon-only" onClick={onSearch} aria-label="Search"><iconify-icon icon="solar:magnifer-linear"></iconify-icon></button>
      {T("all", null, "All")}
      {T("lists", "solar:clipboard-list-bold", "Lists")}
      {T("trips", "solar:suitcase-lines-bold", "Trips")}
      {T("nearby", "solar:map-point-bold", "Nearby")}
    </div>
  );
}

export function ListThumb({ list, cls = "lc-thumb" }: { list: ListDef; cls?: string }) {
  if (list.special) return <div className={cls + " pinbox"}><iconify-icon icon="solar:map-point-bold"></iconify-icon></div>;
  if (!list.cover && list.emoji) return <div className={cls + " glyphthumb"} style={{ background: tint(list.color || "#FE4A00", 0.82) }}><Emoji e={list.emoji} size={22} /></div>;
  if (!list.cover && list.icon) return <div className={cls + " glyphthumb"} style={{ background: tint(list.color || "#FE4A00", 0.82) }}><iconify-icon icon={list.icon} style={{ color: list.color || "#FE4A00" }}></iconify-icon></div>;
  return <div className={cls} style={{ backgroundImage: `url(${list.cover})` }}></div>;
}

// ---- ALL tab : overview (collections rail + near you) ----
export function AllContent({ onOpenList, onOpenMySpots, onOpenSpot, savedSpots, onSaveSpot, trips, savedTrips, onOpenTrip, onSaveTrip }: {
  onOpenList: (id: string) => void; onOpenMySpots: () => void; onOpenSpot: (id: string) => void;
  savedSpots: Set<string>; onSaveSpot: (s: Spot) => void;
  trips: Trip[]; savedTrips: Set<string>; onOpenTrip: (id: string) => void; onSaveTrip: (t: Trip) => void;
}) {
  const cards = LISTS.map((l) => ({ ...l, count: spotsOf(l.id).length }));
  const near = [SPOTS[1], SPOTS[3], SPOTS[5], SPOTS[7]];
  const nearTrips = trips.slice(0, 6);
  return (
    <Fragment>
      <div className="rail" style={{ paddingTop: 2, paddingBottom: 4 }}>
        {cards.map((l) => (
          <div key={l.id} className="listcard" onClick={() => (l.special ? onOpenMySpots() : onOpenList(l.id))}>
            <ListThumb list={l} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="lc-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</div>
              <div className="lc-sub">
                {l.special && <iconify-icon icon="solar:bookmark-bold" style={{ color: "#0A84FF", fontSize: 13 }}></iconify-icon>}
                {l.count} {l.count === 1 ? "spot" : "spots"}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="section-h">
        <div className="h">Near you <iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon></div>
        <div className="r">within 2 km</div>
      </div>
      <div className="rail" style={{ paddingBottom: 10 }}>
        {near.map((s) => <NearTile key={s.id} spot={s} onClick={() => onOpenSpot(s.id)} saved={savedSpots.has(s.id)} onSave={() => onSaveSpot(s)} />)}
      </div>
      {nearTrips.length > 0 && (
        <Fragment>
          <div className="section-h">
            <div className="h">Trips near you <iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon></div>
            <div className="r">ready guides</div>
          </div>
          <div className="rail" style={{ paddingBottom: 12 }}>
            {nearTrips.map((t) => <TripCard key={t.id} trip={t} onOpen={() => onOpenTrip(t.id)} saved={savedTrips.has(t.id)} onSave={() => onSaveTrip(t)} />)}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
}

// ---- LISTS tab : your collections ----
export function ListsContent({ onOpenList, onOpenMySpots, onListMenu }: {
  onOpenList: (id: string) => void; onOpenMySpots: () => void; onListMenu: (id: string) => void;
}) {
  const total = SPOTS.length;
  const cards = LISTS.map((l) => ({ ...l, count: spotsOf(l.id).length }));
  return (
    <Fragment>
      <div className="meta-line">
        <div className="m">{LISTS.length} lists · {total} spots total</div>
        <button className="sort-btn">Recent <iconify-icon icon="solar:alt-arrow-down-linear"></iconify-icon></button>
      </div>
      {cards.map((l) => (
        <div key={l.id} className="lrow" onClick={() => (l.special ? onOpenMySpots() : onOpenList(l.id))}>
          <ListThumb list={l} cls="lr-thumb" />
          <div className="lr-body">
            <div className="lr-name">{l.name}</div>
            <div className={"lr-sub" + (l.special ? " pinned" : "")}>
              {l.special && <iconify-icon icon="solar:bookmark-bold"></iconify-icon>}
              {l.collab && <iconify-icon icon="solar:users-group-rounded-bold"></iconify-icon>}
              {l.count} {l.count === 1 ? "spot" : "spots"}{l.note ? " · " + l.note : ""}
            </div>
          </div>
          {!l.special && (
            <button className="lr-more" onClick={(e) => { e.stopPropagation(); onListMenu(l.id); }} aria-label="List options">
              <iconify-icon icon="solar:menu-dots-bold"></iconify-icon>
            </button>
          )}
        </div>
      ))}
    </Fragment>
  );
}

// ---- TRIPS tab : your itineraries ----
export function TripsContent({ savedTrips, onOpenTrip, onFindTrips, onOpenList }: {
  savedTrips: Set<string>; onOpenTrip: (id: string) => void; onFindTrips: () => void; onOpenList: (id: string) => void;
}) {
  const mine = TRIPS.filter((t) => savedTrips.has(t.id));
  if (mine.length === 0) {
    return (
      <div style={{ padding: "30px 28px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: 20, background: "var(--t1-fill)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "var(--t1-fg-faint)" }}>
          <iconify-icon icon="solar:routing-bold"></iconify-icon>
        </div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "var(--t1-ink)" }}>No trips yet</div>
        <div style={{ fontWeight: 500, fontSize: 14, color: "var(--t1-fg-muted)", marginTop: 6, lineHeight: "20px" }}>
          Turn one of your lists into a day-by-day route, or save a ready-made guide.
        </div>
        <button className="sd-btn primary" style={{ margin: "18px auto 0", maxWidth: 240 }} onClick={onFindTrips}>
          <iconify-icon icon="hugeicons:compass-01"></iconify-icon> Find a trip
        </button>
      </div>
    );
  }
  return (
    <Fragment>
      <div className="meta-line"><div className="m">{mine.length} {mine.length === 1 ? "trip" : "trips"} planned</div></div>
      {mine.map((t) => <TripRow key={t.id} trip={t} onClick={() => onOpenTrip(t.id)} />)}
      <div className="section-h" style={{ paddingTop: 8 }}><div className="h">Build from a list</div></div>
      <div className="rail">
        {LISTS.filter((l) => !l.special).map((l) => (
          <div key={l.id} className="listcard" onClick={() => onOpenList(l.id)}>
            <ListThumb list={l} />
            <div style={{ minWidth: 0 }}>
              <div className="lc-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</div>
              <div className="lc-sub"><iconify-icon icon="solar:magic-stick-3-bold" style={{ fontSize: 13 }}></iconify-icon> Make a trip</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 8 }}></div>
    </Fragment>
  );
}

// ---- NEARBY tab : discover spots + ready-made guides ----
export function NearbyContent({ sub, onSub, onOpenSpot, onOpenTrip, savedSpots, onSaveSpot, savedTrips, onSaveTrip }: {
  sub: string; onSub: (s: string) => void; onOpenSpot: (id: string) => void; onOpenTrip: (id: string) => void;
  savedSpots: Set<string>; onSaveSpot: (s: Spot) => void; savedTrips: Set<string>; onSaveTrip: (t: Trip) => void;
}) {
  const near = [SPOTS[1], SPOTS[3], SPOTS[5], SPOTS[7]];
  const guides = TRIPS.slice(0, 3);
  return (
    <Fragment>
      <div className="subrow">
        <button className={"subchip bare" + (sub === "all" ? " on" : "")} onClick={() => onSub("all")}>All</button>
        <button className={"subchip" + (sub === "spots" ? " on" : "")} onClick={() => onSub("spots")}>Spots <span className="cnt">{near.length}</span></button>
        <button className={"subchip" + (sub === "guides" ? " on" : "")} onClick={() => onSub("guides")}>Guides <span className="cnt">{guides.length}</span></button>
      </div>

      {sub !== "guides" && (
        <Fragment>
          <div className="section-h" style={{ paddingTop: 2 }}>
            <div className="h">Spots near you</div>
            <div className="r">within 2 km</div>
          </div>
          {near.map((s) => <SpotRow key={s.id} spot={s} dist onClick={() => onOpenSpot(s.id)} saved={savedSpots.has(s.id)} onSave={() => onSaveSpot(s)} />)}
        </Fragment>
      )}

      {sub !== "spots" && (
        <Fragment>
          <div className="section-h" style={{ paddingTop: sub === "guides" ? 2 : 18 }}>
            <div className="h">Ready-made guides</div>
            <div className="r">{guides.length} near you</div>
          </div>
          {guides.map((t) => <TripCard key={t.id} trip={t} saved={savedTrips.has(t.id)} onOpen={() => onOpenTrip(t.id)} onSave={() => onSaveTrip(t)} />)}
        </Fragment>
      )}
    </Fragment>
  );
}

// ---- shared : spot row ----
export function SpotRow({ spot, onClick, dist, saved, onSave }: {
  spot: Spot; onClick: () => void; dist?: boolean; saved?: boolean; onSave?: () => void;
}) {
  const cat = CATS[spot.cat] || {};
  return (
    <div className="spotrow" onClick={onClick}>
      <div className="sr-thumb" style={{ backgroundImage: `url(${spot.img})` }}></div>
      <div className="sr-body">
        <div className="sr-top">
          <span className="sr-name">{spot.name}</span>
          <span className="cat-badge" style={{ background: cat.soft, color: cat.color }}>
            <iconify-icon icon={cat.icon}></iconify-icon>{spot.cat}
          </span>
        </div>
        <div className="sr-desc">{spot.desc}</div>
        <div className="sr-meta">
          <span><iconify-icon icon="solar:star-bold" style={{ color: "#F5A623" }}></iconify-icon>{spot.rating}</span>
          {dist && <span><iconify-icon icon="solar:map-point-bold"></iconify-icon>{spot.dist}</span>}
          <span><Flag e={placeMeta(spot.place).flag} size={13} /> {placeMeta(spot.place).city}</span>
        </div>
      </div>
      {onSave && (
        <button className={"sr-save" + (saved ? " on" : "")} onClick={(e) => { e.stopPropagation(); onSave(); }}>
          <iconify-icon icon={saved ? "solar:bookmark-bold" : "solar:bookmark-linear"}></iconify-icon>
        </button>
      )}
    </div>
  );
}

// ---- near tile (rail) ----
export function NearTile({ spot, onClick, saved, onSave }: {
  spot: Spot; onClick: () => void; saved?: boolean; onSave?: () => void;
}) {
  const cat = CATS[spot.cat];
  return (
    <div className="ntile" onClick={onClick}>
      <div className="img" style={{ backgroundImage: `url(${spot.img})` }}>
        {onSave && (
          <button className={"save" + (saved ? " on" : "")} onClick={(e) => { e.stopPropagation(); onSave(); }}>
            <iconify-icon icon={saved ? "solar:bookmark-bold" : "solar:bookmark-linear"}></iconify-icon>
          </button>
        )}
      </div>
      <div className="nm">{spot.name}</div>
      <div className="nt-cat" style={{ color: cat.color }}><Emoji e={prefEmoji(spot.cat)} size={12} />{spot.cat}</div>
      <div className="mt">{placeMeta(spot.place).city} · {spot.dist}</div>
    </div>
  );
}

// ---- trip / guide card ----
export function TripCard({ trip, onOpen, saved, onSave }: {
  trip: Trip; onOpen: () => void; saved?: boolean; onSave: () => void;
}) {
  const pm = placeMeta(trip.place);
  return (
    <div className="tripcard" onClick={onOpen}>
      <div className="tc-hero" style={{ backgroundImage: `url(${trip.cover})` }}>
        {trip.badge && <span className="tc-new">{trip.badge}</span>}
        <button className={"tc-heart" + (saved ? " on" : "")} onClick={(e) => { e.stopPropagation(); onSave(); }}>
          <iconify-icon icon="solar:heart-bold"></iconify-icon>
        </button>
        <span className="tc-place"><iconify-icon icon="solar:map-point-bold" style={{ fontSize: 14 }}></iconify-icon><Flag e={pm.flag} size={13} /> {pm.city}</span>
        <span className="tc-days"><iconify-icon icon="solar:calendar-bold" style={{ fontSize: 13 }}></iconify-icon>{trip.stats.days} {trip.stats.days === 1 ? "day" : "days"}</span>
      </div>
      <div className="tc-body">
        <div className="tc-title">{trip.name}</div>
        <div className="tc-sub">{trip.subtitle}</div>
        <div className="tc-stats">
          <span><iconify-icon icon="solar:point-on-map-bold"></iconify-icon>{trip.stats.places} places</span>
          <span><iconify-icon icon="solar:walking-bold"></iconify-icon>{trip.stats.steps} steps</span>
          <span><iconify-icon icon="solar:routing-bold"></iconify-icon>{trip.stats.km} km</span>
        </div>
        <div className="tc-cats">
          {trip.cats.map((c) => <span key={c} className="tc-tag">{c}</span>)}
        </div>
      </div>
    </div>
  );
}

// ---- compact trip row ----
export function TripRow({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  return (
    <div className="triprow" onClick={onClick}>
      <div className="tr-cover" style={{ backgroundImage: `url(${trip.cover})` }}>
        <span className="d">{trip.stats.days}d</span>
      </div>
      <div className="tr-body">
        <div className="tr-name">{trip.name}</div>
        <div className="tr-meta">
          <span><iconify-icon icon="solar:point-on-map-bold"></iconify-icon>{trip.stats.places}</span>
          <span><iconify-icon icon="solar:routing-bold"></iconify-icon>{trip.stats.km} km</span>
          <span>{placeMeta(trip.place).city}</span>
        </div>
      </div>
      <div className="tr-go"><iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon></div>
    </div>
  );
}
