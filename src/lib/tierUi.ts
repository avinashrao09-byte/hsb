import type { Tier } from "./types";

export const TIER_META: Record<
  Tier,
  { label: string; dot: string; pill: string; bar: string; solid: string; ring: string }
> = {
  green: {
    label: "Green",
    dot: "bg-rag-green",
    pill: "bg-rag-green-soft text-rag-green ring-rag-green/30",
    bar: "bg-rag-green",
    solid: "bg-rag-green",
    ring: "ring-rag-green/30",
  },
  yellow: {
    label: "Yellow",
    dot: "bg-rag-amber",
    pill: "bg-rag-amber-soft text-rag-amber ring-rag-amber/30",
    bar: "bg-rag-amber",
    solid: "bg-rag-amber",
    ring: "ring-rag-amber/30",
  },
  red: {
    label: "Red",
    dot: "bg-rag-red",
    pill: "bg-rag-red-soft text-rag-red ring-rag-red/30",
    bar: "bg-rag-red",
    solid: "bg-rag-red",
    ring: "ring-rag-red/30",
  },
};

export const COACH_META: Record<number, { label: string; pill: string }> = {
  0: { label: "Resistant", pill: "bg-rag-red-soft text-rag-red ring-rag-red/30" },
  1: { label: "Guarded", pill: "bg-rag-amber-soft text-rag-amber ring-rag-amber/30" },
  2: { label: "Coachable", pill: "bg-rag-green-soft text-rag-green ring-rag-green/30" },
  3: { label: "Highly coachable", pill: "bg-rag-green-soft text-rag-green ring-rag-green/30" },
};
