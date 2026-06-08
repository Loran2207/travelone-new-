// TRAVEL1 — draggable bottom-sheet hook (drag the grabber to resize,
// snap to the nearest detent on release). Shared by the Map screen and
// the trip-detail overlay.
import { useRef, useState, type PointerEvent } from "react";

// Map-screen sheet detents (top offset in px): full / mid / peek.
export const FULL = 122, MID = 396, PEEK = 566;
export const DETENTS = [FULL, MID, PEEK];

// Trip-detail overlay detents.
export const G_FULL = 120, G_MID = 274, G_LOW = 548;
export const G_DETENTS = [G_FULL, G_MID, G_LOW];

export interface SheetHandlers {
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
  onPointerCancel: (e: PointerEvent) => void;
}

export interface UseSheet {
  top: number;
  dragging: boolean;
  setTop: (n: number) => void;
  grabProps: SheetHandlers;
}

export function useSheet(detents: number[], initial: number): UseSheet {
  const lo = Math.min(...detents);
  const hi = Math.max(...detents);
  const [top, setTop] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ startY: 0, startTop: initial, moved: false });
  const sorted = [...detents].sort((a, b) => a - b);
  const raise = sorted[0];
  const lower = sorted[1] ?? sorted[0];

  const onPointerDown = (e: PointerEvent) => {
    drag.current = { startY: e.clientY, startTop: top, moved: false };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    if (Math.abs(e.clientY - drag.current.startY) > 4) drag.current.moved = true;
    let t = drag.current.startTop + (e.clientY - drag.current.startY);
    t = Math.max(lo, Math.min(hi, t));
    setTop(t);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (!drag.current.moved) {
      // a tap on the handle toggles between raised (full) and the next detent down
      setTop(top > raise + 20 ? raise : lower);
      return;
    }
    let best = detents[0], dd = Infinity;
    for (const d of detents) {
      const x = Math.abs(d - top);
      if (x < dd) { dd = x; best = d; }
    }
    setTop(best);
  };

  return {
    top,
    dragging,
    setTop,
    grabProps: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}
