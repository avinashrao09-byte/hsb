import type { Tier } from "./types";

export const TIER_META: Record<
  Tier,
  { label: string; dot: string; pill: string; bar: string; solid: string; ring: string }
> = {
  green: {
    label: "Green",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    bar: "bg-emerald-500",
    solid: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  yellow: {
    label: "Yellow",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 ring-amber-200",
    bar: "bg-amber-500",
    solid: "bg-amber-500",
    ring: "ring-amber-200",
  },
  red: {
    label: "Red",
    dot: "bg-rose-500",
    pill: "bg-rose-50 text-rose-700 ring-rose-200",
    bar: "bg-rose-500",
    solid: "bg-rose-500",
    ring: "ring-rose-200",
  },
};

export const COACH_META: Record<number, { label: string; pill: string }> = {
  0: { label: "Resistant", pill: "bg-rose-50 text-rose-700 ring-rose-200" },
  1: { label: "Guarded", pill: "bg-amber-50 text-amber-700 ring-amber-200" },
  2: { label: "Coachable", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  3: { label: "Highly coachable", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
};
