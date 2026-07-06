// Core domain types for the HSB mentoring system.

export type Track = "product_mgmt" | "ai_analytics" | "foresight_intrapreneurship";

export type Role =
  | "product"
  | "ai_analytics"
  | "consulting"
  | "sales"
  | "marketing"
  | "finance"
  | "operations"
  | "general_mgmt"
  | "entrepreneurship";

export type Tier = "green" | "yellow" | "red";

/** 0 Absent · 1 Emerging · 2 Competent · 3 Strong */
export type Level = 0 | 1 | 2 | 3;

export interface Remediation {
  training?: string;
  reading?: string;
  project?: string;
}

export interface Competency {
  code: string; // e.g. "product.C1"
  name: string;
  weight: number; // sums to ~1.0 per role
  target: Level;
  isSignature: boolean;
  definition: string;
  remediation: Remediation;
}

export interface RoleProfile {
  role: Role;
  label: string;
  signatureNote: string;
  competencies: Competency[];
}

export interface CompetencyScore {
  competencyCode: string;
  level: Level;
  evidenceNote?: string;
}

/** Soft-readiness output — instrument-agnostic (see library doc). */
export interface SoftAssessment {
  sourceLabel: string; // which deliverable this came from
  instructionFidelity: Level; // S1
  aiJudgment: Level; // S2
  deliverableQuality: Level; // S3
  selfAwarenessDelta?: number; // self-rating minus measured quality
  critiqueResponse?: Level; // how they took feedback, if a revision loop was run
  note?: string;
}

export interface ArtifactState {
  kind: "resume" | "linkedin";
  level: Level;
  url?: string;
  note?: string;
}

export interface TierResult {
  tier: Tier;
  hardGap: number; // weighted, 0 = fully ready
  hardReadinessPct: number; // 0-100, higher = more ready
  signatureFloorFired: boolean;
  signatureCode: string | null;
  topPrescriptionCode: string | null; // the gap to close first
  coachability: Level | null;
}
