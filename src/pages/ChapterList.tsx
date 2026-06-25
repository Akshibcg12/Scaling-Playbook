import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { chaptersForRoute, getRouteAudience, type RouteAudienceId } from "@/data/playbook";
import { PlaybookHeader } from "@/components/PlaybookHeader";
import { ResearchDialog } from "@/components/ResearchDialog";
import { ArrowRight } from "lucide-react";

export default function ChapterList() {
  const { audience } = useParams<{ audience: string }>();
  const navigate = useNavigate();
  const [research, setResearch] = useState(false);

  const aud = getRouteAudience(audience);
  if (!aud) return <Navigate to="/" replace />;

  const chapters = chaptersForRoute(aud.id);

  return (
    <div className="min-h-screen bg-background">
      <PlaybookHeader audience={aud.id as RouteAudienceId} onOpenResearch={() => setResearch(true)} showBack />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent">
              {aud.icon} {aud.label} view
            </p>
            <h1 className="mt-2 font-serif text-3xl leading-tight sm:text-5xl">
              Your chapters
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {chapters.length} chapters with {chapters.reduce((n, c) => n + c.subChapters.length, 0)} sub-chapters tailored to your role.
            </p>
          </div>
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2">
          {chapters.map((c, i) => (
            <li key={c.id} style={{ animation: `fadeUp 0.4s ease-out ${i * 50}ms both` }}>
              <button
                onClick={() => navigate(`/${aud.id}/${c.id}`)}
                className="group flex w-full items-start gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary font-serif text-lg text-primary-foreground">
                  {c.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.icon}</span>
                    <h2 className="font-serif text-xl leading-tight">{c.title}</h2>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.subChapters.map((s) => (
                      <span
                        key={s.id}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
                      >
                        {s.title}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="mt-3 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
              </button>
            </li>
          ))}
        </ol>
      </main>

      <ResearchDialog open={research} onOpenChange={setResearch} audience={aud.id === "all" ? null : aud.id} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
