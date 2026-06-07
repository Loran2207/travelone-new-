// TRAVEL1 — trip / guide detail: full-screen overlay with a real route
// map (color-coded day polylines + numbered nodes) over a draggable
// timeline sheet. Ported from Map.html's GuideDetailOverlay.
import { Fragment, useEffect, useMemo, useState } from "react";
import { DAY_COLORS, SPOTS, catMeta } from "../data/data";
import { boundsOf, stopLatLng, type LatLng } from "../data/geo";
import type { Day, Spot, Stop, Trip } from "../data/types";
import { G_DETENTS, G_MID, useSheet } from "../lib/sheet";
import type { Shared } from "../lib/shared";
import { BottomNav, type TabId } from "./chrome";
import { TripDetail } from "./Details";
import { ActionSheet, SpotModal, type ActionSheetSpec } from "./Modals";
import { AddPlaceSheet, matchPlace } from "./Screens";
import { RealMap, routeLabelHtml, routeNodeHtml, type MapMarker, type MapRoute } from "./RealMap";

type DaySel = number | "all";

export function GuideDetailOverlay({ trip, shared, onClose, tab, onTab }: {
  trip: Trip; shared: Shared; onClose: () => void; tab: string; onTab: (id: TabId) => void;
}) {
  const [activeDay, setActiveDay] = useState<DaySel>("all");
  const [manage, setManage] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [spot, setSpot] = useState<Spot | Stop | null>(null);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [editMenu, setEditMenu] = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);

  const saved = shared.savedTrips.has(trip.id);
  const inMyTrips = shared.myTrips.has(trip.id);
  const openStop = (st: Stop) => { const s = SPOTS.find((x) => x.id === st.id) || st; setSpot(s); };

  // ---- editable days: append new days + spots locally ----
  const [extraDays, setExtraDays] = useState<number[]>([]);
  const [addedStops, setAddedStops] = useState<Record<number, Stop[]>>({});
  const effDays: Day[] = useMemo(() => {
    const base = trip.days.map((d) => (addedStops[d.n] ? { ...d, stops: [...d.stops, ...addedStops[d.n]] } : d));
    const extra = extraDays.map((nn) => ({ n: nn, km: 0, stops: addedStops[nn] || [] }));
    return [...base, ...extra];
  }, [trip, extraDays, addedStops]);
  const trip2 = useMemo(() => ({ ...trip, days: effDays }), [trip, effDays]);
  const addDay = () => {
    const nn = trip.days.length + extraDays.length + 1;
    setExtraDays((e) => [...e, nn]); setActiveDay(nn); setEditMenu(false);
    shared.showToast("Day " + nn + " added");
  };
  const addPlace = (name: string) => {
    const m = matchPlace(name) || { name, img: SPOTS[0].img, cat: "Landmark" };
    const targetN = typeof activeDay === "number" ? activeDay : (effDays[effDays.length - 1] ? effDays[effDays.length - 1].n : 1);
    const stop: Stop = { id: "add-" + Date.now(), name: m.name, cat: m.cat, img: m.img, note: "", x: 50, y: 50, toNext: null };
    setAddedStops((prev) => ({ ...prev, [targetN]: [...(prev[targetN] || []), stop] }));
    setAddOpen(false);
    shared.showToast("“" + m.name + "” added to Day " + targetN);
  };

  const toggleSelect = (key: string) => setSelected((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const exitManage = () => { setManage(false); setSelected(new Set()); };
  const selCount = selected.size;
  const stopForKey = (key: string) => { const p = key.split(":"); const i = +p.pop()!; const dn = +p.pop()!; const d = trip.days.find((x) => x.n === dn); return d ? d.stops[i] : null; };
  const isDayKey = (k: string) => /:D\d+$/.test(k);
  const allDaysSel = selCount > 0 && [...selected].every(isDayKey);
  const unit = allDaysSel ? "day" : "place";
  const firstKey = selCount ? [...selected][0] : null;
  let firstInfo: { img: string; name: string; cat?: string; eyebrow: string } | null = null;
  if (firstKey) {
    if (isDayKey(firstKey)) { const dn = +firstKey.split(":D")[1]; const d = trip.days.find((x) => x.n === dn); firstInfo = d ? { img: d.stops[0].img, name: "Day " + dn, eyebrow: d.stops.length + " places" } : null; }
    else { const s = stopForKey(firstKey); firstInfo = s ? { img: s.img, name: s.name, cat: s.cat, eyebrow: catMeta(s.cat).type } : null; }
  }
  const doRemove = () => {
    setRemoved((prev) => new Set([...prev, ...selected]));
    shared.showToast(selCount === 1 ? "“" + (firstInfo ? firstInfo.name : "Item") + "” removed" : selCount + " " + unit + "s removed");
    setConfirm(false); exitManage();
  };
  const openMenu = () => setEditMenu(true);
  const menuAction = (act: string) => {
    setEditMenu(false);
    if (act === "addday") addDay();
    else if (act === "addplace") setAddOpen(true);
    else if (act === "sequence") setManage(true);
    else if (act === "delete") setDelConfirm(true);
  };
  const menuDayLabel = activeDay === "all" ? "Day " + trip.days.length : "Day " + activeDay;

  // ---- draggable sheet (drag to enlarge the map) ----
  const sheet = useSheet(G_DETENTS, G_MID);
  useEffect(() => { sheet.setTop(G_MID); /* eslint-disable-next-line */ }, [activeDay]);
  const sheetModalOpen = addOpen || confirm || delConfirm || !!spot;

  // ---- route map (real Leaflet) ----
  const padBottom = Math.max(140, Math.min(560, 874 - sheet.top));
  const { routes, markers, focus } = useMemo(() => {
    const days = activeDay === "all" ? effDays : effDays.filter((d) => d.n === activeDay);
    const routes: MapRoute[] = [];
    const markers: MapMarker[] = [];
    const all: LatLng[] = [];
    days.forEach((d) => {
      const col = DAY_COLORS[(d.n - 1) % DAY_COLORS.length];
      const pts = d.stops.map((s) => stopLatLng(s, trip.place));
      pts.forEach((p) => all.push(p));
      routes.push({ key: "r" + d.n, color: col, positions: pts });
      // day label, nudged north of the first stop
      if (pts.length) {
        markers.push({
          key: "lbl" + d.n, latlng: [pts[0][0] + 0.0016, pts[0][1]],
          html: routeLabelHtml(col, `Day ${d.n} · ${d.km} km`), cls: "t1-route-icon",
        });
      }
      d.stops.forEach((s, i) => {
        markers.push({
          key: d.n + "-" + i, latlng: pts[i],
          html: routeNodeHtml(col, i + 1), cls: "t1-route-icon",
          onClick: () => openStop(s),
        });
      });
    });
    return { routes, markers, focus: { bounds: boundsOf(all), _n: sheet.top } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay, trip.id, effDays]);

  return (
    <div className="guide-overlay" style={{ position: "absolute", inset: 0, zIndex: 36, background: "#fff", overflow: "hidden" }}>
      <RealMap routes={routes} markers={markers} focus={focus} padBottom={padBottom} center={[52.236, 21.009]} zoom={13} />

      <button className="glassbtn" style={{ position: "absolute", left: 20, top: 64, zIndex: 16 }} onClick={onClose} aria-label="Back">
        <iconify-icon icon="solar:alt-arrow-left-linear"></iconify-icon>
      </button>

      {manage ? (
        <div className="td-chrome">
          <button className="glassbtn" onClick={exitManage} aria-label="Undo"><iconify-icon icon="solar:undo-left-bold"></iconify-icon></button>
          <button className="chrome-check" onClick={exitManage} aria-label="Done"><iconify-icon icon="hugeicons:tick-02"></iconify-icon></button>
        </div>
      ) : (
        <div className="td-chrome">
          {!inMyTrips && (
            <button className="glassbtn" onClick={() => shared.toggleSavedTrip(trip)} aria-label="Save" style={{ color: saved ? "var(--t1-red)" : "var(--t1-ink)" }}>
              <iconify-icon icon={saved ? "solar:heart-bold" : "solar:heart-linear"}></iconify-icon>
            </button>
          )}
          {inMyTrips ? (
            <button className={"glassbtn" + (editMenu ? " active" : "")} onClick={() => (editMenu ? setEditMenu(false) : openMenu())} aria-label="Edit">
              <iconify-icon icon="solar:pen-2-bold"></iconify-icon>
            </button>
          ) : (
            <button className="chrome-mytrips" onClick={() => shared.addMyTrip(trip)}>
              <iconify-icon icon="hugeicons:add-01"></iconify-icon> My Trips
            </button>
          )}
        </div>
      )}

      {editMenu && (
        <Fragment>
          <div style={{ position: "absolute", inset: 0, zIndex: 37 }} onClick={() => setEditMenu(false)}></div>
          <div className="edit-menu" style={{ right: 20, top: 112 }}>
            <button className="em-row" onClick={() => menuAction("addday")}><iconify-icon icon="hugeicons:add-01"></iconify-icon> Add day to guide</button>
            <button className="em-row" onClick={() => menuAction("addplace")}><iconify-icon icon="solar:map-point-bold"></iconify-icon> Add place to {menuDayLabel}</button>
            <button className="em-row" onClick={() => menuAction("sequence")}><iconify-icon icon="solar:routing-bold"></iconify-icon> Change sequence</button>
            <button className="em-row danger" onClick={() => menuAction("delete")}><iconify-icon icon="hugeicons:cancel-01"></iconify-icon> Delete guide</button>
          </div>
        </Fragment>
      )}

      <div className={"sheet" + (sheet.dragging ? " dragging" : "")} style={{ top: sheet.top }}>
        <div className="grab-zone" {...sheet.grabProps}>
          <div className="grabber"></div>
        </div>
        <div className="sheet-scroll">
          <TripDetail trip={trip2} activeDay={activeDay} onDay={setActiveDay}
            onDirections={(s) => shared.showToast("Directions to " + s.name)} onOpenStop={openStop}
            manage={manage} onMenu={() => openMenu()} onAddDay={addDay} onAddPlace={() => setAddOpen(true)} editable={inMyTrips} dateLabel={trip.dateLabel}
            selected={selected} onToggleSelect={toggleSelect} removed={removed} />
        </div>
      </div>

      {manage && (
        <div className="td-footer manage">
          <button className="tf-remove" disabled={!selCount} onClick={() => selCount && setConfirm(true)}>Remove ({selCount})</button>
        </div>
      )}

      {!sheetModalOpen && <BottomNav tab={tab === "map" ? "map" : tab} onTab={(id) => onTab && onTab(id)} />}

      {spot && <SpotModal spot={spot as Spot} saved={false} onClose={() => setSpot(null)}
        onSave={() => { setSpot(null); shared.showToast("Saved to My Spots"); }}
        onDirections={() => shared.showToast("Opening directions to " + spot.name)} />}

      {addOpen && <AddPlaceSheet open={addOpen} onClose={() => setAddOpen(false)} onAdd={addPlace} />}

      <ActionSheet sheet={confirm ? {
        title: "Remove " + selCount + " " + unit + (selCount === 1 ? "" : "s") + " from guide",
        preview: firstInfo ? { img: firstInfo.img, name: firstInfo.name, cat: firstInfo.cat, eyebrow: firstInfo.eyebrow } : null,
        actions: [{ label: "Remove", destructive: true, icon: "solar:trash-bin-trash-bold", onClick: doRemove }],
      } as ActionSheetSpec : null} onClose={() => setConfirm(false)} />

      <ActionSheet sheet={delConfirm ? {
        title: "Delete this guide?",
        preview: { img: trip.cover, name: trip.name, eyebrow: trip.stats.places + " places · " + trip.days.length + " days" },
        actions: [{ label: "Delete guide", destructive: true, icon: "solar:trash-bin-trash-bold", onClick: () => { setDelConfirm(false); shared.showToast("Guide deleted"); onClose(); } }],
      } as ActionSheetSpec : null} onClose={() => setDelConfirm(false)} />

      <div className={"scrim" + ((addOpen || confirm || spot || delConfirm) ? " open" : "")}
        onClick={() => { setAddOpen(false); setConfirm(false); setSpot(null); setDelConfirm(false); }}></div>
    </div>
  );
}
