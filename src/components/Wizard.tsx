// TRAVEL1 — Search-guides wizard: Where → How long → Preferences
import { useEffect, useState } from "react";
import { CITIES, DESTINATIONS, DURATIONS, IMG, WIZARD_PREFS, placeMeta, prefEmoji } from "../data/data";
import type { Destination } from "../data/types";
import { Emoji, Flag } from "./chrome";
import type { ResultsQuery } from "./Screens";

function DestThumb({ d }: { d: Destination }) {
  if (d.nearby) return <div className="dest-thumb" style={{ backgroundImage: `url(${IMG}avatar.png)` }}></div>;
  return (
    <div className="dest-thumb" style={{ background: d.tint }}>
      <Flag e={d.flag} size={24} />
    </div>
  );
}

export function DurationWheel({ idx, onIdx }: { idx: number; onIdx: (i: number) => void }) {
  const pad = 2;
  const items = ["", "", ...DURATIONS, "", ""];
  const sel = idx + pad;
  return (
    <div className="wheel">
      <div className="wheel-fade-t"></div>
      <div className="wheel-sel"><iconify-icon icon="solar:alt-arrow-up-bold"></iconify-icon><iconify-icon icon="solar:alt-arrow-down-bold"></iconify-icon></div>
      <div className="wheel-track" style={{ transform: `translateY(${(2 - sel) * 60}px)` }}>
        {items.map((d, i) => (
          <div key={i} className={"wheel-item" + (i === sel ? " sel" : "")} onClick={() => d && onIdx(i - pad)}>{d}</div>
        ))}
      </div>
      <div className="wheel-fade-b"></div>
    </div>
  );
}

export function SearchGuidesWizard({ open, initialCity, onClose, onSearch }: {
  open: boolean; initialCity?: { id: string } | null; onClose: () => void; onSearch: (q: ResultsQuery) => void;
}) {
  const [step, setStep] = useState<"where" | "howlong" | "prefs">("where");
  const [dest, setDest] = useState<Destination | null>(null);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("flex");
  const [durIdx, setDurIdx] = useState(-1);
  const [prefs, setPrefs] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      const c = initialCity ? CITIES.find((x) => x.id === initialCity.id) || (initialCity as Destination) : null;
      setDest(c); setQ(""); setMode("flex"); setDurIdx(-1); setPrefs([]);
      setStep(c ? "howlong" : "where");
    }
  }, [open, initialCity]);

  const dests = DESTINATIONS.filter((d) => !q.trim() || (d.city && d.city.toLowerCase().includes(q.trim().toLowerCase())));
  const togglePref = (p: string) => setPrefs(prefs.includes(p) ? prefs.filter((x) => x !== p) : [...prefs, p]);
  const pm = dest ? placeMeta(dest.id) : null;

  const summaryWhere = dest ? (
    <span className="r">{dest.city} <Flag e={dest.flag} size={15} /> {pm && pm.country && !dest.nearby ? pm.country : ""}</span>
  ) : <span className="r add">Add destination</span>;
  const summaryHow = durIdx < 0 ? <span className="r add">Add period</span> : <span className="r">{DURATIONS[durIdx]}</span>;
  const summaryPref = prefs.length ? <span className="r">{prefs.length} selected</span> : <span className="r add">Add preferences</span>;

  const Row = (id: "where" | "howlong" | "prefs", label: string, summary: JSX.Element) => (
    <div className="wiz-row" onClick={() => setStep(id)}>
      <div className="l">{label}</div>{summary}
    </div>
  );

  const goSearch = () => onSearch({
    place: dest && !dest.nearby ? dest.id : "Warsaw",
    duration: DURATIONS[durIdx < 0 ? 2 : durIdx], mode, prefs,
  });

  return (
    <div className={"modal" + (open ? " open" : "")} style={{ top: 56, height: "calc(100% - 56px)" }}>
      <div className="grab-zone"><div className="grabber"></div></div>
      <div className="wiz-head">
        <button className="x" onClick={onClose}><iconify-icon icon="hugeicons:cancel-01"></iconify-icon></button>
        <div className="t">Search guides</div>
      </div>

      <div className="wiz-scroll">
        {step === "where" ? (
          <div className="wiz-open expand">
            <div className="wo-title">Where?</div>
            <div className="wiz-field">
              <iconify-icon icon="solar:magnifer-bold"></iconify-icon>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search destinations…" />
            </div>
            <div className="wiz-suggest-h">Suggested destinations</div>
            <div className="wiz-list">
            {dests.map((d) => (
              <div key={d.id} className={"dest-row" + (dest && dest.id === d.id ? " on" : "")} onClick={() => { setDest(d); setStep("howlong"); }}>
                <DestThumb d={d} />
                <div className="dest-body">
                  <div className="dest-name">{d.city}</div>
                  <div className="dest-country">{d.country}</div>
                </div>
                <div className="pick"><iconify-icon icon="hugeicons:tick-02"></iconify-icon></div>
              </div>
            ))}
            </div>
          </div>
        ) : Row("where", "Where", summaryWhere)}

        {step === "howlong" ? (
          <div className="wiz-open expand">
            <div className="wo-title">How long?</div>
            <div className="wiz-seg">
              <button className={mode === "flex" ? "on" : ""} onClick={() => setMode("flex")}>Flexible</button>
              <button className={mode === "exact" ? "on" : ""} onClick={() => setMode("exact")}>Exact date</button>
            </div>
            <DurationWheel idx={durIdx < 0 ? 2 : durIdx} onIdx={setDurIdx} />
          </div>
        ) : Row("howlong", "How long", summaryHow)}

        {step === "prefs" ? (
          <div className="wiz-open expand">
            <div className="wo-title">Preferences{prefs.length > 0 && <button className="clear" onClick={() => setPrefs([])}>Clear</button>}</div>
            <div className="wo-sub">Selected {prefs.length}</div>
            <div className="wiz-prefs scroll">
              {WIZARD_PREFS.map((p) => (
                <button key={p} className={"wprefchip" + (prefs.includes(p) ? " on" : "")} onClick={() => togglePref(p)}>
                  <Emoji e={prefEmoji(p)} size={18} />{p}
                </button>
              ))}
            </div>
          </div>
        ) : Row("prefs", "Preferences", summaryPref)}
      </div>

      <div className="wiz-foot">
        <button className="clear-all" onClick={() => { setDest(null); setQ(""); setMode("flex"); setDurIdx(-1); setPrefs([]); setStep("where"); }}>Clear all</button>
        {step === "prefs" ? (
          <button className="go search" onClick={goSearch}><iconify-icon icon="solar:magnifer-bold"></iconify-icon> Search guides</button>
        ) : (
          <button className="go" onClick={() => setStep(step === "where" ? "howlong" : "prefs")}>
            Continue <iconify-icon icon="solar:alt-arrow-right-bold"></iconify-icon>
          </button>
        )}
      </div>
    </div>
  );
}
