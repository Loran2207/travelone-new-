// TRAVEL1 — detail screens: List detail, My Spots, City, Trip timeline
import { Fragment } from "react";
import { CATS, DAY_COLORS, IMG, catMeta, groupByCountry, placeMeta, prefEmoji } from "../data/data";
import type { Day, ListDef, Spot, Stop, Trip } from "../data/types";
import { Emoji, Flag } from "./chrome";
import { SpotRow } from "./Sheets";

type DaySel = number | "all";

// ---- LIST DETAIL ----
export function ListDetail({ list, spots, onOpenSpot, onShare, onCreateTrip,
  manage, onToggleManage, onRemoveSpot, catFilter, onCatFilter, placeFilter, onPlaceFilter, onSearch }: {
  list: ListDef; spots: Spot[]; onOpenSpot: (id: string) => void; onShare: () => void; onEdit?: () => void;
  onCreateTrip: () => void; onAddSpot?: () => void; manage: boolean; onToggleManage: () => void; onRemoveSpot: (s: Spot) => void;
  catFilter: string; onCatFilter: (c: string) => void; placeFilter: string; onPlaceFilter: (p: string) => void; onSearch: () => void;
}) {
  const all = spots;
  const cats = [...new Set(all.map((s) => s.cat))];
  const places = [...new Set(all.map((s) => s.place))];
  let rows = all;
  if (placeFilter !== "all") rows = rows.filter((s) => s.place === placeFilter);
  if (catFilter !== "All") rows = rows.filter((s) => s.cat === catFilter);

  void onCreateTrip;
  return (
    <Fragment>
      <div className="ld-head">
        <div className="ld-cover" style={{ backgroundImage: `url(${list.cover})` }}></div>
        <div className="ld-mid">
          <div className="ld-title">{list.name}</div>
          <div className="ld-collab">
            <div className="ava-star">
              <div className="ava" style={{ backgroundImage: `url(${IMG}${list.collab ? "avatar-fig.png" : "avatar.png"})` }}></div>
              <span className="star"><iconify-icon icon="solar:star-bold"></iconify-icon></span>
            </div>
            <span className="who">{list.collab ? list.note || "Shared list" : "Your list"}</span>
          </div>
        </div>
        <div className="ld-right">
          <button className="ld-share" onClick={onShare} aria-label="Share list"><iconify-icon icon="solar:upload-minimalistic-bold"></iconify-icon></button>
          <div className="ld-spots">{all.length} {all.length === 1 ? "spot" : "spots"}</div>
        </div>
      </div>

      {places.length > 1 && (
        <div className="subrow" style={{ paddingTop: 0 }}>
          {places.map((p) => (
            <button key={p} className={"subchip" + (placeFilter === p ? " on" : "")} onClick={() => onPlaceFilter(placeFilter === p ? "all" : p)}>
              {placeMeta(p).city} <span className="cnt">{all.filter((s) => s.place === p).length}</span>
            </button>
          ))}
        </div>
      )}

      <div className="filterrow" style={{ paddingTop: 2, paddingBottom: 8 }}>
        <button className="fchip icon-only" onClick={onSearch}><iconify-icon icon="solar:magnifer-linear"></iconify-icon></button>
        <button className={"fchip" + (catFilter === "All" ? " on" : "")} onClick={() => onCatFilter("All")}>All</button>
        {cats.map((c) => (
          <button key={c} className={"fchip" + (catFilter === c ? " on" : "")} onClick={() => onCatFilter(c)}>
            <iconify-icon icon={CATS[c].icon}></iconify-icon>{c}
            <span className="cnt">{all.filter((s) => s.cat === c).length}</span>
          </button>
        ))}
      </div>

      <div className="meta-line" style={{ paddingTop: 0 }}>
        <div className="m">{rows.length} {rows.length === 1 ? "spot" : "spots"}{placeFilter !== "all" || catFilter !== "All" ? " · filtered" : ""}</div>
        <button className="sort-btn" onClick={onToggleManage} style={manage ? { background: "var(--t1-ink)", color: "#fff" } : {}}>
          {manage ? "Done" : <Fragment><iconify-icon icon="solar:pen-2-bold"></iconify-icon> Manage</Fragment>}
        </button>
      </div>

      {rows.map((s) => (
        <div key={s.id} className="spotrow" onClick={() => !manage && onOpenSpot(s.id)}>
          {manage && <div style={{ alignSelf: "center", color: "var(--t1-fg-faint)", fontSize: 20, flex: "none" }}><iconify-icon icon="hugeicons:drag-drop-vertical"></iconify-icon></div>}
          <div className="sr-thumb" style={{ backgroundImage: `url(${s.img})` }}></div>
          <div className="sr-body">
            <div className="sr-top">
              <span className="sr-name">{s.name}</span>
              <span className="cat-badge" style={{ background: CATS[s.cat].soft, color: CATS[s.cat].color }}>
                <iconify-icon icon={CATS[s.cat].icon}></iconify-icon>{s.cat}
              </span>
            </div>
            {!manage && <div className="sr-desc">{s.desc}</div>}
            <div className="sr-meta">
              <span><iconify-icon icon="solar:star-bold" style={{ color: "#F5A623" }}></iconify-icon>{s.rating}</span>
              <span><iconify-icon icon="solar:map-point-bold"></iconify-icon>{s.dist}</span>
            </div>
          </div>
          {manage && (
            <button className="sr-save" style={{ background: "var(--t1-tint-rose)", color: "var(--t1-red-strong)", alignSelf: "center" }}
              onClick={(e) => { e.stopPropagation(); onRemoveSpot(s); }}>
              <iconify-icon icon="hugeicons:remove-circle"></iconify-icon>
            </button>
          )}
        </div>
      ))}
      {rows.length === 0 && <div className="empty-hint" style={{ paddingTop: 20 }}>No spots match these filters.</div>}
    </Fragment>
  );
}

