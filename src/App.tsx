// TRAVEL1 — app shell: 4-tab navigation (Explore · Saved · My Trips · Map),
// the trip-detail overlay, and the search wizard. Holds the shared trip
// state so every surface stays in sync.
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { TRIPS, IMG } from "./data/data";
import type { City, Trip } from "./data/types";
import type { Shared } from "./lib/shared";
import { BottomNav, type TabId } from "./components/chrome";
import { ExploreScreen, MyTripsScreen, ResultsScreen, SavedScreen, type ResultsQuery } from "./components/Screens";
import { MapScreen } from "./components/MapScreen";
import { GuideDetailOverlay } from "./components/GuideDetailOverlay";
import { SearchGuidesWizard } from "./components/Wizard";

// Scale the 402×874 device to fit a desktop window (no effect on phones,
// where CSS makes .phone full-bleed and overrides the transform).
function useStageScale() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fit = () => {
      const pad = 24;
      const s = Math.min((window.innerWidth - pad) / 402, (window.innerHeight - pad) / 874, 1.15);
      if (ref.current) ref.current.style.transform = `scale(${s})`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return ref;
}

const LIST_SORTS = [{ key: "recent", label: "Recent" }, { key: "name", label: "Name (A-Z)" }, { key: "places", label: "Most places" }];

export function App() {
  const phoneRef = useStageScale();

  const [tab, setTab] = useState<TabId>("explore");
  const [wizard, setWizard] = useState(false);
  const [wizardCity, setWizardCity] = useState<{ id: string } | null>(null);
  const [results, setResults] = useState<ResultsQuery | null>(null);
  const [guideId, setGuideId] = useState<string | null>(null);

  // shared trip state
  const [savedTrips, setSavedTrips] = useState<Set<string>>(() => new Set(TRIPS.filter((t) => t.saved).map((t) => t.id)));
  const [myTrips, setMyTrips] = useState<Set<string>>(() => new Set());
  const [genTrips, setGenTrips] = useState<Trip[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [savedFilter, setSavedFilter] = useState("all");
  const [tripsFilter, setTripsFilter] = useState("all");
  const [listSort, setListSort] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimer = useRef<number | undefined>(undefined);
  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2100);
  };

  // every surface reads from this merged list → static + generated trips
  const allTrips = useMemo(() => [...TRIPS, ...genTrips], [genTrips]);
  const findTrip = (id: string) => allTrips.find((t) => t.id === id);

  const toggleSavedTrip = (t: Trip | string) => {
    const id = typeof t === "string" ? t : t.id;
    setSavedTrips((prev) => { const n = new Set(prev); if (n.has(id)) { n.delete(id); showToast("Removed from Saved"); } else { n.add(id); showToast("Saved"); } return n; });
  };
  const addMyTrip = (t: Trip | string) => {
    const id = typeof t === "string" ? t : t.id;
    setMyTrips((prev) => { if (prev.has(id)) return prev; const n = new Set(prev); n.add(id); return n; });
    showToast("Added to My Trips");
  };
  const addGenTrip = (t: Trip) => setGenTrips((g) => [...g, t]);
  const toggleStop = (key: string) => setCompleted((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const openGuide = (id: string) => { setGuideId(id); };
  const closeGuide = () => setGuideId(null);
  const openWizard = (city?: { id: string } | null) => { setWizardCity(city || null); setWizard(true); };
  const runSearch = (query: ResultsQuery) => { setWizard(false); setResults(query); setTab("explore"); };

  const shared: Shared = {
    savedTrips, toggleSavedTrip, myTrips, addMyTrip, genTrips, addGenTrip, allTrips,
    completed, toggleStop, showToast, findTrip, openGuide, openWizard,
  };
  void toggleStop;

  const goTab = (id: TabId) => { setResults(null); setGuideId(null); setWizard(false); setTab(id); };

  const guide = guideId ? findTrip(guideId) : null;
  const showNav = !guide && !wizard;

  // ---- active screen ----
  let screen: JSX.Element;
  if (tab === "map") {
    screen = <MapScreen shared={shared} />;
  } else if (results) {
    screen = <ResultsScreen query={results} onBack={() => setResults(null)} allTrips={allTrips}
      savedTrips={savedTrips} onOpenGuide={openGuide} onHeart={toggleSavedTrip}
      onFilters={() => openWizard(results.place ? { id: results.place } : null)} />;
  } else if (tab === "explore") {
    screen = <ExploreScreen onSearch={() => openWizard()} onOpenCity={(c: City) => openWizard(c)}
      savedTrips={savedTrips} onOpenGuide={openGuide} onHeart={toggleSavedTrip} />;
  } else if (tab === "saved") {
    screen = <SavedScreen allTrips={allTrips} savedTrips={savedTrips} filter={savedFilter} onFilter={setSavedFilter} sort={LIST_SORTS[listSort].key}
      onOpenGuide={openGuide} onHeart={toggleSavedTrip} onExplore={() => goTab("explore")} />;
  } else {
    screen = <MyTripsScreen allTrips={allTrips} myTrips={myTrips} savedTrips={savedTrips} filter={tripsFilter} onFilter={setTripsFilter} sort={LIST_SORTS[listSort].key}
      onOpenGuide={openGuide} onHeart={toggleSavedTrip} onExplore={() => goTab("explore")} />;
  }

  const showChrome = tab !== "map" && !results;

  return (
    <div className="stage">
      <div className="phone" ref={phoneRef}>
        {screen}

        {/* explore avatar (display only — profile menu intentionally disabled) */}
        {showChrome && tab === "explore" && (
          <div className="avatar-btn" aria-hidden style={{ position: "absolute", left: 20, top: 62, zIndex: 40, backgroundImage: `url(${IMG}avatar.png)`, cursor: "default" }}></div>
        )}
        {/* saved / trips options button */}
        {showChrome && (tab === "saved" || tab === "trips") && (
          <button className="glassbtn sm" style={{ position: "absolute", right: 20, top: 70, zIndex: 40 }}
            onClick={() => { const nx = (listSort + 1) % LIST_SORTS.length; setListSort(nx); showToast("Sorted by " + LIST_SORTS[nx].label); }} aria-label="Sort">
            <iconify-icon icon="solar:tuning-2-bold"></iconify-icon>
          </button>
        )}

        {/* guide / trip detail overlay */}
        {guide && <GuideDetailOverlay trip={guide} shared={shared} onClose={closeGuide} tab={tab} onTab={goTab} />}

        {/* search-guides wizard — only mounted while open so it can't leak onto other screens */}
        {wizard && (
          <Fragment>
            <div className="scrim open" style={{ zIndex: 40 }} onClick={() => setWizard(false)}></div>
            <SearchGuidesWizard open initialCity={wizardCity} onClose={() => setWizard(false)} onSearch={runSearch} />
          </Fragment>
        )}

        {/* bottom nav */}
        {showNav && <BottomNav tab={tab} onTab={goTab} />}

        <div className={"toast" + (toast ? " show" : "")}><iconify-icon icon="solar:check-circle-bold"></iconify-icon>{toast}</div>
      </div>
    </div>
  );
}
