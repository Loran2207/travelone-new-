// TRAVEL1 — overlays: Search, New List, Spot detail, Add-to-list,
// Action sheet, Trip builder, Create/Profile popovers.
import { Fragment, useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { CATS, I, IMG, LISTS, SPOTS, TRIPS, catMeta, galleryOf, placeMeta, placesOf, prefEmoji, spotContact, spotsOf } from "../data/data";
import type { ListDef, Spot, Trip } from "../data/types";
import { Emoji, Flag } from "./chrome";
import { ListThumb, SpotRow, TripRow } from "./Sheets";

// ---- iOS keyboard ----
const KB_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];
export function Keyboard({ onKey, onBack, onSpace, onGo, suggest }: {
  onKey: (k: string) => void; onBack: () => void; onSpace: () => void; onGo: () => void; suggest?: string[];
}) {
  return (
    <div className="kb">
      <div className="kb-suggest">{(suggest || ["Warsaw", "Kraków", "Museum"]).map((s, i) => <div key={i} className="sg">{s}</div>)}</div>
      <div className="kb-row">{KB_ROWS[0].map((k) => <button key={k} className="key" onClick={() => onKey(k)}>{k}</button>)}</div>
      <div className="kb-row" style={{ padding: "0 16px" }}>{KB_ROWS[1].map((k) => <button key={k} className="key" onClick={() => onKey(k)}>{k}</button>)}</div>
      <div className="kb-row">
        <button className="key fn wide"><iconify-icon icon="solar:alt-arrow-up-linear"></iconify-icon></button>
        {KB_ROWS[2].map((k) => <button key={k} className="key" onClick={() => onKey(k)}>{k}</button>)}
        <button className="key fn wide" onClick={onBack}><iconify-icon icon="hugeicons:remove-square"></iconify-icon></button>
      </div>
      <div className="kb-row">
        <button className="key fn" style={{ flex: "0 0 58px", fontSize: 14 }}>123</button>
        <button className="key fn" style={{ flex: "0 0 40px" }}><iconify-icon icon="hugeicons:smile"></iconify-icon></button>
        <button className="key space" onClick={onSpace}>space</button>
        <button className="key go" onClick={onGo}>search</button>
      </div>
      <div className="kb-bottom"><iconify-icon icon="solar:global-bold"></iconify-icon><iconify-icon icon="hugeicons:mic-01"></iconify-icon></div>
    </div>
  );
}