// ---- MY SPOTS DETAIL ----
export function MySpotsDetail({ spots, countryFilter, onCountryFilter, onSearch, onOpenCity }: {
  spots: Spot[]; countryFilter: string; onCountryFilter: (c: string) => void; onSearch: () => void;
  onOpenCity: (place: string) => void; onOpenSpot?: (id: string) => void;
}) {
  const grouped = groupByCountry(spots);
  const countries = Object.keys(grouped);
  const shown = countryFilter === "all" ? countries : countries.filter((c) => c === countryFilter);
  const totalCities = new Set(spots.map((s) => s.place)).size;

  return (
    <Fragment>
      <div style={{ padding: "2px 18px 2px" }}>
        <div className="ld-title" style={{ fontSize: 27 }}>My Spots</div>
        <div className="m" style={{ marginTop: 5, fontWeight: 500, fontSize: 13.5, color: "var(--t1-fg-muted)" }}>
          {countries.length} {countries.length === 1 ? "country" : "countries"} · {totalCities} {totalCities === 1 ? "city" : "cities"} · {spots.length} spots
        </div>
      </div>

      <div className="filterrow">
        <button className="fchip icon-only" onClick={onSearch} aria-label="Search My Spots"><iconify-icon icon="solar:magnifer-linear"></iconify-icon></button>
        <button className={"fchip" + (countryFilter === "all" ? " on" : "")} onClick={() => onCountryFilter("all")}>All</button>
        {countries.map((c) => (
          <button key={c} className={"fchip" + (countryFilter === c ? " on" : "")} onClick={() => onCountryFilter(countryFilter === c ? "all" : c)}>
            <Flag e={grouped[c].flag} size={14} /> {c}<span className="cnt">{Object.values(grouped[c].cities).reduce((a, ar) => a + ar.length, 0)}</span>
          </button>
        ))}
      </div>

      {shown.map((country) => {
        const cities = grouped[country].cities;
        const cityKeys = Object.keys(cities);
        const cnt = cityKeys.reduce((a, k) => a + cities[k].length, 0);
        return (
          <div key={country}>
            <div className="section-h">
              <div className="h" onClick={() => onCountryFilter(country)}><Flag e={grouped[country].flag} size={15} /> {country} <iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon></div>
              <div className="r">{cityKeys.length} {cityKeys.length === 1 ? "city" : "cities"} · {cnt} spots</div>
            </div>
            <div className="placegrid">
              {cityKeys.map((ck) => {
                const pm = placeMeta(ck);
                const cs = cities[ck];
                return (
                  <div key={ck} className="placecard" style={{ backgroundImage: `url(${pm.cover})` }} onClick={() => onOpenCity(ck)}>
                    <div className="pc-body">
                      <div className="pc-name">{pm.city}</div>
                      <span className="pc-cnt"><iconify-icon icon="solar:map-point-bold" style={{ fontSize: 11, marginRight: 4 }}></iconify-icon>{cs.length} {cs.length === 1 ? "spot" : "spots"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div style={{ height: 24 }}></div>
    </Fragment>
  );
}

// ---- CITY DETAIL ----
export function CityDetail({ place, spots, catFilter, onCatFilter, onSearch, onOpenSpot }: {
  place: string; spots: Spot[]; catFilter: string; onCatFilter: (c: string) => void; onSearch: () => void;
  onOpenSpot: (id: string) => void; onAddSpot?: () => void;
}) {
  const pm = placeMeta(place);
  const cats = [...new Set(spots.map((s) => s.cat))];
  let rows = spots;
  if (catFilter !== "All") rows = rows.filter((s) => s.cat === catFilter);

  return (
    <Fragment>
      <div className="ld-head">
        <div className="ld-cover" style={{ backgroundImage: `url(${pm.cover})` }}></div>
        <div className="ld-mid">
          <div className="ld-title">{pm.city}</div>
          <div className="ld-collab" style={{ marginTop: 8 }}>
            <span className="who" style={{ fontSize: 13.5 }}><Flag e={pm.flag} size={14} /> {pm.country}</span>
          </div>
        </div>
        <div className="ld-right">
          <button className="ld-share" onClick={onSearch} aria-label="Search city"><iconify-icon icon="solar:magnifer-linear"></iconify-icon></button>
          <div className="ld-spots">{spots.length} {spots.length === 1 ? "spot" : "spots"}</div>
        </div>
      </div>

      <div className="filterrow" style={{ paddingTop: 2, paddingBottom: 8 }}>
        <button className={"fchip" + (catFilter === "All" ? " on" : "")} onClick={() => onCatFilter("All")}>All</button>
        {cats.map((c) => (
          <button key={c} className={"fchip" + (catFilter === c ? " on" : "")} onClick={() => onCatFilter(c)}>
            <iconify-icon icon={CATS[c].icon}></iconify-icon>{c}
            <span className="cnt">{spots.filter((s) => s.cat === c).length}</span>
          </button>
        ))}
      </div>

      {cats.length > 1 && catFilter === "All" ? (
        cats.map((c) => (
          <div key={c}>
            <div className="section-h"><div className="h">{c}</div><div className="r">{spots.filter((s) => s.cat === c).length} spots</div></div>
            {spots.filter((s) => s.cat === c).map((s) => <SpotRow key={s.id} spot={s} onClick={() => onOpenSpot(s.id)} />)}
          </div>
        ))
      ) : (
        rows.map((s) => <SpotRow key={s.id} spot={s} onClick={() => onOpenSpot(s.id)} />)
      )}
      <div style={{ height: 90 }}></div>
    </Fragment>
  );
}

// ---- TRIP DETAIL (all-days cards · single-day timeline) ----
export function TripDetail({ trip, activeDay, onDay, onDirections, onOpenStop,
  manage, onMenu, onAddDay, onAddPlace, editable, dateLabel, selected, onToggleSelect, removed }: {
  trip: Trip; activeDay: DaySel; onDay: (d: DaySel) => void; onDirections: (s: Stop) => void; onOpenStop: (s: Stop) => void;
  manage: boolean; onToggleManage?: () => void; onMenu?: (act?: string) => void; onAddDay?: () => void; onAddPlace?: () => void; editable?: boolean; dateLabel?: string;
  selected?: Set<string>; onToggleSelect?: (key: string) => void; removed?: Set<string>;
}) {
  const rmv = removed || new Set<string>();
  const sel = selected || new Set<string>();
  const fmtK = (m: number) => { const s = Math.round(m * 1.31); return s >= 1000 ? (s / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(s); };
  const dayKm = (d: Day) => d.stops.reduce((a, s) => a + (s.toNext || 0), 0);
  const fmtWalk = (m: number) => {
    const min = Math.max(1, Math.round(m / 78));
    const t = min >= 60 ? Math.floor(min / 60) + "h " + (min % 60) + "m" : min + "m";
    const dist = m >= 1000 ? (m / 1000).toFixed(1) + " km" : m + " m";
    return t + " · " + dist;
  };
  const dayKey = (d: Day) => trip.id + ":D" + d.n;
  const stopKey = (dn: number, i: number) => trip.id + ":" + dn + ":" + i;
  const cityName = placeMeta(trip.place).city;
  const toggle = (key: string) => onToggleSelect && onToggleSelect(key);

  return (
    <Fragment>
      <div className="td-head">
        <div className="td-title">{trip.name}{trip.subtitle ? ": " + trip.subtitle : ""}</div>
        <div className="td-date" onClick={() => onMenu && editable && onMenu("date")}>
          {dateLabel || "Apr 23 – 29"}{editable && <iconify-icon icon="solar:pen-2-bold"></iconify-icon>}
        </div>
        <div className="td-statcards">
          <div className="td-sc"><div className="l">Places</div><div className="v"><iconify-icon icon="solar:map-point-bold"></iconify-icon>{trip.stats.places}</div></div>
          <div className="td-sc"><div className="l">Steps</div><div className="v"><iconify-icon icon="solar:walking-bold"></iconify-icon>{trip.stats.steps}</div></div>
          <div className="td-sc"><div className="l">Distance</div><div className="v"><iconify-icon icon="solar:routing-bold"></iconify-icon>{trip.stats.km} km</div></div>
        </div>
      </div>

      <div className="dayrow">
        {editable && (
          <button className="daychip add" onClick={(e) => { e.stopPropagation(); onAddDay && onAddDay(); }} aria-label="Add">
            <iconify-icon icon="hugeicons:add-01"></iconify-icon>
          </button>
        )}
        <button className={"daychip" + (activeDay === "all" ? " on" : "")} onClick={() => onDay("all")}>All</button>
        {trip.days.map((d) => (
          <button key={d.n} className={"daychip" + (activeDay === d.n ? " on" : "")} onClick={() => onDay(d.n)}>Day {d.n}</button>
        ))}
      </div>

      {activeDay === "all" ? (
        <div className="dcards">
          {trip.days.filter((d) => !rmv.has(dayKey(d))).map((d) => {
            const col = DAY_COLORS[(d.n - 1) % DAY_COLORS.length];
            const stops = d.stops;
            const cats: string[] = []; stops.forEach((s) => { if (!cats.includes(s.cat)) cats.push(s.cat); });
            const key = dayKey(d), on = sel.has(key);
            const km = (dayKm(d) / 1000) || d.km;
            return (
              <div key={d.n} className={"dcard" + (on ? " sel" : "")} onClick={() => (manage ? toggle(key) : onDay(d.n))}>
                {manage && <div className="dc-grip"><iconify-icon icon="hugeicons:drag-drop-vertical"></iconify-icon></div>}
                <div className="dcard-main">
                  <div className="dcard-top">
                    <span className="dc-badge" style={{ background: col }}>Day {d.n}</span>
                    <div className="dc-stats">
                      <span className="dc-stat"><iconify-icon icon="solar:map-point-bold"></iconify-icon>{stops.length}</span>
                      <span className="dc-stat"><iconify-icon icon="solar:walking-bold"></iconify-icon>{fmtK(dayKm(d))}</span>
                      <span className="dc-stat"><iconify-icon icon="solar:routing-bold"></iconify-icon>{km.toFixed(1)} km</span>
                    </div>
                  </div>
                  <div className="dcard-thumbs">
                    {stops.slice(0, 3).map((s, i) => <div key={i} className="dcard-thumb" style={{ backgroundImage: `url(${s.img})` }}></div>)}
                    {stops.length > 3 && <div className="dcard-thumb more">+{stops.length - 3}</div>}
                  </div>
                  <div className="dcard-cats">
                    {cats.slice(0, 2).map((c) => <span key={c} className="tl-badge"><Emoji e={prefEmoji(c)} size={14} />{catMeta(c).type}</span>)}
                  </div>
                </div>
                {manage && (
                  <button className={"tl-select dc-pick" + (on ? " on" : "")} onClick={(e) => { e.stopPropagation(); toggle(key); }} aria-label="Select day">
                    <iconify-icon icon="hugeicons:tick-02"></iconify-icon>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        (() => {
          const d = trip.days.find((x) => x.n === activeDay);
          if (!d) return null;
          const stops = d.stops.map((s, i) => ({ s, key: stopKey(d.n, i) })).filter((o) => !rmv.has(o.key));
          return (
            <Fragment>
              <div className="tl-sec">
                <div className="tl-sec-name">{cityName}</div>
                <div className="dc-stats">
                  <span className="dc-stat"><iconify-icon icon="solar:map-point-bold"></iconify-icon>{stops.length}</span>
                  <span className="dc-stat"><iconify-icon icon="solar:walking-bold"></iconify-icon>{fmtK(dayKm(d))}</span>
                  <span className="dc-stat"><iconify-icon icon="solar:routing-bold"></iconify-icon>{((dayKm(d) / 1000) || d.km).toFixed(1)} km</span>
                </div>
              </div>
              <div className="timeline">
                {stops.map((o, idx) => {
                  const s = o.s, key = o.key, on = sel.has(key);
                  const last = idx === stops.length - 1;
                  const cm = catMeta(s.cat);
                  return (
                    <div key={key}>
                      <div className="tl-stop">
                        <div className="tl-rail">
                          <div className="tl-node" style={{ background: manage ? "#fff" : "transparent", color: "var(--t1-fg-muted)", boxShadow: manage ? "inset 0 0 0 2px var(--t1-border)" : "none", fontWeight: 500 }}>{idx + 1}</div>
                          {!last && <div className="tl-line"></div>}
                        </div>
                        <div className={"tl-card" + (on ? " sel" : "")} onClick={() => (manage ? toggle(key) : onOpenStop(s))}>
                          {manage && <div className="tl-grip"><iconify-icon icon="hugeicons:drag-drop-vertical"></iconify-icon></div>}
                          <div className="tl-thumb" style={{ backgroundImage: `url(${s.img})` }}></div>
                          <div className="tl-info">
                            <div className="tl-type">{cm.type}</div>
                            <div className="tl-name">{s.name}</div>
                            <span className="tl-badge"><Emoji e={prefEmoji(s.cat)} size={14} />{s.cat}</span>
                          </div>
                          {manage && (
                            <button className={"tl-select" + (on ? " on" : "")} onClick={(e) => { e.stopPropagation(); toggle(key); }} aria-label="Select">
                              <iconify-icon icon="hugeicons:tick-02"></iconify-icon>
                            </button>
                          )}
                        </div>
                      </div>
                      {!last && (
                        <div className="tl-walk">
                          <button className="walk-pill" onClick={() => onDirections(s)}>
                            <iconify-icon icon="solar:walking-bold"></iconify-icon>{fmtWalk(s.toNext || 600)}
                            <iconify-icon icon="solar:transfer-horizontal-bold" className="chev"></iconify-icon>
                          </button>
                          {!manage && (
                            <button className="tl-nav walk-dir" onClick={() => onDirections(s)} aria-label="Directions">
                              <iconify-icon icon="solar:routing-2-bold"></iconify-icon>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {stops.length === 0 && editable && (
                <button className="day-empty-add" onClick={() => onAddPlace && onAddPlace()}>
                  <iconify-icon icon="hugeicons:add-01"></iconify-icon> Add a place to this day
                </button>
              )}
              {stops.length === 0 && !editable && (
                <div className="empty-hint" style={{ paddingTop: 24 }}>No places yet.</div>
              )}
            </Fragment>
          );
        })()
      )}
      <div style={{ height: 120 }}></div>
    </Fragment>
  );
}
