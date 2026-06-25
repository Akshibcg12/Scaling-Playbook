import { CHAPTERS, type AudienceId, type Chapter, type SubChapter } from "@/data/playbook";

export interface SearchHit {
  chapter: Chapter;
  subChapter: SubChapter;
  score: number;
  snippet: string;
}

function flatten(sub: SubChapter): string {
  return [sub.title, sub.blurb, sub.keywords ?? ""].join(" \n ").toLowerCase();
}

const STOPWORDS = new Set([
  "the","a","an","and","or","of","to","in","for","on","is","are","be","with","how","what","which","do","does","i","you","we","they","my","our","this","that","at","by","as","it","its","from","about","can","should","when","where","why","who",
]);

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function buildSnippet(haystack: string, terms: string[]): string {
  let bestIdx = -1;
  for (const t of terms) {
    const i = haystack.indexOf(t);
    if (i >= 0) { bestIdx = i; break; }
  }
  if (bestIdx < 0) return haystack.slice(0, 180);
  const start = Math.max(0, bestIdx - 60);
  const end = Math.min(haystack.length, bestIdx + 180);
  return (start > 0 ? "…" : "") + haystack.slice(start, end).trim() + (end < haystack.length ? "…" : "");
}

export function searchPlaybook(query: string, audience: AudienceId | null, limit = 5): SearchHit[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];
  const hits: SearchHit[] = [];

  for (const chapter of CHAPTERS) {
    for (const sub of chapter.subChapters) {
      if (audience && !sub.audiences.includes(audience)) continue;
      const hay = flatten(sub);
      let score = 0;
      for (const t of terms) {
        if (sub.title.toLowerCase().includes(t)) score += 8;
        if (chapter.title.toLowerCase().includes(t)) score += 4;
        if (sub.blurb.toLowerCase().includes(t)) score += 3;
        const occ = hay.split(t).length - 1;
        score += occ;
      }
      if (score > 0) {
        hits.push({ chapter, subChapter: sub, score, snippet: buildSnippet(hay, terms) });
      }
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
