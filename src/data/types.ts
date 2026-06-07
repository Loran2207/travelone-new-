// TRAVEL1 — shared domain types

export type CategoryKey =
  | "Landmark" | "Museum" | "Restaurant" | "Cafe" | "Bar"
  | "Park" | "Viewpoint" | "Market" | "Hotel";

export interface Cat {
  icon: string;
  color: string;
  soft: string;
}

export interface CatMetaEntry {
  type: string;
  emoji: string;
}

export interface Place {
  city: string;
  country: string;
  flag: string;
  cover?: string;
}

export interface Spot {
  id: string;
  name: string;
  cat: string;
  place: string;
  list: string;
  img: string;
  rating: number | string;
  price: string;
  hours: string;
  dist: string;
  desc: string;
  x: number;
  y: number;
  short?: string;
  label?: boolean;
}

export interface ListDef {
  id: string;
  name: string;
  special?: boolean;
  pin?: boolean;
  cover?: string;
  icon?: string;
  color?: string;
  collab?: boolean;
  note?: string;
}

export interface Stop {
  id: string;
  name: string;
  cat: string;
  img: string;
  note: string;
  x: number;
  y: number;
  toNext: number | null;
  walk?: number;
}

export interface Day {
  n: number;
  km: number;
  stops: Stop[];
}

export interface TripStats {
  places: number;
  steps: string;
  km: number;
  days: number;
}

export interface Trip {
  id: string;
  name: string;
  subtitle?: string | null;
  place: string;
  badge?: string | null;
  saved: boolean;
  mine: boolean;
  cover: string;
  cats: string[];
  stats: TripStats;
  days: Day[];
  dateLabel?: string;
}

export interface City {
  id: string;
  city: string;
  country: string;
  flag: string;
  cover: string;
  guides: number;
  tint: string;
}

export interface ExploreSection {
  id: string;
  title: string;
  cities: string[];
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  flag: string;
  nearby?: boolean;
  avatar?: boolean;
  cover?: string;
  tint?: string;
  guides?: number;
}
