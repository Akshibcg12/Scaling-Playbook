// Playbook data: audiences, chapters, sub-chapters.
// Each sub-chapter renders the underlying slide images from the source deck
// (public/slides/slide-XXX.jpg), 1920x1080.
// Audience mapping derived from slides 9 & 10 of the source playbook.
// (Note: the deck groups "Donors and program mgmt." as one column, we expose
// them as two personas with identical visibility.)

export type AudienceId = "offtaker" | "program" | "donor";

export interface Audience {
  id: AudienceId;
  label: string;
  tagline: string;
  description: string;
  icon: string;
}

export interface SubChapter {
  id: string;
  title: string;
  blurb: string;
  audiences: AudienceId[];
  slides: number[];        // 1-based slide numbers in the source deck
  keywords?: string;       // extra search context
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  icon: string;
  blurb: string;
  subChapters: SubChapter[];
}

export const AUDIENCES: Audience[] = [
  {
    id: "offtaker",
    label: "Offtaker",
    tagline: "Private-sector buyer & supplier",
    description:
      "You purchase small ruminants directly from pastoralists and want to know how to plug into and grow with the program.",
    icon: "🐐",
  },
  {
    id: "program",
    label: "Program Management",
    tagline: "Central program leadership",
    description:
      "You coordinate the program end-to-end, country and county selection, offtaker onboarding, M&E, and scaling.",
    icon: "🧭",
  },
  {
    id: "donor",
    label: "Funder",
    tagline: "Financier of the program",
    description:
      "You fund the work and need to understand the model, investment thesis, sustainability path, and impact targets.",
    icon: "💼",
  },
];

// "Donors and program mgmt." share visibility in the source deck.
const ALL: AudienceId[] = ["offtaker", "program", "donor"];
const NON_OFFTAKER: AudienceId[] = ["program", "donor"];

