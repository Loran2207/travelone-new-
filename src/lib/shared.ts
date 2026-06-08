// TRAVEL1 — the shared trip-state contract passed from App into the
// Map screen and the trip-detail overlay. This is what keeps everything
// connected: save/create a trip here and it updates Saved, My Trips,
// Search and the map, because they all read the same sets + allTrips.
import type { Trip } from "../data/types";

export interface Shared {
  savedTrips: Set<string>;
  toggleSavedTrip: (t: Trip | string) => void;
  myTrips: Set<string>;
  addMyTrip: (t: Trip | string) => void;
  genTrips: Trip[];
  addGenTrip: (t: Trip) => void;
  allTrips: Trip[];
  completed: Set<string>;
  toggleStop: (key: string) => void;
  showToast: (msg: string) => void;
  findTrip: (id: string) => Trip | undefined;
  openGuide: (id: string) => void;
  openWizard: (city?: { id: string } | null) => void;
  mapIntent: string | null;
  clearMapIntent: () => void;
  requestMapIntent: (intent: string) => void;
}
