import type { Tier } from "./types";

// The Future of Work skills — a separate, role-agnostic track from the
// whiteboard framework. Same for every student, scored 0-3, snapshotted.
// This never feeds the role-fitment RAG; it has its own rollup.

export type FutureWorkSkillKey =
  | "stay_the_course"
  | "direction"
  | "navigate_maze"
  | "take_people_along"
  | "use_ai";

export interface FutureWorkSkill {
  key: FutureWorkSkillKey;
  name: string; // the capability
  traits: string[]; // sub-traits: definition + what to look for
}

export const FUTURE_WORK_SKILLS: FutureWorkSkill[] = [
  { key: "stay_the_course", name: "Stay the Course", traits: ["Resilience", "Achievement Orientation", "Passion"] },
  { key: "direction", name: "Direction", traits: ["Initiative", "Sensemaking", "Clarity of Thought", "Confidence"] },
  { key: "navigate_maze", name: "Navigate the Maze", traits: ["Learning", "Risk Appetite"] },
  { key: "take_people_along", name: "Take People Along", traits: ["Inspire & Influence", "Storytelling"] },
  { key: "use_ai", name: "Use AI", traits: ["AI fluency", "Human-shaped, not AI-only"] },
];

export type FutureWorkScores = Record<FutureWorkSkillKey, number>; // each 0-3

// Roll the five 0-3 skills into an index (0-100) and its own RAG tier.
// Returns nulls until all five are present (not yet assessed).
export function futureWorkRollup(
  scores: Partial<FutureWorkScores> | null
): { index: number | null; tier: Tier | null } {
  if (!scores) return { index: null, tier: null };
  const vals = FUTURE_WORK_SKILLS.map((s) => scores[s.key]).filter(
    (v): v is number => v != null
  );
  if (vals.length < FUTURE_WORK_SKILLS.length) return { index: null, tier: null };
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length; // 0-3
  const index = Math.round((avg / 3) * 100);
  const tier: Tier = index >= 75 ? "green" : index < 45 ? "red" : "yellow";
  return { index, tier };
}
