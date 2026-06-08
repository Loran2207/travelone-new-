// TRAVEL1 — shared chrome: country flag + bottom tab bar.
import { Fragment, useState, type CSSProperties } from "react";

// Country flag emoji don't render on every platform — use Twemoji SVGs.
export function flagUrl(e: string): string | null {
  if (!e) return null;
  const cp = [...e]
    .map((c) => c.codePointAt(0)!.toString(16))
    .filter((h) => h !== "fe0f")
    .join("-");
  return "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/" + cp + ".svg";
}

export function Flag({ e, size = 16, style }: { e?: string; size?: number; style?: CSSProperties }) {
  if (!e) return null;
  return (
    <img
      className="flagimg"
      src={flagUrl(e) || undefined}
      alt=""
      draggable={false}
      style={{ height: size, width: "auto", verticalAlign: "-0.14em", ...style }}
    />
  );
}

export function Emoji({ e, size = 16, style }: { e?: string; size?: number; style?: CSSProperties }) {
  if (!e) return null;
  return (
    <img className="twemoji" src={flagUrl(e) || undefined} alt="" draggable={false}
      style={{ width: size, height: size, ...style }} />
  );
}

export type TabId = "explore" | "trips" | "map";

const NAV_ITEMS: { id: TabId; label: string; icon: string; dot?: boolean }[] = [
  { id: "explore", label: "Explore",  icon: "solar:compass-bold" },
  { id: "trips",   label: "My Trips", icon: "solar:suitcase-lines-bold", dot: true },
  { id: "map",     label: "Map",      icon: "solar:map-bold" },
];

export function BottomNav({ tab, onTab, compact }: { tab: string; onTab: (id: TabId) => void; compact?: boolean }) {
  return (
    <div className={"navwrap" + (compact ? " compact" : "")}>
      <div className="navbar">
        {NAV_ITEMS.map((it) => {
          const on = tab === it.id;
          return (
            <button key={it.id} className={"navtab" + (on ? " on" : "")} onClick={() => onTab(it.id)}>
              <span className="navico">
                <iconify-icon icon={it.icon}></iconify-icon>
                {it.dot && <span className="dot"></span>}
              </span>
              <span className="navlabel">{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- quick-actions FAB (bottom-right, on Explore / My Trips) ----
export function QuickFab({ onAddPlace, onSearch, onNewList }: {
  onAddPlace: () => void; onSearch: () => void; onNewList: () => void;
}) {
  const [open, setOpen] = useState(false);
  const act = (fn: () => void) => { setOpen(false); fn(); };
  return (
    <Fragment>
      {open && <div className="qf-scrim" onClick={() => setOpen(false)}></div>}
      <div className="quickfab-wrap">
        {open && (
          <div className="qf-menu">
            <button className="qf-item" onClick={() => act(onAddPlace)}><span className="qf-ic place"><iconify-icon icon="solar:map-point-bold"></iconify-icon></span>Add a place</button>
            <button className="qf-item" onClick={() => act(onSearch)}><span className="qf-ic search"><iconify-icon icon="solar:magnifer-bold"></iconify-icon></span>Search guides</button>
            <button className="qf-item" onClick={() => act(onNewList)}><span className="qf-ic list"><iconify-icon icon="solar:bookmark-bold"></iconify-icon></span>New list</button>
          </div>
        )}
        <button className={"quickfab" + (open ? " open" : "")} onClick={() => setOpen((o) => !o)} aria-label="Quick actions">
          <iconify-icon icon="hugeicons:add-01"></iconify-icon>
        </button>
      </div>
    </Fragment>
  );
}
