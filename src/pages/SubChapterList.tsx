import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  chaptersForRoute,
  getRouteAudience,
  type RouteAudienceId,
} from "@/data/playbook";
import { PlaybookHeader } from "@/components/PlaybookHeader";
import { ResearchDialog } from "@/components/ResearchDialog";
import { ArrowRight } from "lucide-react";

export default function SubChapterList() {
  const { audience, chapterId } = useParams<{ audience: string; chapterId: string }>();
  const navigate = useNavigate();
  const [research, setResearch] = useState(false);

  const aud = getRouteAudience(audience);
  if (!aud) return <Navigate to="/" replace />;

  const chapters = chaptersForRoute(aud.id);
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) return <Navigate to={`/${aud.id}`} replace />;

  return (
    <div className="min-h-screen bg-background">
      <PlaybookHeader audience={aud.id as RouteAudienceId} onOpenResearch={() => setResearch(true)} showBack />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="border-b border-border pb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-accent">
            Chapter {chapter.number}
          </p>
          <h1 className="mt-2 flex items-center gap-3 font-serif text-3xl leading-tight sm:text-5xl">
            <span>{chapter.icon}</span>
            {chapter.title}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{chapter.blurb}</p>
        </div>

        <ol className="mt-8 space-y-3">
          {chapter.subChapters.map((s, i) => (
            <li key={s.id} style={{ animation: `fadeUp 0.35s ease-out ${i * 40}ms both` }}>
              <button
                onClick={() => navigate(`/${aud.id}/${chapter.id}/${s.id}`)}
                className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 text-left transition-all hover:border-accent hover:shadow-sm"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary font-serif text-sm">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium leading-tight">{s.title}</div>
                  <div className="mt-0.5 text-sm text-muted-foreground">{s.blurb}</div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
              </button>
            </li>
          ))}
        </ol>
      </main>

      <ResearchDialog open={research} onOpenChange={setResearch} audience={aud.id === "all" ? null : aud.id} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
