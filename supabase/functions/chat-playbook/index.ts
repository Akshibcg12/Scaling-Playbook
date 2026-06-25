import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { SUBCHAPTER_CONTEXT } from "./playbookContext.ts";

const PLAYBOOK_INDEX = `
The MTLDK Scaling Playbook has 8 chapters. Each sub-chapter has an id, title, blurb, keywords, and the audiences it applies to (offtaker / program / donor). Note: the audience id "donor" is displayed to users as "Funder" — always say "Funder" in your written answers, never "Donor".

Chapter 1 — Overview (id: overview)
- purpose: "Purpose and scope of the playbook" — A practical, end-to-end, decision-oriented guide for launching and scaling pastoral market development. [all] kw: purpose scope audiences how to use stages
- model: "The core KPMD model & market rationale" — Offtakers supply inputs & services to pastoralists, then deduct cost from final livestock payment. [all] kw: kpmd model offtaker inputs services market failures
- conditions: "Conditions for sustainability and success" — Where the model thrives, where it should pause, and what good looks like early vs. late. [all] kw: conditions sustainability success high-potential pastoral

Chapter 2 — KPMD achievements (id: kpmd)
- journey: "Overall PMD journey" — Phased approach progressing from APMT → KPMD pilot → MTLDK scale-up. [all] kw: pmd journey phases apmt kpmd mtldk timeline
- outcomes: "KPMD outcomes & strategic scaling vision" — Six targeted outcomes, pilot performance vs. targets, and the scaled MTLDK ambition. [all] kw: outcomes targets impact scaling vision households women revenue vaccines

Chapter 3 — Location & offtaker selection (id: location)
- country: "Country selection" — Structural, security, and policy factors that determine country suitability. [program, donor] kw: country selection structural security policy
- offtaker: "Offtaker selection" — Criteria, timelines, scoring rubric, and site-visit guide for selecting offtakers. [program, donor] kw: offtaker selection rfp criteria scoring site visit
- county: "County selection" — Selecting target counties based on offtaker presence, structural conditions, and local fit. [all] kw: county selection target counties tailoring
- onboarding: "Offtaker onboarding (incl. target setting)" — Onboarding workshops, target setting, and intervention plan templates. [all] kw: onboarding target setting workshop intervention plan template

Chapter 4 — Operational execution & scaling (id: ops)
- interventions: "Interventions and enablers" — Pastoralist capacity, animal health, feed/fodder, water, offtaker ops, market dev, digital, gender, traceability. [all] kw: interventions enablers animal health feed fodder water boreholes traceability gender market development digital
- expansion: "Expansion pathways and constraints" — Two primary pathways, within and across counties, and how to sequence them. [all] kw: expansion pathways within counties new counties sequencing

Chapter 5 — Commercial viability (id: commercial)
- business-model: "Business model viability" — EBIT, IRR, working-capital, and margin sensitivities for the offtaker business. [all] kw: p&l ebit irr working capital sensitivity unit economics profitability fattening

Chapter 6 — Path to scaling & sustainability (id: path)
- financial: "Financial sustainability pathway" — Aligning funding with stage of scale, from grant to commercial capital. [all] kw: financial sustainability capital sequencing grant commercial
- investor: "Investor readiness & acceleration plan" — Co-investment acceleration planning for MTLDK offtakers. [all] kw: investor readiness co-investment acceleration
- institutional: "Institutionalisation & sustainability mechanisms" — Embedding the model so it persists beyond grant funding. [all] kw: institutionalisation sustainability mechanisms exit

Chapter 7 — Risk & mitigation (id: risk)
- risks: "Risks across program activities & mitigation strategies" — Election logistics, export disruption, drought, disease, flooding, regulatory and cold-chain failure. [all] kw: risk mitigation external operational scaling drought disease flooding regulatory cold chain elections

Chapter 8 — PMO & M&E framework (id: pmo)
- structure: "PMO structure and governance" — Roles, cadence, decision-making backbone, and program management team composition. [program, donor] kw: pmo structure governance roles cadence team budget job description
- results: "Results framework" — Theory of change, core & supporting KPIs, and triangulated data sources. [program, donor] kw: results framework theory of change kpis data sources
- me: "M&E and impact tracking" — Frequency of data collection, household panel methodology, learning and adaptive management. [program, donor] kw: m&e monitoring evaluation household panel learning adaptive management
- apmt: "Summary of APMT learnings" — Consolidated implementation lessons from APMT to guide future programs. [all] kw: apmt lessons learned implementation insights
`;

const SYSTEM_PROMPT = `You are an assistant for the MTLDK Scaling Playbook — a guide for scaling pastoral market development programs (small ruminants, offtakers, pastoralists in Kenya).

Your job: answer the user's question using the SOURCE SLIDE CONTENT below (extracted via OCR from the actual playbook slides), then ALWAYS point them to the exact slide(s) and sub-chapter so they can read the source.

PLAYBOOK INDEX:
${PLAYBOOK_INDEX}

SOURCE SLIDE CONTENT (OCR text per sub-chapter, with slide numbers in [brackets]):
${SUBCHAPTER_CONTEXT}

RULES:
- Answer the question directly using concrete details, numbers, and findings from the OCR text above. Be specific.
- Keep answers concise (3-6 sentences) unless the user asks for detail.
- OCR text can be noisy — silently correct obvious typos but do NOT invent facts that aren't in the source.
- ALWAYS end your answer with a "References:" section listing 1-3 relevant slides. Use this EXACT markdown link format with the source slide number as the 3rd path segment:
  References:
  - [Chapter N · Sub-chapter Title, slide X](playbook://chapterId/subChapterId/X)
- Example: [Chapter 3 · Offtaker selection, slide 29](playbook://location/offtaker/29)
- The slide number in the link MUST be one of the slide numbers shown in [brackets] for that sub-chapter. Always include a slide number — never link without one.
- If the question is outside the playbook's scope, say so briefly and suggest the closest relevant chapter.
- Use markdown formatting.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      const status = upstream.status === 429 || upstream.status === 402 ? upstream.status : 500;
      return new Response(JSON.stringify({ error: text || "AI gateway error" }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
