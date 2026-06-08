// TRAVEL1 — overlays: Search, New List, Spot detail, Add-to-list,
// Action sheet, Trip builder, Create/Profile popovers.
import { Fragment, useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { CATS, DURATIONS, I, IMG, LISTS, SPOTS, TRIPS, catMeta, galleryOf, placeMeta, prefEmoji, spotContact, spotsOf, tint } from "../data/data";
import type { ListDef, Spot, Trip } from "../data/types";
import { Emoji } from "./chrome";
import { ListThumb, SpotRow, TripRow } from "./Sheets";
import { DurationWheel } from "./Wizard";

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
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search places, lists & trips" autoFocus />
        </div>
        <button className="search-x" onClick={onClose}><iconify-icon icon="hugeicons:cancel-01"></iconify-icon></button>
      </div>
      <div className="search-results">
        {!ql && (
          <Fragment>
            <div className="search-eyebrow">Your collections</div>
            <div className="rail sc-rail">
              {lists.map((l) => (
                <div key={l.id} className="sc-card" onClick={() => (l.special ? onOpenMySpots() : onOpenList(l.id))}>
                  <div className="sc-thumb" style={l.cover && !l.special
                    ? { backgroundImage: `url(${l.cover})` }
                    : { background: l.special ? "linear-gradient(150deg,#FFE7DC,#FFD7C4)" : tint(l.color || "#FE4A00", 0.82) }}>
                    {l.special
                      ? <iconify-icon icon="solar:map-point-bold" style={{ fontSize: 40, color: "var(--t1-orange)" }}></iconify-icon>
                      : (!l.cover && (l.emoji || l.icon))
                        ? (l.emoji ? <Emoji e={l.emoji} size={42} /> : <iconify-icon icon={l.icon || "solar:map-point-bold"} style={{ color: l.color || "#FE4A00", fontSize: 40 }}></iconify-icon>)
                        : null}
                  </div>
                  <div className="sc-name">{l.name}</div>
                  <div className="sc-cnt">{l.count} {l.count === 1 ? "place" : "places"}</div>
                </div>
              ))}
            </div>
            <div className="search-eyebrow">Try searching</div>
            <div className="sc-suggest">
              {([["Museum", "🖼️"], ["Café", "☕"], ["Park", "🌳"], ["Castle", "🏰"], ["Market", "🛍️"], ["Warsaw", "🇵🇱"], ["Kraków", "🇵🇱"]] as [string, string][]).map(([t, e]) => (
                <button key={t} className="sc-chip" onClick={() => setQ(t)}><Emoji e={e} size={15} />{t}</button>
              ))}
            </div>
          </Fragment>
        )}
        {ql && trips.length > 0 && <Fragment><div className="search-eyebrow">Trips</div>{trips.map((t) => <TripRow key={t.id} trip={t} onClick={() => onOpenTrip(t.id)} />)}</Fragment>}
        {ql && lists.length > 0 && <Fragment><div className="search-eyebrow">Lists</div>{lists.map((l) => (
          <div key={l.id} className="atl-row" onClick={() => (l.special ? onOpenMySpots() : onOpenList(l.id))}>
            <ListThumb list={l} cls="atl-thumb" />
            <div className="atl-body"><div className="atl-name">{l.name}</div><div className="atl-cnt">{l.count} places</div></div>
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
const NL_EMOJIS = ["📍", "⭐", "🏖️", "🏛️", "🍽️", "☕", "🌳", "🎨", "🛍️", "🌃", "✈️", "🏔️"];
const NL_ICONS = ["solar:map-point-bold", "solar:star-bold", "solar:bookmark-bold", "solar:heart-bold", "solar:cup-hot-bold", "solar:buildings-2-bold", "solar:leaf-bold", "solar:camera-bold", "solar:bag-4-bold", "solar:gallery-bold", "solar:bed-bold", "solar:routing-bold"];
const NL_COLORS = ["#2563EB", "#E07A00", "#16A34A", "#E11D74", "#7C3AED", "#0D9488", "#E11D48", "#9A6B3F", "#57534E"];

export function NewListModal({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void;
  onCreate: (data: { name: string; cover?: string; icon?: string; emoji?: string; color?: string }) => void;
}) {
  const presets = [I.castle, I.park, I.palace, I.air];
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"emoji" | "icon" | "photo">("emoji");
  const [emoji, setEmoji] = useState(NL_EMOJIS[0]);
  const [icon, setIcon] = useState(NL_ICONS[0]);
  const [color, setColor] = useState(NL_COLORS[0]);
  const [photo, setPhoto] = useState(presets[0]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setName(""); setMode("emoji"); setEmoji(NL_EMOJIS[0]); setIcon(NL_ICONS[0]); setColor(NL_COLORS[0]); setPhoto(presets[0]); }
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
    else if (mode === "icon") onCreate({ name: name.trim(), icon, color });
    else onCreate({ name: name.trim(), emoji, color });
  };
  const previewStyle = mode === "photo"
    ? { backgroundImage: `url(${photo})`, borderStyle: "solid", borderColor: "transparent" }
    : { background: tint(color, 0.82), borderStyle: "solid", borderColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center" };

  return (
    <div className={"modal" + (open ? " open" : "")} style={{ minHeight: 600 }}>
      <div className="grab-zone"><div className="grabber"></div></div>
      <div className="nl-head">
        <div className="t">New list</div>
        <button className="x" onClick={onClose}><iconify-icon icon="hugeicons:cancel-01"></iconify-icon></button>
      </div>
      <div className="nl-body">
        <div className="nl-photo" style={previewStyle}>
          {mode === "emoji" && <Emoji e={emoji} size={56} />}
          {mode === "icon" && <iconify-icon icon={icon} style={{ fontSize: 54, color }}></iconify-icon>}
        </div>

        <div className="nl-seg">
          <button className={mode === "emoji" ? "on" : ""} onClick={() => setMode("emoji")}>Emoji</button>
          <button className={mode === "icon" ? "on" : ""} onClick={() => setMode("icon")}>Icon</button>
          <button className={mode === "photo" ? "on" : ""} onClick={() => setMode("photo")}>Photo</button>
        </div>

        {mode === "photo" ? (
          <div className="nl-covers">
            <button className="cv up" onClick={() => fileRef.current && fileRef.current.click()} aria-label="Upload photo">
              <iconify-icon icon="hugeicons:add-01"></iconify-icon>
            </button>
            {presets.map((c, i) => <div key={i} className={"cv" + (photo === c ? " on" : "")} style={{ backgroundImage: `url(${c})` }} onClick={() => setPhoto(c)}></div>)}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          </div>
        ) : (
          <Fragment>
            <div className="nl-glyphs">
              {(mode === "emoji" ? NL_EMOJIS : NL_ICONS).map((g) => {
                const on = mode === "emoji" ? emoji === g : icon === g;
                return (
                  <button key={g} className={"nl-glyph" + (on ? " on" : "")} style={on ? { borderColor: color, background: tint(color, 0.86) } : undefined}
                    onClick={() => (mode === "emoji" ? setEmoji(g) : setIcon(g))}>
                    {mode === "emoji" ? <Emoji e={g} size={22} /> : <iconify-icon icon={g} style={{ color }}></iconify-icon>}
                  </button>
                );
              })}
            </div>
            <div className="nl-colors">
              {NL_COLORS.map((cl) => (
                <button key={cl} className={"nl-col" + (color === cl ? " on" : "")} style={{ background: tint(cl, 0.74) }} onClick={() => setColor(cl)} aria-label="Pick colour"></button>
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
          <iconify-icon icon={saved ? "solar:heart-bold" : "solar:heart-linear"}></iconify-icon>
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
        <div className="atl-spot">
          <div className="atl-spot-thumb" style={{ backgroundImage: `url(${spot.img})` }}></div>
          <div className="atl-spot-txt">
            <div className="t">Add to list</div>
            <div className="s">{spot.name}</div>
          </div>
        </div>
        <button className="x" onClick={onClose}><iconify-icon icon="hugeicons:cancel-01"></iconify-icon></button>
      </div>
      <div className="atl-list">
        {cards.map((l) => {
          const on = selected.has(l.id);
          return (
            <div key={l.id} className="atl-row" onClick={() => onToggle(l.id)}>
              <ListThumb list={l} cls="atl-thumb" />
              <div className="atl-body"><div className="atl-name">{l.name}</div><div className="atl-cnt">{l.count} {l.count === 1 ? "place" : "places"}{l.collab ? " · shared" : ""}</div></div>
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
  preview?: { img: string; name: string; cat?: string; eyebrow?: string; emoji?: string; icon?: string; color?: string } | null;
  actions: { label: string; icon?: string; destructive?: boolean; onClick?: () => void }[];
}
export function ActionSheet({ sheet, onClose }: { sheet: ActionSheetSpec | null; onClose: () => void }) {
  if (!sheet) return null;
  const { title, preview, actions } = sheet;
  return (
    <div className={"actionsheet open"}>
      <div className="as-card">
        {title && !preview && <div className="as-title">{title}</div>}
        {preview && (
          <div className="as-preview">
            {preview.img
              ? <div className="th" style={{ backgroundImage: `url(${preview.img})` }}></div>
              : <div className="th th-glyph" style={{ background: tint(preview.color || "#FE4A00", 0.82) }}>
                  {preview.emoji
                    ? <Emoji e={preview.emoji} size={26} />
                    : <iconify-icon icon={preview.icon || "solar:bookmark-bold"} style={{ color: preview.color || "#FE4A00", fontSize: 26 }}></iconify-icon>}
                </div>}
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

// ---- TRIP BUILDER (plan a trip — ask how long, then open the trip) ----
export function TripBuilder({ open, list, onClose, onGenerate }: {
  open: boolean; list: ListDef | null; onClose: () => void;
  onGenerate: (opts: { list: ListDef; days: number; mode: string; assign?: Record<string, number>; dateLabel?: string }) => void;
}) {
  const [mode, setMode] = useState<"flex" | "exact">("flex");
  const [durIdx, setDurIdx] = useState(3);
  const [start, setStart] = useState("");

  useEffect(() => {
    if (open) { setMode("flex"); setStart(""); setDurIdx(3); }
  }, [open]);

  if (!list) return null;

  const days = (() => {
    const d = DURATIONS[durIdx] || "3 days";
    if (/half/i.test(d)) return 1;
    const m = d.match(/(\d+)/);
    return m ? Math.max(1, Math.min(7, parseInt(m[1], 10))) : 3;
  })();

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
    <div className={"modal tbs" + (open ? " open" : "")} style={{ minHeight: 560 }}>
      <div className="grab-zone"><div className="grabber"></div></div>
      <div className="tbs-head">
        <button className="x" onClick={onClose}><iconify-icon icon="hugeicons:cancel-01"></iconify-icon></button>
        <div className="t">Plan a trip</div>
        <div className="spacer"></div>
      </div>

      <div className="tbs-body">
        <div className="tbs-from">
          <span className="l">From</span>
          <span className="r"><iconify-icon icon="solar:bookmark-bold" style={{ color: "var(--t1-orange)" }}></iconify-icon>{list.name} · {spotsOf(list.id).length} places</span>
        </div>

        <div className="wiz-seg">
          <button className={mode === "flex" ? "on" : ""} onClick={() => setMode("flex")}>How long</button>
          <button className={mode === "exact" ? "on" : ""} onClick={() => setMode("exact")}>Exact dates</button>
        </div>

        <DurationWheel idx={durIdx} onIdx={setDurIdx} />

        {mode === "exact" && (
          <label className="tbs-date">
            <iconify-icon icon="solar:calendar-bold"></iconify-icon>
            <span>{start && dateLabel ? dateLabel : "Pick a start date"}</span>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
        )}

        <div className="tbs-hint">We'll auto-plan your {spotsOf(list.id).length} places across {days} {days === 1 ? "day" : "days"}.</div>
      </div>

      <div className="tb-foot">
        <button className="go full" onClick={() => onGenerate({ list, days, mode, dateLabel })}>
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
