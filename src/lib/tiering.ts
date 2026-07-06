import type { CompetencyScore, Level, Role, TierResult } from "./types";
import { getRoleProfile } from "./roleLibrary";

// Turns raw competency scores + coachability into a tier.
// Implements the DECIDED rule: signature-only hard floor.
// Gap is the x-axis; coachability is the y-axis. See library doc.

const GREEN_READINESS = 80; // >= this and no floor breach => Green
const RED_READINESS = 55; // < this AND low coachability => Red

export function computeTier(
  role: Role,
  scores: CompetencyScore[],
  coachability: Level | null
): TierResult {
  const profile = getRoleProfile(role);
  const byCode = new Map(scores.map((s) => [s.competencyCode, s.level]));

  let weightedGap = 0;
  let maxGap = 0;
  let worst: { code: string; gap: number } | null = null;

  for (const comp of profile.competencies) {
    const level = (byCode.get(comp.code) ?? 0) as Level;
    const rawGap = Math.max(0, comp.target - level);
    const wGap = rawGap * comp.weight;
    weightedGap += wGap;
    maxGap += comp.target * comp.weight;
    if (!worst || wGap > worst.gap) worst = { code: comp.code, gap: wGap };
  }

  const hardReadinessPct = maxGap > 0 ? Math.round(100 * (1 - weightedGap / maxGap)) : 100;

  // Signature floor (hard gate)
  const signature = profile.competencies.find((c) => c.isSignature) ?? null;
  const signatureLevel = signature ? ((byCode.get(signature.code) ?? 0) as Level) : 3;
  const signatureFloorFired = signature ? signatureLevel < signature.target : false;

  // Top prescription: signature gap wins if the floor fired, else the largest weighted gap.
  const topPrescriptionCode = signatureFloorFired
    ? signature!.code
    : worst && worst.gap > 0
    ? worst.code
    : null;

  // Tier decision
  const coachable = coachability === null ? null : coachability >= 2;
  let tier: TierResult["tier"];

  if (hardReadinessPct >= GREEN_READINESS && !signatureFloorFired) {
    tier = "green";
  } else if (hardReadinessPct < RED_READINESS && coachable === false) {
    // large gap AND resistant
    tier = "red";
  } else {
    // meaningful gap but coachable (or coachability unknown) — the core investment
    tier = "yellow";
  }

  return {
    tier,
    hardGap: Number(weightedGap.toFixed(3)),
    hardReadinessPct,
    signatureFloorFired,
    signatureCode: signature?.code ?? null,
    topPrescriptionCode,
    coachability,
  };
}

/** Coachability seed from the soft-readiness output (see doc).
 *  Blends instruction fidelity, critique response, and the self-awareness delta. */
export function coachabilityFromSoft(input: {
  instructionFidelity: Level;
  critiqueResponse?: Level;
  selfAwarenessDelta?: number; // self - measured; large positive = over-rating = risk
}): Level {
  let base = input.critiqueResponse ?? input.instructionFidelity;
  const delta = input.selfAwarenessDelta ?? 0;
  if (delta >= 2) base = Math.max(0, base - 1) as Level; // big over-rating drags it down
  if (delta <= -1) base = Math.min(3, base + 0) as Level; // humble/accurate: no penalty
  return base as Level;
}
