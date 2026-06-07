// TRAVEL1 — the Map tab: a real Leaflet map + draggable bottom sheet,
// with list / city / spot detail flows layered on top.
import { Fragment, useEffect, useMemo, useState } from "react";
import { I, IMG, LISTS, SPOTS, placeMeta, spotsOf } from "../data/data";
import { CITY_CENTER, boundsOf, spotLatLng, type LatLng } from "../data/geo";
import type { ListDef, Spot } from "../data/types";
import { buildTrip } from "../lib/buildTrip";
import { DETENTS, FULL, MID, useSheet } from "../lib/sheet";
import type { Shared } from "../lib/shared";
import { RealMap, pinHtml, type MapMarker, type MapFocusTarget } from "./RealMap";
import { AllContent, FilterRow, ListsContent, NearbyContent, TripsContent } from "./Sheets";
import { CityDetail, ListDetail, MySpotsDetail } from "./Details";
import {
  ActionSheet, AddToListSheet, NewListModal, SearchModal, SpotModal, TripBuilder,
  type ActionSheetSpec,
} from "./Modals";

type View = "browse" | "list" | "myspots" | "city";

export function MapScreen({ shared }: { shared: Shared }) {
  const { savedTrips, showToast } = shared;

  // ---- navigation (within map) ----
  const [view, setView] = useState<View>("browse");
  const [tab, setTab] = useState("all");
  const [nearbySub, setNearbySub] = useState("all");
  const [listId, setListId] = useState<string | null>(null);

  // ---- overlays ----
  const [modal, setModal] = useState<string | null>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [addSpot, setAddSpot] = useState<Spot | null>(null);
  const [builderList, setBuilderList] = useState<ListDef | null>(null);
  const [actionSheet, setActionSheet] = useState<ActionSheetSpec | null>(null);
  const [generating, setGenerating] = useState(false);
  const [placing, setPlacing] = useState(false);

  // ---- data state ----
  const [savedSpots, setSavedSpots] = useState<Set<string>>(new Set());
  const [membership, setMembership] = useState<Record<string, Set<string>>>(() => {
    const m: Record<string, Set<string>> = {};
    SPOTS.forEach((s) => (m[s.id] = new Set([s.list])));
    return m;
  });
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [manage, setManage] = useState(false);

  // detail filters
  const [catFilter, setCatFilter] = useState("All");
  const [placeFilter, setPlaceFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [cityId, setCityId] = useState<string | null>(null);
  const [recenter, setRecenter] = useState(0);

  // ---- sheet drag ----
  const defaultTop = view === "myspots" ? FULL : MID;
  const sheet = useSheet(DETENTS, defaultTop);
  useEffect(() => { sheet.setTop(defaultTop); /* eslint-disable-next-line */ }, [view, listId, cityId]);
  // entering the Map tab always lands on the map — never a leftover modal
  useEffect(() => { setModal(null); }, []);

  // ---- navigation ----
  const closeOverlays = () => { setModal(null); setSpot(null); setAddSpot(null); setBuilderList(null); };
  const openList = (id: string) => { setCatFilter("All"); setPlaceFilter("all"); setManage(false); setListId(id); setView("list"); closeOverlays(); };
  const openMySpots = () => { setCountryFilter("all"); setView("myspots"); closeOverlays(); };
  const openCity = (place: string) => { setCatFilter("All"); setCityId(place); setView("city"); closeOverlays(); };
  const goBack = () => { setManage(false); setView(view === "city" ? "myspots" : "browse"); };

  // ---- spot saving ----
  const toggleMembership = (lid: string) => {
    if (!addSpot) return;
    const cur = new Set(membership[addSpot.id] || []);
    const list = LISTS.find((l) => l.id === lid);
    if (cur.has(lid)) { cur.delete(lid); showToast("Removed from " + list?.name); }
    else { cur.add(lid); showToast("Added to " + list?.name); }
    setMembership({ ...membership, [addSpot.id]: cur });
    setSavedSpots(new Set(savedSpots).add(addSpot.id));
  };

  // ---- trips ----
  const generate = ({ list, days, prefs }: { list: ListDef; days: number; prefs: string[] }) => {
    setBuilderList(null); setGenerating(true);
    setTimeout(() => {
      const t = buildTrip(list, days, prefs);
      shared.addGenTrip(t); shared.addMyTrip(t);
      setGenerating(false);
      shared.openGuide(t.id);
      showToast("Trip created · " + t.days.length + " days planned");
    }, 1600);
  };

  // ---- list management ----
  const removeSpotFromList = (s: Spot) => { setRemoved(new Set(removed).add(s.id)); showToast("“" + s.name + "” removed from list"); };
  const createList = (data: { name: string; cover?: string; icon?: string; color?: string }) => { LISTS.push({ id: "l" + Date.now(), name: data.name, cover: data.cover, icon: data.icon, color: data.color }); setModal(null); showToast("List “" + data.name + "” created"); };

  // ---- drop a spot ----
  const startPlacing = () => { setPlacing(true); showToast("Tap the map to drop a spot"); };
  const onMapTap = (_latlng: LatLng) => {
    if (!placing) return;
    setPlacing(false);
    const newSpot: Spot = {
      id: "drop-" + Date.now(), name: "Dropped pin", cat: "Landmark", place: "Warsaw", list: "myspots",
      img: I.castle, rating: "—", price: "—", hours: "Add details", dist: "here",
      desc: "A spot you dropped on the map. Add it to a list to keep it.", x: 50, y: 40,
    };
    setSpot(newSpot); showToast("Pin dropped");
  };

  // ---- derived ----
  const list = view === "list" ? LISTS.find((l) => l.id === listId) || null : null;
  const listSpots = list ? spotsOf(list.id).filter((s) => !removed.has(s.id)) : [];
  const mySpotsAll = SPOTS.filter((s) => !removed.has(s.id));
  const citySpots = view === "city" ? mySpotsAll.filter((s) => s.place === cityId) : [];
  const groupedCityPins = [...new Set(mySpotsAll.map((s) => s.place))].map((p) => ({
    place: p,
    sample: mySpotsAll.find((s) => s.place === p)!,
    count: mySpotsAll.filter((s) => s.place === p).length,
  }));
  const isDetail = view !== "browse";
  const anyOverlay = modal !== null || spot !== null || addSpot !== null || builderList !== null;

  const openSpotById = (id: string) => { const s = SPOTS.find((x) => x.id === id); if (s) setSpot(s); };

  // ---- list options action sheet ----
  const listMenu = (id: string) => {
    const l = LISTS.find((x) => x.id === id)!;
    setActionSheet({
      title: l.name, preview: { img: l.cover || "", name: l.name, eyebrow: spotsOf(l.id).length + " spots" },
      actions: [
        { label: "Create a trip", icon: "hugeicons:magic-wand-01", onClick: () => setBuilderList(l) },
        { label: "Rename list", icon: "hugeicons:text-font", onClick: () => showToast("Rename “" + l.name + "”") },
        { label: "Share list", icon: "hugeicons:share-08", onClick: () => showToast("Sharing “" + l.name + "”") },
        { label: "Delete list", icon: "hugeicons:delete-02", destructive: true, onClick: () => showToast("List deleted") },
      ],
    });
  };

  // ---- map markers + focus -------------------------------------------
  const padBottom = Math.max(140, Math.min(520, 874 - sheet.top));
  const { markers, meDot, focus } = useMemo(() => {
    let markers: MapMarker[] = [];
    let meDot: LatLng | null = null;
    let focus: MapFocusTarget = { _n: recenter };

    if (view === "browse") {
      meDot = CITY_CENTER.Warsaw;
      const near = [SPOTS[1], SPOTS[3], SPOTS[5], SPOTS[7]];
      markers = near.map((s) => ({
        key: s.id, latlng: spotLatLng(s),
        html: pinHtml({ cat: s.cat, label: s.name, active: false }),
        onClick: () => setSpot(s),
      }));
      focus = { center: CITY_CENTER.Warsaw, zoom: 13, _n: recenter };
    } else if (view === "myspots") {
      markers = groupedCityPins.map((c) => ({
        key: c.place, latlng: CITY_CENTER[c.place] || CITY_CENTER.Warsaw,
        html: pinHtml({ cat: c.sample.cat, count: c.count, label: placeMeta(c.place).city, active: false }),
        onClick: () => openCity(c.place),
      }));
      focus = { bounds: boundsOf(groupedCityPins.map((c) => CITY_CENTER[c.place] || CITY_CENTER.Warsaw)), _n: recenter };
    } else {
      const src = view === "list" ? listSpots : citySpots;
      markers = src.map((s) => ({
        key: s.id, latlng: spotLatLng(s),
        html: pinHtml({ cat: s.cat, label: s.short || s.name, active: !!(spot && spot.id === s.id) }),
        onClick: () => setSpot(s),
      }));
      focus = { bounds: boundsOf(src.map((s) => spotLatLng(s))), _n: recenter };
    }
    return { markers, meDot, focus };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, listId, cityId, removed, spot, recenter]);

  // ---- sheet body ----
  let sheetBody: JSX.Element | null = null;
  let fixedTop: JSX.Element | null = null;
  if (view === "list" && list) {
    sheetBody = <ListDetail list={list} spots={listSpots} onOpenSpot={openSpotById}
      onShare={() => showToast("Sharing “" + list.name + "”")} onEdit={() => showToast("Edit list details")}
      onCreateTrip={() => setBuilderList(list)} onAddSpot={startPlacing}
      manage={manage} onToggleManage={() => setManage(!manage)} onRemoveSpot={removeSpotFromList}
      catFilter={catFilter} onCatFilter={setCatFilter} placeFilter={placeFilter} onPlaceFilter={setPlaceFilter}
      onSearch={() => setModal("search")} />;
  } else if (view === "myspots") {
    sheetBody = <MySpotsDetail spots={mySpotsAll} countryFilter={countryFilter} onCountryFilter={setCountryFilter}
      onSearch={() => setModal("search")} onOpenCity={openCity} onOpenSpot={openSpotById} />;
  } else if (view === "city") {
    sheetBody = <CityDetail place={cityId!} spots={citySpots} catFilter={catFilter} onCatFilter={setCatFilter}
      onSearch={() => setModal("search")} onOpenSpot={openSpotById} onAddSpot={startPlacing} />;
  } else {
    fixedTop = <FilterRow tab={tab} onTab={setTab} onSearch={() => setModal("search")} />;
    if (tab === "all") sheetBody = <AllContent onOpenList={openList} onOpenMySpots={openMySpots} onOpenSpot={openSpotById}
      savedSpots={savedSpots} onSaveSpot={(s) => setAddSpot(s)} />;
    else if (tab === "lists") sheetBody = <ListsContent onOpenList={openList} onOpenMySpots={openMySpots} onListMenu={listMenu} />;
    else if (tab === "trips") sheetBody = <TripsContent savedTrips={savedTrips} onOpenTrip={shared.openGuide}
      onFindTrips={() => shared.openWizard()} onOpenList={openList} />;
    else sheetBody = <NearbyContent sub={nearbySub} onSub={setNearbySub} onOpenSpot={openSpotById} onOpenTrip={shared.openGuide}
      savedSpots={savedSpots} onSaveSpot={(s) => setAddSpot(s)} savedTrips={savedTrips} onSaveTrip={(t) => shared.toggleSavedTrip(t)} />;
  }

  return (
    <Fragment>
      {/* ---- real map ---- */}
      <RealMap markers={markers} meDot={meDot} focus={focus} padBottom={padBottom}
        center={CITY_CENTER.Warsaw} zoom={13} onMapClick={placing ? onMapTap : undefined} />

      {/* ---- top chrome ---- */}
      {!isDetail ? (
        <Fragment>
          <div className="avatar-btn" aria-hidden style={{ position: "absolute", left: 20, top: 64, zIndex: 16, backgroundImage: `url(${IMG}avatar.png)`, cursor: "default" }}></div>
          <button className="weather" style={{ position: "absolute", right: 20, top: 64, zIndex: 15 }} onClick={() => showToast("Warsaw · 16° · Cloudy")}>
            <iconify-icon icon="solar:cloud-bold"></iconify-icon>16°
          </button>
        </Fragment>
      ) : (
        <Fragment>
          <button className="glassbtn" style={{ position: "absolute", left: 20, top: 64, zIndex: 16 }} onClick={goBack} aria-label="Back">
            <iconify-icon icon="hugeicons:arrow-left-01"></iconify-icon>
          </button>
          <div style={{ position: "absolute", right: 20, top: 64, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", zIndex: 15 }}>
            {view === "list" && (
              <button className="glassbtn" onClick={() => showToast("Edit list details")} aria-label="Edit">
                <iconify-icon icon="solar:pen-2-bold"></iconify-icon>
              </button>
            )}
            <button className="glassbtn" onClick={() => { setRecenter((n) => n + 1); showToast("Centering on these spots"); }} aria-label="Re-center">
              <iconify-icon icon="hugeicons:location-01"></iconify-icon>
            </button>
          </div>
        </Fragment>
      )}

      {/* ---- bottom sheet ---- */}
      {!anyOverlay && (
        <div className={"sheet" + (sheet.dragging ? " dragging" : "")} style={{ top: sheet.top }}>
          <div className="grab-zone" {...sheet.grabProps}>
            <div className="grabber"></div>
          </div>
          {fixedTop}
          <div className="sheet-scroll" key={view + listId + tab + cityId}>{sheetBody}</div>
        </div>
      )}

      {/* ---- add-spot FAB ---- */}
      {!anyOverlay && (view === "list" || view === "myspots" || view === "city") && (
        <button className="fab" style={{ bottom: 96 }} onClick={(e) => { e.stopPropagation(); startPlacing(); }} aria-label="Add a spot">
          <iconify-icon icon="hugeicons:add-01"></iconify-icon>
        </button>
      )}

      {/* ---- modals ---- */}
      <div className={"scrim" + ((anyOverlay || actionSheet) ? " open" : "")} onClick={() => { closeOverlays(); setActionSheet(null); }}></div>
      <SearchModal open={modal === "search"} onClose={() => setModal(null)} allTrips={shared.allTrips}
        onOpenList={openList} onOpenMySpots={openMySpots} onOpenSpot={(id) => { setModal(null); openSpotById(id); }} onOpenTrip={(id) => { setModal(null); shared.openGuide(id); }} />
      <NewListModal open={modal === "newlist"} onClose={() => setModal(null)} onCreate={createList} />
      {spot && <SpotModal spot={spot} saved={savedSpots.has(spot.id)} onClose={() => setSpot(null)}
        onSave={() => setAddSpot(spot)} onDirections={() => showToast("Opening directions to " + spot.name)} />}
      <AddToListSheet open={addSpot !== null} spot={addSpot} selected={addSpot ? (membership[addSpot.id] || new Set()) : new Set()}
        onToggle={toggleMembership} onNewList={() => { setAddSpot(null); setModal("newlist"); }} onClose={() => setAddSpot(null)} />
      <TripBuilder open={builderList !== null} list={builderList} onClose={() => setBuilderList(null)} onGenerate={generate} />
      <ActionSheet sheet={actionSheet} onClose={() => setActionSheet(null)} />

      {/* ---- generating overlay ---- */}
      <div className={"genwrap" + (generating ? " show" : "")}>
        <div className="spin"></div>
        <div style={{ textAlign: "center" }}>
          <div className="msg">Planning your trip…</div>
          <div className="sub">Routing your spots into days</div>
        </div>
      </div>
    </Fragment>
  );
}