// ---- SEARCH modal ----
export function SearchModal({ open, onClose, onOpenList, onOpenMySpots, onOpenSpot, onOpenTrip, allTrips = TRIPS }: {
  open: boolean; onClose: () => void; onOpenList: (id: string) => void; onOpenMySpots: () => void;
  onOpenSpot: (id: string) => void; onOpenTrip: (id: string) => void; allTrips?: Trip[];
}) {
  const [q, setQ] = useState("");
  useEffect(() => { if (open) setQ(""); }, [open]);
  const ql = q.trim().toLowerCase();
  const lists = LISTS.map((l) => ({ ...l, count: spotsOf(l.id).length })).filter((l) => !ql || l.name.toLowerCase().includes(ql));
  const spots = SPOTS.filter((s) => ql && (s.name.toLowerCase().includes(ql) || s.cat.toLowerCase().includes(ql) || s.place.toLowerCase().includes(ql)));
  const trips = allTrips.filter((t) => ql && (t.name.toLowerCase().includes(ql) || (t.subtitle || "").toLowerCase().includes(ql) || placeMeta(t.place).city.toLowerCase().includes(ql) || t.cats.some((c) => c.toLowerCase().includes(ql))));

  return (
    <div className={"modal" + (open ? " open" : "")} style={{ top: 52, bottom: 0 }}>
      <div className="grab-zone"><div className="grabber"></div></div>
      <div className="search-top">
        <div className="search-field">
          <iconify-icon icon="solar:magnifer-linear"></iconify-icon>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search spots, lists & trips" autoFocus />
        </div>
        <button className="search-x" onClick={onClose}><iconify-icon icon="hugeicons:cancel-01"></iconify-icon></button>
      </div>
      <div className="search-results">
        {!ql && (
          <Fragment>
            <div className="search-eyebrow">Your collections</div>
            <div className="rail" style={{ flexWrap: "nowrap", paddingTop: 4 }}>
              {lists.map((l) => (
                <div key={l.id} style={{ flex: "none", width: 140, cursor: "pointer" }} onClick={() => (l.special ? onOpenMySpots() : onOpenList(l.id))}>
                  <div style={{ width: 140, height: 140, borderRadius: 16, overflow: "hidden", boxShadow: "var(--t1-shadow-card)", position: "relative" }}>
                    {l.special
                      ? <div style={{ width: "100%", height: "100%", background: "linear-gradient(150deg,#FF7A3D 0%,#FE4A00 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}><iconify-icon icon="solar:map-point-bold" style={{ fontSize: 46, color: "#fff" }}></iconify-icon></div>
                      : (!l.cover && l.icon)
                        ? <div style={{ width: "100%", height: "100%", background: l.color || "#FE4A00", display: "flex", alignItems: "center", justifyContent: "center" }}><iconify-icon icon={l.icon} style={{ color: "#fff", fontSize: 40 }}></iconify-icon></div>
                        : <div style={{ width: "100%", height: "100%", backgroundImage: `url(${l.cover})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>}
                    <div style={{ position: "absolute", left: 9, bottom: 9, right: 9 }}>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, textShadow: "0 2px 8px rgba(0,0,0,.5)" }}>{l.name}</div>
                      <span style={{ display: "inline-flex", marginTop: 3, padding: "2px 9px", borderRadius: 999, background: "rgba(255,255,255,.22)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,.35)", color: "#fff", fontWeight: 600, fontSize: 11 }}>{l.count} spots</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="search-eyebrow">Try searching</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 18px" }}>
              {["Royal Castle", "Museum", "Café", "Kraków", "Park"].map((t) => (
                <button key={t} className="fchip" onClick={() => setQ(t)} style={{ background: "var(--t1-fill)" }}>{t}</button>
              ))}
            </div>
          </Fragment>
        )}
        {ql && trips.length > 0 && <Fragment><div className="search-eyebrow">Trips</div>{trips.map((t) => <TripRow key={t.id} trip={t} onClick={() => onOpenTrip(t.id)} />)}</Fragment>}
        {ql && lists.length > 0 && <Fragment><div className="search-eyebrow">Lists</div>{lists.map((l) => (
          <div key={l.id} className="atl-row" onClick={() => (l.special ? onOpenMySpots() : onOpenList(l.id))}>
            <ListThumb list={l} cls="atl-thumb" />
            <div className="atl-body"><div className="atl-name">{l.name}</div><div className="atl-cnt">{l.count} spots</div></div>
            <iconify-icon icon="solar:alt-arrow-right-linear" style={{ fontSize: 19, color: "var(--t1-fg-faint)" }}></iconify-icon>
          </div>
        ))}</Fragment>}
        {ql && spots.length > 0 && <Fragment><div className="search-eyebrow">Spots</div>{spots.map((s) => <SpotRow key={s.id} spot={s} onClick={() => onOpenSpot(s.id)} />)}</Fragment>}
        {ql && trips.length === 0 && lists.length === 0 && spots.length === 0 && (
          <div className="empty-hint" style={{ paddingTop: 30 }}>No matches for "{q}".</div>
        )}
      </div>
    </div>
  );
}

// ---- NEW LIST modal ----
const NL_ICONS = [
  "solar:bookmark-bold", "solar:map-point-bold", "hugeicons:heart-add", "solar:star-bold",
  "hugeicons:restaurant-02", "hugeicons:coffee-02", "hugeicons:tree-06", "hugeicons:beach-02",
  "solar:camera-bold", "hugeicons:building-06", "hugeicons:shopping-bag-02", "hugeicons:airplane-01",
];
const NL_COLORS = ["#FE4A00", "#2563EB", "#E8590C", "#7C3AED", "#2F9E44", "#0E7490", "#BE185D", "#111111"];

export function NewListModal({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void;
  onCreate: (data: { name: string; cover?: string; icon?: string; color?: string }) => void;
}) {
  const presets = [I.castle, I.park, I.palace, I.air];
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"photo" | "icon">("photo");
  const [photo, setPhoto] = useState(presets[0]);
  const [icon, setIcon] = useState(NL_ICONS[0]);
  const [color, setColor] = useState(NL_COLORS[0]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setName(""); setMode("photo"); setPhoto(presets[0]); setIcon(NL_ICONS[0]); setColor(NL_COLORS[0]); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) { setPhoto(URL.createObjectURL(f)); setMode("photo"); }
  };
  const ready = name.trim().length > 0;
  const submit = () => {
    if (!ready) return;
    if (mode === "photo") onCreate({ name: name.trim(), cover: photo });
    else onCreate({ name: name.trim(), icon, color });
  };

  return (
    <div className={"modal" + (open ? " open" : "")} style={{ minHeight: 580 }}>
      <div className="grab-zone"><div className="grabber"></div></div>
      <div className="nl-head">
        <div className="t">New list</div>
        <button className="x" onClick={onClose}><iconify-icon icon="hugeicons:cancel-01"></iconify-icon></button>
      </div>
      <div className="nl-body">
        <div className="nl-photo" style={mode === "photo"
          ? { backgroundImage: `url(${photo})`, borderStyle: "solid", borderColor: "transparent" }
          : { background: color, borderStyle: "solid", borderColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {mode === "icon" && <iconify-icon icon={icon} style={{ fontSize: 54, color: "#fff" }}></iconify-icon>}
        </div>

        <div className="nl-seg">
          <button className={mode === "photo" ? "on" : ""} onClick={() => setMode("photo")}>
            <iconify-icon icon="hugeicons:image-02"></iconify-icon> Photo
          </button>
          <button className={mode === "icon" ? "on" : ""} onClick={() => setMode("icon")}>
            <iconify-icon icon="solar:widget-bold"></iconify-icon> Icon
          </button>
        </div>

        {mode === "photo" ? (
          <div className="nl-covers">
            <button className="cv up" onClick={() => fileRef.current && fileRef.current.click()} aria-label="Upload photo">
              <iconify-icon icon="hugeicons:add-01"></iconify-icon>
            </button>
            {presets.map((c, i) => (
              <div key={i} className={"cv" + (photo === c ? " on" : "")} style={{ backgroundImage: `url(${c})` }} onClick={() => setPhoto(c)}></div>
            ))}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          </div>
        ) : (
          <Fragment>
            <div className="nl-iconrow">
              {NL_ICONS.map((ic) => (
                <button key={ic} className={"nl-ic" + (icon === ic ? " on" : "")}
                  style={icon === ic ? { borderColor: color, color } : undefined} onClick={() => setIcon(ic)}>
                  <iconify-icon icon={ic}></iconify-icon>
                </button>
              ))}
            </div>
            <div className="nl-colors">
              {NL_COLORS.map((cl) => (
                <button key={cl} className={"nl-col" + (color === cl ? " on" : "")}
                  style={{ background: cl }} onClick={() => setColor(cl)} aria-label="Pick colour"></button>
              ))}
            </div>
          </Fragment>
        )}

        <input className="nl-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name your list" />
      </div>
      <div style={{ flex: 1 }}></div>
      <button className={"nl-create" + (ready ? " ready" : "")} onClick={submit}>
        <iconify-icon icon="hugeicons:add-01"></iconify-icon> Create list
      </button>
    </div>
  );
}

// ---- SPOT DETAIL modal (rich, Figma-style) ----
export function SpotModal({ spot, saved, onClose, onSave, onDirections }: {
  spot: Spot | null; saved: boolean; onClose: () => void; onSave: () => void; onDirections: () => void;
}) {
  if (!spot) return null;
  const c = spotContact(spot);
  const gallery = galleryOf(spot);
  const copy = (text: string) => { try { navigator.clipboard && navigator.clipboard.writeText(text); } catch { /* ignore */ } };
  return (
    <div className="modal open sd-modal">
      <div className="grab-zone"><div className="grabber"></div></div>
      <div className="sd-top">
        <button className="sd-x" onClick={onClose} aria-label="Close"><iconify-icon icon="hugeicons:cancel-01"></iconify-icon></button>
        <div className="sd-eyebrow">{catMeta(spot.cat).type} <span className="dot">·</span> <iconify-icon icon="solar:star-bold"></iconify-icon> {spot.rating}</div>
        <div className="sd-name">{spot.name}</div>
        <span className="sd-cat"><Emoji e={prefEmoji(spot.cat)} size={15} />{spot.cat}</span>
      </div>
      <div className="sd-scroll">
        <div className="sd-gallery">
          {gallery.map((g, i) => <div key={i} className="sd-photo" style={{ backgroundImage: `url(${g})` }}></div>)}
        </div>
        <div className="sd-sec-h">About place</div>
        <div className="sd-desc">{spot.desc}</div>
        <div className="sd-info">
          <button className="sd-irow" onClick={onDirections}>
            <span className="ic"><iconify-icon icon="solar:clock-circle-bold"></iconify-icon></span>
            <span className="lbl">{spot.hours}</span>
            <iconify-icon icon="solar:alt-arrow-right-linear" className="chev"></iconify-icon>
          </button>
          <div className="sd-irow">
            <span className="ic"><iconify-icon icon="solar:map-point-bold"></iconify-icon></span>
            <span className="lbl two"><span className="t">Location</span><span className="v">{c.address}</span></span>
            <button className="copy" onClick={() => copy(c.address)} aria-label="Copy address"><iconify-icon icon="solar:copy-bold"></iconify-icon></button>
          </div>
          <a className="sd-irow" href={`https://${c.website}`} target="_blank" rel="noreferrer">
            <span className="ic"><iconify-icon icon="solar:global-bold"></iconify-icon></span>
            <span className="lbl two"><span className="t">Website</span><span className="v">{c.website}</span></span>
            <iconify-icon icon="solar:alt-arrow-right-linear" className="chev"></iconify-icon>
          </a>
          <a className="sd-irow" href={`tel:${c.phone.replace(/\s/g, "")}`}>
            <span className="ic"><iconify-icon icon="solar:phone-bold"></iconify-icon></span>
            <span className="lbl two"><span className="t">Phone</span><span className="v">{c.phone}</span></span>
            <iconify-icon icon="solar:alt-arrow-right-linear" className="chev"></iconify-icon>
          </a>
        </div>
      </div>
      <div className="sd-foot">
        <button className="sd-dir" onClick={onDirections}><iconify-icon icon="solar:compass-bold"></iconify-icon> Direction</button>
        <button className={"sd-save" + (saved ? " on" : "")} onClick={onSave}>
          <iconify-icon icon={saved ? "solar:bookmark-bold" : "solar:bookmark-bold"}></iconify-icon>
          {saved ? "Saved · Edit" : "Add to list"}
        </button>
      </div>
    </div>
  );
}

// ---- ADD-TO-LIST sheet ----
export function AddToListSheet({ open, spot, selected, onToggle, onNewList, onClose }: {
  open: boolean; spot: Spot | null; selected: Set<string>; onToggle: (lid: string) => void; onNewList: () => void; onClose: () => void;
}) {
  if (!spot) return null;
  const cards = LISTS.filter((l) => !l.special).map((l) => ({ ...l, count: spotsOf(l.id).length }));
  return (
    <div className={"modal" + (open ? " open" : "")}>
      <div className="grab-zone"><div className="grabber"></div></div>
      <div className="atl-head">
        <div className="t">Add to list<span className="s">{spot.name}</span></div>
        <button className="x" onClick={onClose}><iconify-icon icon="hugeicons:cancel-01"></iconify-icon></button>
      </div>
      <div className="atl-list">
        {cards.map((l) => {
          const on = selected.has(l.id);
          return (
            <div key={l.id} className="atl-row" onClick={() => onToggle(l.id)}>
              <ListThumb list={l} cls="atl-thumb" />
              <div className="atl-body"><div className="atl-name">{l.name}</div><div className="atl-cnt">{l.count} spots{l.collab ? " · shared" : ""}</div></div>
              <div className={"atl-tick" + (on ? " on" : "")}><iconify-icon icon="hugeicons:tick-02"></iconify-icon></div>
            </div>
          );
        })}
        <div className="atl-new" onClick={onNewList}>
          <div className="ic"><iconify-icon icon="hugeicons:add-01"></iconify-icon></div>
          <div className="lbl">New list</div>
        </div>
      </div>
      <button className="atl-done" onClick={onClose}><iconify-icon icon="hugeicons:tick-02"></iconify-icon> Done</button>
    </div>
  );
}

// ---- ACTION SHEET (iOS) ----
export interface ActionSheetSpec {
  title?: string;
  preview?: { img: string; name: string; cat?: string; eyebrow?: string } | null;
  actions: { label: string; icon?: string; destructive?: boolean; onClick?: () => void }[];
}
export function ActionSheet({ sheet, onClose }: { sheet: ActionSheetSpec | null; onClose: () => void }) {
  if (!sheet) return null;
  const { title, preview, actions } = sheet;
  return (
    <div className={"actionsheet open"}>
      <div className="as-card">
        {title && <div className="as-title">{title}</div>}
        {preview && (
          <div className="as-preview">
            <div className="th" style={{ backgroundImage: `url(${preview.img})` }}></div>
            <div style={{ minWidth: 0 }}>
              {preview.eyebrow && <div className="eyebrow">{preview.eyebrow}</div>}
              <div className="nm">{preview.name}</div>
              {preview.cat && (
                <span className="cat-badge" style={{ background: CATS[preview.cat] ? CATS[preview.cat].soft : "var(--t1-fill)", color: CATS[preview.cat] ? CATS[preview.cat].color : "var(--t1-ink)" }}>
                  <iconify-icon icon={CATS[preview.cat] ? CATS[preview.cat].icon : "solar:map-point-bold"}></iconify-icon>{preview.cat}
                </span>
              )}
            </div>
          </div>
        )}
        {actions.map((a, i) => (
          <button key={i} className={"as-btn" + (a.destructive ? " destructive" : "")} onClick={() => { a.onClick && a.onClick(); onClose(); }}>
            {a.icon && <iconify-icon icon={a.icon}></iconify-icon>}{a.label}
          </button>
        ))}
      </div>
      <button className="as-cancel" onClick={onClose}>Cancel</button>
    </div>
  );
}

// ---- TRIP BUILDER ----
// ---- TRIP BUILDER (plan a trip from a list) ----
export function TripBuilder({ open, list, onClose, onGenerate }: {
  open: boolean; list: ListDef | null; onClose: () => void;
  onGenerate: (opts: { list: ListDef; days: number; mode: string; assign?: Record<string, number>; dateLabel?: string }) => void;
}) {
  const spots = list ? spotsOf(list.id) : [];
  const [mode, setMode] = useState("flex");
  const [days, setDays] = useState(3);
  const [plan, setPlan] = useState<"auto" | "manual">("auto");
  const [assign, setAssign] = useState<Record<string, number>>({});
  const [start, setStart] = useState("");
  useEffect(() => {
    if (open && list) {
      setMode("flex"); setPlan("auto"); setStart("");
      setDays(Math.min(3, Math.max(1, Math.ceil(spotsOf(list.id).length / 3))));
    }
  }, [open, list]);
  // default round-robin assignment whenever days / list change
  useEffect(() => {
    if (!list) return;
    const a: Record<string, number> = {};
    spotsOf(list.id).forEach((s, i) => { a[s.id] = (i % days) + 1; });
    setAssign(a);
  }, [days, list, open]);
  if (!list) return null;
  const city = placeMeta(placesOf(list.id)[0] || "Warsaw");
  const setSpotDay = (id: string, d: number) => setAssign((p) => ({ ...p, [id]: d }));

  const dateLabel = (() => {
    if (mode !== "exact" || !start) return undefined;
    const s = new Date(start + "T00:00:00");
    if (isNaN(s.getTime())) return undefined;
    const e = new Date(s); e.setDate(e.getDate() + Math.max(0, days - 1));
    const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return s.getMonth() === e.getMonth()
      ? `${M[s.getMonth()]} ${s.getDate()} – ${e.getDate()}`
      : `${M[s.getMonth()]} ${s.getDate()} – ${M[e.getMonth()]} ${e.getDate()}`;
  })();

  return (
    <div className={"modal" + (open ? " open" : "")} style={{ top: 60, height: "calc(100% - 60px)" }}>
      <div className="tb-head">
        <button className="x" onClick={onClose}><iconify-icon icon="hugeicons:cancel-01"></iconify-icon></button>
        <div className="t">Plan a trip</div>
        <div className="spacer"></div>
      </div>
      <div className="tb-scroll">
        <div className="tb-summary">
          <div className="l">From</div>
          <div className="r"><iconify-icon icon="solar:bookmark-bold" style={{ color: "var(--t1-orange)" }}></iconify-icon>{list.name} · {spots.length} spots</div>
        </div>
        <div className="tb-summary">
          <div className="l">Where</div>
          <div className="r"><Flag e={city.flag} size={14} /> {city.city}</div>
        </div>

        <div className="tb-sec">
          <div className="h">How long?</div>
          <div className="seg">
            <button className={mode === "flex" ? "on" : ""} onClick={() => setMode("flex")}>Flexible</button>
            <button className={mode === "exact" ? "on" : ""} onClick={() => setMode("exact")}>Exact dates</button>
          </div>
          {mode === "exact" && (
            <label className="tb-date">
              <span>Start date{dateLabel ? " · " + dateLabel : ""}</span>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
          )}
          <div className="daypick">
            {[1, 2, 3, 4, 5].map((d) => (
              <button key={d} className={days === d ? "on" : ""} onClick={() => setDays(d)}>
                <span className="n">{d}</span><span className="u">{d === 1 ? "day" : "days"}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="tb-sec" style={{ paddingTop: 0 }}>
          <div className="h">Plan the days</div>
          <div className="seg">
            <button className={plan === "auto" ? "on" : ""} onClick={() => setPlan("auto")}>Auto-plan</button>
            <button className={plan === "manual" ? "on" : ""} onClick={() => setPlan("manual")}>Arrange myself</button>
          </div>
          {plan === "auto" ? (
            <div className="sub" style={{ marginTop: 12 }}>We'll spread your {spots.length} spots evenly across {days} {days === 1 ? "day" : "days"}.</div>
          ) : (
            <div className="tb-assign">
              {spots.map((s) => (
                <div key={s.id} className="tb-arow">
                  <div className="tb-athumb" style={{ backgroundImage: `url(${s.img})` }}></div>
                  <div className="tb-aname">{s.name}</div>
                  <div className="tb-adays">
                    {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                      <button key={d} className={"tb-dchip" + (assign[s.id] === d ? " on" : "")} onClick={() => setSpotDay(s.id, d)}>{d}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ height: 16 }}></div>
      </div>
      <div className="tb-foot">
        <button className="clear" onClick={() => { setDays(2); setPlan("auto"); }}>Reset</button>
        <button className="go" onClick={() => onGenerate({ list, days, mode, assign: plan === "manual" ? assign : undefined, dateLabel })}>
          <iconify-icon icon="solar:magic-stick-3-bold"></iconify-icon> Create trip
        </button>
      </div>
    </div>
  );
}

// ---- PROFILE popover (avatar) ----
export function ProfilePopover({ style, onItem }: { style?: CSSProperties; onItem: (m: string) => void }) {
  return (
    <div className="popover tl" style={style}>
      <div className="pf-head">
        <div className="av" style={{ backgroundImage: `url(${IMG}avatar.png)` }}></div>
        <div><div className="nm">Alex Nowak</div><div className="em">alex@travel1.app</div></div>
      </div>
      <button onClick={() => onItem("Profile & stats")}><iconify-icon icon="solar:user-circle-bold"></iconify-icon> Profile & stats</button>
      <button onClick={() => onItem("Saved offline")}><iconify-icon icon="solar:download-minimalistic-bold"></iconify-icon> Offline maps</button>
      <button onClick={() => onItem("Settings")}><iconify-icon icon="solar:settings-bold"></iconify-icon> Settings</button>
    </div>
  );
}
