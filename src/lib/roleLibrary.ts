import type { Competency, Role, RoleProfile, Level } from "./types";

// Single source of truth for the Role Competency Library (v0.2).
// Mirrors HSB-Role-Competency-Library.md. Also used to seed Supabase.

function c(
  code: string,
  name: string,
  weight: number,
  target: Level,
  isSignature: boolean,
  definition: string,
  remediation: Competency["remediation"]
): Competency {
  return { code, name, weight, target, isSignature, definition, remediation };
}

export const ROLE_LABELS: Record<Role, string> = {
  product: "Product Management",
  ai_analytics: "AI & Business Analytics",
  consulting: "Consulting",
  sales: "Sales",
  marketing: "Marketing",
  finance: "Finance",
  operations: "Operations / Supply Chain",
  general_mgmt: "General Management",
  entrepreneurship: "Entrepreneurship",
};

export const ROLE_LIBRARY: RoleProfile[] = [
  {
    role: "product",
    label: ROLE_LABELS.product,
    signatureNote: "Product Sense — a PM who can't frame a user problem is not hireable.",
    competencies: [
      c("product.C1", "Product Sense & User Empathy", 0.22, 3, true, "Frames a real user problem before solutioning and ties it to a metric.", { training: "Reforge / SVPG PM fundamentals", reading: "Inspired (Cagan)", project: "Write a PRD + metric tree" }),
      c("product.C2", "Execution & Delivery", 0.2, 2, false, "Drives a cross-functional effort to ship under constraints.", { training: "Agile/Scrum", reading: "Making Things Happen (Berkun)", project: "Run a mini delivery sprint" }),
      c("product.C3", "Stakeholder Communication & Influence", 0.18, 2, false, "Influences without authority; crisp written and verbal.", { training: "Comms/writing", reading: "Crucial Conversations", project: "One-pager + present a recommendation" }),
      c("product.C4", "Data & Analytics Fluency", 0.16, 2, false, "Defines metrics, forms hypotheses, uses data to decide.", { training: "SQL + product analytics", reading: "Lean Analytics", project: "Analyze a dataset -> recommendation" }),
      c("product.C5", "Technical Fluency", 0.12, 2, false, "Converses with engineers; understands system tradeoffs.", { training: "Technical foundations for PMs", project: "Spec a feature with technical constraints" }),
      c("product.C6", "Strategic / Market Thinking", 0.12, 2, false, "Understands market, competition, business model.", { reading: "Good Strategy Bad Strategy (Rumelt)", project: "Competitive analysis for a product" }),
    ],
  },
  {
    role: "ai_analytics",
    label: ROLE_LABELS.ai_analytics,
    signatureNote: "Statistical/ML foundations — the core of the analyst.",
    competencies: [
      c("ai_analytics.C1", "Statistical & ML Foundations", 0.22, 3, true, "Chooses the right method, interprets output, validates.", { training: "Andrew Ng ML", reading: "Intro to Statistical Learning", project: "Build + validate a predictive model" }),
      c("ai_analytics.C2", "Business Translation & Storytelling with Data", 0.2, 3, false, "Turns analysis into a recommendation execs act on.", { reading: "Storytelling with Data (Knaflic)", project: "Exec-ready insight deck" }),
      c("ai_analytics.C3", "Data Wrangling & SQL", 0.18, 2, false, "Extracts, cleans, transforms; reproducible.", { training: "SQL + Python for data", reading: "Python for Data Analysis (McKinney)", project: "Clean + analyze a messy dataset" }),
      c("ai_analytics.C4", "Applied AI / LLM Fluency", 0.16, 2, false, "Uses LLMs effectively and critically; evaluates output.", { training: "Applied GenAI", project: "LLM-powered analysis with evaluation" }),
      c("ai_analytics.C5", "Analytical Rigor & Problem Framing", 0.14, 2, false, "Turns an ambiguous question into an analyzable one.", { reading: "Thinking with Data (Shron)", project: "Frame + answer an ambiguous business question" }),
      c("ai_analytics.C6", "Data Engineering / Tooling Literacy", 0.1, 1, false, "Understands pipelines, reproducibility, version control.", { training: "Data-engineering fundamentals", project: "Reproducible pipeline with Git" }),
    ],
  },
  {
    role: "consulting",
    label: ROLE_LABELS.consulting,
    signatureNote: "Structured problem-solving — MECE, hypothesis-led.",
    competencies: [
      c("consulting.C1", "Structured Problem-Solving", 0.24, 3, true, "Breaks an ambiguous problem into a MECE structure.", { training: "Case prep (LOMS)", reading: "The Pyramid Principle (Minto)", project: "Structured case writeup" }),
      c("consulting.C2", "Executive Communication", 0.2, 3, false, "Answer-first, top-down, synthesized, client-ready.", { reading: "The Pyramid Principle", project: "Answer-first exec summary + slide" }),
      c("consulting.C3", "Quantitative & Analytical Reasoning", 0.18, 2, false, "Market-sizes and estimates cleanly under pressure.", { training: "Case math + market-sizing drills", project: "Market sizing + sensitivity" }),
      c("consulting.C4", "Business Acumen & Commercial Sense", 0.16, 2, false, "Understands how businesses make money.", { reading: "HBR/FT habit", project: "Profitability diagnosis of a company" }),
      c("consulting.C5", "Client Presence & Influence", 0.12, 2, false, "Credible fast; listens; handles pushback.", { reading: "The Trusted Advisor (Maister)", project: "Mock client session with pushback" }),
      c("consulting.C6", "Drive & Coachability", 0.1, 2, false, "Seeks and applies feedback; iterates to a high bar.", { project: "Mentoring feedback loops" }),
    ],
  },
  {
    role: "sales",
    label: ROLE_LABELS.sales,
    signatureNote: "Persuasive communication + resilience.",
    competencies: [
      c("sales.C1", "Communication, Storytelling & Persuasion", 0.22, 3, true, "Compelling, tailored narrative; confident presence.", { reading: "Pitch Anything (Klaff)", project: "Deliver a sales pitch" }),
      c("sales.C2", "Resilience & Drive", 0.2, 3, false, "Sustains high activity through rejection.", { reading: "Grit (Duckworth)", project: "Sustained-activity outreach challenge" }),
      c("sales.C3", "Discovery & Needs Analysis", 0.18, 2, false, "Uncovers real needs; qualifies; listens.", { reading: "SPIN Selling (Rackham)", project: "Run a discovery call + qualify" }),
      c("sales.C4", "Objection Handling & Negotiation", 0.16, 2, false, "Reframes objections; negotiates on value; closes.", { reading: "Never Split the Difference (Voss)", project: "Objection-handling role-play" }),
      c("sales.C5", "Prospecting & Pipeline Discipline", 0.14, 2, false, "Builds and works a pipeline; CRM hygiene.", { reading: "Fanatical Prospecting (Blount)", project: "Prospect list + outreach sequence" }),
      c("sales.C6", "Business & Product Acumen", 0.1, 2, false, "Understands the buyer's business; frames ROI.", { project: "Build an ROI/value case" }),
    ],
  },
  {
    role: "marketing",
    label: ROLE_LABELS.marketing,
    signatureNote: "Customer & market insight — segmentation and positioning.",
    competencies: [
      c("marketing.C1", "Customer & Market Insight", 0.2, 3, true, "Identifies segments; articulates positioning.", { reading: "Obviously Awesome (Dunford)", project: "Segmentation + positioning statement" }),
      c("marketing.C2", "Digital & Performance Marketing", 0.2, 2, false, "Understands channels, funnel, CAC/LTV.", { training: "Performance-marketing course", project: "Plan + model a multi-channel campaign" }),
      c("marketing.C3", "Marketing Analytics & Measurement", 0.18, 2, false, "Measures ROI, attribution, experiments.", { training: "Marketing analytics", reading: "Lean Analytics", project: "Measurement plan + dashboard" }),
      c("marketing.C4", "Brand, Content & Storytelling", 0.16, 2, false, "Crafts a brand narrative and content that resonates.", { reading: "Building a StoryBrand (Miller)", project: "Campaign concept + content set" }),
      c("marketing.C5", "Product Marketing / GTM", 0.14, 2, false, "Plans a launch; crafts messaging; enables sales.", { training: "PMM course (PMA)", project: "GTM/launch plan" }),
      c("marketing.C6", "Strategic & Commercial Thinking", 0.12, 2, false, "Ties marketing to business goals; budget by ROI.", { reading: "Marketing strategy", project: "Marketing plan tied to an objective" }),
    ],
  },
  {
    role: "finance",
    label: ROLE_LABELS.finance,
    signatureNote: "Financial modeling & analysis.",
    competencies: [
      c("finance.C1", "Financial Modeling & Analysis", 0.24, 3, true, "Builds and interprets models; three-statement, forecasting.", { training: "Financial modeling (WSP/BIWS)", reading: "Investment Banking (Rosenbaum & Pearl)", project: "Three-statement model + DCF" }),
      c("finance.C2", "Valuation & Corporate Finance", 0.18, 2, false, "DCF, comps, WACC, capital structure.", { training: "Valuation course", reading: "Valuation (Koller)", project: "Value a public company two ways" }),
      c("finance.C3", "Accounting & Statement Fluency", 0.16, 2, false, "Reads the three statements and their linkages.", { reading: "Accounting fundamentals", project: "Analyze a company's 10-K" }),
      c("finance.C4", "Quantitative & Analytical Reasoning", 0.14, 2, false, "Comfortable with numbers and estimation.", { training: "Quant / case-math drills", project: "Sensitivity + scenario analysis" }),
      c("finance.C5", "Communication & Executive Presence", 0.16, 2, false, "Explains a financial insight to non-finance; answer-first.", { reading: "The Pyramid Principle", project: "Investment memo with a recommendation" }),
      c("finance.C6", "Markets & Commercial Acumen", 0.12, 2, false, "Understands markets, macro, industry.", { reading: "WSJ/FT habit", project: "An industry or market thesis" }),
    ],
  },
  {
    role: "operations",
    label: ROLE_LABELS.operations,
    signatureNote: "Process optimization.",
    competencies: [
      c("operations.C1", "Process Optimization & Analytical Problem-Solving", 0.22, 3, true, "Diagnoses inefficiency; improves throughput/cost/quality.", { training: "Lean Six Sigma (Green Belt)", reading: "The Goal (Goldratt)", project: "Process map + improvement plan" }),
      c("operations.C2", "Project & Program Management", 0.18, 2, false, "Plans, sequences, delivers on time and budget.", { training: "PM / Agile", reading: "Making Things Happen (Berkun)", project: "Full project plan for an ops initiative" }),
      c("operations.C3", "Supply Chain & Logistics", 0.18, 2, false, "Understands end-to-end flow; procurement, inventory, S&OP.", { training: "Supply-chain fundamentals", reading: "Supply Chain Management (Chopra)", project: "End-to-end supply-chain analysis" }),
      c("operations.C4", "Data & Analytics for Operations", 0.16, 2, false, "Uses data to monitor and improve operations.", { training: "Ops analytics", project: "Build an ops KPI dashboard" }),
      c("operations.C5", "Cross-functional Communication & Change", 0.14, 2, false, "Aligns functions and drives change.", { reading: "Leading Change (Kotter)", project: "Stakeholder-alignment memo" }),
      c("operations.C6", "Quality & Continuous Improvement", 0.12, 2, false, "Kaizen mindset; sets standards; measures.", { reading: "Lean/Kaizen fundamentals", project: "Run one improvement cycle" }),
    ],
  },
  {
    role: "general_mgmt",
    label: ROLE_LABELS.general_mgmt,
    signatureNote: "Strategic thinking & business judgment.",
    competencies: [
      c("general_mgmt.C1", "Strategic Thinking & Business Judgment", 0.22, 3, true, "Sees the whole board; prioritizes for impact.", { reading: "Good Strategy Bad Strategy (Rumelt)", project: "A business/strategy plan" }),
      c("general_mgmt.C2", "Leadership & People Management", 0.2, 3, false, "Leads and develops teams; motivates; delegates.", { reading: "The Making of a Manager (Zhuo)", project: "Leadership/team-development plan" }),
      c("general_mgmt.C3", "Financial & Commercial Acumen", 0.18, 2, false, "P&L literacy; unit economics; drives results.", { training: "Finance for managers", project: "A P&L analysis" }),
      c("general_mgmt.C4", "Cross-functional Breadth", 0.14, 2, false, "Conversant across finance, ops, marketing, product.", { project: "A cross-functional case" }),
      c("general_mgmt.C5", "Executive Communication & Influence", 0.14, 2, false, "Aligns stakeholders; crisp and top-down.", { reading: "The Pyramid Principle", project: "An executive recommendation" }),
      c("general_mgmt.C6", "Execution & Results Orientation", 0.12, 2, false, "Gets things done; accountable; drives outcomes.", { reading: "Execution (Bossidy & Charan)", project: "Own an outcome end to end" }),
    ],
  },
  {
    role: "entrepreneurship",
    label: ROLE_LABELS.entrepreneurship,
    signatureNote: "Opportunity identification & customer discovery.",
    competencies: [
      c("entrepreneurship.C1", "Opportunity Identification & Customer Discovery", 0.22, 3, true, "Finds real problems and validates before building.", { reading: "The Mom Test (Fitzpatrick)", project: "15 customer-discovery interviews + synthesis" }),
      c("entrepreneurship.C2", "Building & Execution (0->1)", 0.2, 3, false, "Ships an MVP with scarce resources.", { training: "No-code / rapid MVP", reading: "The Lean Startup (Ries)", project: "Ship a working MVP" }),
      c("entrepreneurship.C3", "Resourcefulness & Grit", 0.18, 3, false, "Does more with less; persists through setbacks.", { reading: "Grit (Duckworth)", project: "A self-directed build sprint" }),
      c("entrepreneurship.C4", "Business Model & Commercial Sense", 0.16, 2, false, "Unit economics, monetization, GTM, fundraising basics.", { reading: "Business Model Generation (Osterwalder)", project: "Business-model canvas + unit economics" }),
      c("entrepreneurship.C5", "Storytelling & Pitch / Fundraising", 0.14, 2, false, "Compelling narrative; sells the vision.", { reading: "Pitch Anything (Klaff)", project: "An investor pitch deck" }),
      c("entrepreneurship.C6", "Leadership & Team-Building", 0.1, 2, false, "Recruits, aligns, and leads a small team.", { reading: "The Hard Thing About Hard Things (Horowitz)", project: "Founding-team/hiring plan" }),
    ],
  },
];

export function getRoleProfile(role: Role): RoleProfile {
  const p = ROLE_LIBRARY.find((r) => r.role === role);
  if (!p) throw new Error(`Unknown role: ${role}`);
  return p;
}

export const TRACK_LABELS: Record<string, string> = {
  product_mgmt: "Product Management",
  ai_analytics: "AI & Business Analytics",
  foresight_intrapreneurship: "Foresight / Intrapreneurship",
};
