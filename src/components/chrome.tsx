// TRAVEL1 — shared chrome: country flag + bottom tab bar.
import type { CSSProperties } from "react";

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

export type TabId = "explore" | "saved" | "trips" | "map";

const NAV_ITEMS: { id: TabId; label: string; icon: string; dot?: boolean }[] = [
  { id: "explore", label: "Explore",  icon: "solar:compass-bold" },
  { id: "saved",   label: "Saved",    icon: "solar:heart-bold" },
  { id: "trips",   label: "My Trips", icon: "solar:suitcase-lines-bold", dot: true },
  { id: "map",     label: "Map",      icon: "solar:map-bold" },
];

export function BottomNav({ tab, onTab }: { tab: string; onTab: (id: TabId) => void }) {
  return (
    <div className="navwrap">
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