export const CHAPTERS: Chapter[] = [
  {
    id: "overview",
    number: 1,
    title: "Overview",
    icon: "👁",
    blurb: "Purpose, the core model, and the conditions under which it works.",
    subChapters: [
      {
        id: "purpose",
        title: "Purpose and scope of the playbook",
        blurb: "A practical, end-to-end, decision-oriented guide for launching and scaling pastoral market development.",
        audiences: ALL,
        slides: [7, 8, 9, 10],
        keywords: "purpose scope audiences how to use stages",
      },
      {
        id: "model",
        title: "The core KPMD model & market rationale",
        blurb: "Offtakers supply inputs & services to pastoralists, then deduct cost from final livestock payment.",
        audiences: ALL,
        slides: [12, 13, 14],
        keywords: "kpmd model offtaker inputs services market failures",
      },
      {
        id: "conditions",
        title: "Conditions for sustainability and success",
        blurb: "Where the model thrives, where it should pause, and what good looks like early vs. late.",
        audiences: ALL,
        slides: [16],
        keywords: "conditions sustainability success high-potential pastoral",
      },
    ],
  },
  {
    id: "kpmd",
    number: 2,
    title: "KPMD achievements",
    icon: "🏆",
    blurb: "The overall PMD journey and the outcomes & scaling vision behind MTLDK.",
    subChapters: [
      {
        id: "journey",
        title: "Overall PMD journey",
        blurb: "Phased approach progressing from APMT → KPMD pilot → MTLDK scale-up.",
        audiences: ALL,
        slides: [19],
        keywords: "pmd journey phases apmt kpmd mtldk timeline",
      },
      {
        id: "outcomes",
        title: "KPMD outcomes & strategic scaling vision",
        blurb: "Six targeted outcomes, pilot performance vs. targets, and the scaled MTLDK ambition.",
        audiences: ALL,
        slides: [6, 21, 22, 23],
        keywords: "outcomes targets impact scaling vision households women revenue vaccines",
      },
    ],
  },
  {
    id: "location",
    number: 3,
    title: "Location & offtaker selection",
    icon: "📍",
    blurb: "Choosing where to operate and which offtaker(s) to partner with.",
    subChapters: [
      {
        id: "country",
        title: "Country selection",
        blurb: "Structural, security, and policy factors that determine country suitability.",
        audiences: NON_OFFTAKER,
        slides: [26],
        keywords: "country selection structural security policy",
      },
      {
        id: "offtaker",
        title: "Offtaker selection",
        blurb: "Criteria, timelines, scoring rubric, and site-visit guide for selecting offtakers.",
        audiences: NON_OFFTAKER,
        slides: [28, 29, 30, 31, 32, 117, 118, 119, 120],
        keywords: "offtaker selection rfp criteria scoring site visit",
      },
      {
        id: "county",
        title: "County selection",
        blurb: "Selecting target counties based on offtaker presence, structural conditions, and local fit.",
        audiences: ALL,
        slides: [34, 35, 36],
        keywords: "county selection target counties tailoring",
      },
      {
        id: "onboarding",
        title: "Offtaker onboarding (incl. target setting)",
        blurb: "Onboarding workshops, target setting, and intervention plan templates.",
        audiences: ALL,
        slides: [38, 39, 40, 121, 122, 123, 124, 125, 126, 127],
        keywords: "onboarding target setting workshop intervention plan template",
      },
    ],
  },
  {
    id: "ops",
    number: 4,
    title: "Operational execution & scaling",
    icon: "⚙️",
    blurb: "The interventions, enablers, and expansion pathways that move the program at scale.",
    subChapters: [
      {
        id: "interventions",
        title: "Interventions and enablers",
        blurb: "Pastoralist capacity, animal health, feed/fodder, water, offtaker ops, market dev, digital, gender, traceability.",
        audiences: ALL,
        slides: [43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 128, 129, 130, 131, 132, 133, 134, 155, 156, 157, 158],
        keywords: "interventions enablers animal health feed fodder water boreholes traceability gender market development digital",
      },
      {
        id: "expansion",
        title: "Expansion pathways and constraints",
        blurb: "Two primary pathways, within and across counties, and how to sequence them.",
        audiences: ALL,
        slides: [72, 73, 74],
        keywords: "expansion pathways within counties new counties sequencing",
      },
    ],
  },
  {
    id: "commercial",
    number: 5,
    title: "Commercial viability",
    icon: "💰",
    blurb: "Profitability, investability, sensitivity, does the offtaker business stay bankable at scale?",
    subChapters: [
      {
        id: "business-model",
        title: "Business model viability",
        blurb: "EBIT, IRR, working-capital, and margin sensitivities for the offtaker business.",
        audiences: ALL,
        slides: [77, 78, 79, 80, 81, 82],
        keywords: "p&l ebit irr working capital sensitivity unit economics profitability fattening",
      },
    ],
  },
  {
    id: "path",
    number: 6,
    title: "Path to scaling & sustainability",
    icon: "🛤️",
    blurb: "Financial sustainability, investor readiness, and institutionalisation.",
    subChapters: [
      {
        id: "financial",
        title: "Financial sustainability pathway",
        blurb: "Aligning funding with stage of scale, from grant to commercial capital.",
        audiences: ALL,
        slides: [84],
        keywords: "financial sustainability capital sequencing grant commercial",
      },
      {
        id: "investor",
        title: "Investor readiness & acceleration plan",
        blurb: "Co-investment acceleration planning for MTLDK offtakers.",
        audiences: ALL,
        slides: [135, 136],
        keywords: "investor readiness co-investment acceleration",
      },
      {
        id: "institutional",
        title: "Institutionalisation & sustainability mechanisms",
        blurb: "Embedding the model so it persists beyond grant funding.",
        audiences: ALL,
        slides: [84],
        keywords: "institutionalisation sustainability mechanisms exit",
      },
    ],
  },
  {
    id: "risk",
    number: 7,
    title: "Risk & mitigation",
    icon: "⚠️",
    blurb: "External, operational, and scaling risks, with concrete mitigations.",
    subChapters: [
      {
        id: "risks",
        title: "Risks across program activities & mitigation strategies",
        blurb: "Election logistics, export disruption, drought, disease, flooding, regulatory and cold-chain failure.",
        audiences: ALL,
        slides: [86, 87, 88, 89, 90, 91, 92, 137, 138, 139, 140, 141, 142, 143],
        keywords: "risk mitigation external operational scaling drought disease flooding regulatory cold chain elections",
      },
    ],
  },
  {
    id: "pmo",
    number: 8,
    title: "PMO & M&E framework",
    icon: "📊",
    blurb: "Governance, KPIs, monitoring & evaluation, plus APMT learnings.",
    subChapters: [
      {
        id: "structure",
        title: "PMO structure and governance",
        blurb: "Roles, cadence, decision-making backbone, and program management team composition.",
        audiences: NON_OFFTAKER,
        slides: [95, 96, 97, 98, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154],
        keywords: "pmo structure governance roles cadence team budget job description",
      },
      {
        id: "results",
        title: "Results framework",
        blurb: "Theory of change, core & supporting KPIs, and triangulated data sources.",
        audiences: NON_OFFTAKER,
        slides: [100, 101, 102, 104],
        keywords: "results framework theory of change kpis data sources",
      },
      {
        id: "me",
        title: "M&E and impact tracking",
        blurb: "Frequency of data collection, household panel methodology, learning and adaptive management.",
        audiences: NON_OFFTAKER,
        slides: [105, 106, 107, 108],
        keywords: "m&e monitoring evaluation household panel learning adaptive management",
      },
      {
        id: "apmt",
        title: "Summary of APMT learnings",
        blurb: "Consolidated implementation lessons from APMT to guide future programs.",
        audiences: ALL,
        slides: [110, 111, 112, 113, 114, 115],
        keywords: "apmt lessons learned implementation insights",
      },
    ],
  },
];

export function chaptersForAudience(audience: AudienceId): Chapter[] {
  return CHAPTERS.map((c) => ({
    ...c,
    subChapters: c.subChapters.filter((s) => s.audiences.includes(audience)),
  })).filter((c) => c.subChapters.length > 0);
}

export const SLIDE_IMAGE = (n: number) =>
  `/slides/slide-${String(n).padStart(3, "0")}.jpg`;

export const TOTAL_SOURCE_SLIDES = 166;
export const LAST_UPDATED = "June 2026";

// "all" is a virtual audience used by Search/AI bot deep links from the
// landing page where no specific role has been chosen.
export const ALL_AUDIENCE = {
  id: "all" as const,
  label: "All chapters",
  tagline: "Full playbook",
  description: "Every chapter and sub-chapter, no role filter.",
  icon: "📚",
};

export type RouteAudienceId = AudienceId | "all";

export function getRouteAudience(id: string | undefined) {
  if (id === "all") return ALL_AUDIENCE;
  return AUDIENCES.find((a) => a.id === id) ?? null;
}

export function chaptersForRoute(id: RouteAudienceId): Chapter[] {
  if (id === "all") return CHAPTERS;
  return chaptersForAudience(id);
}
