import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AUDIENCES } from "@/data/playbook";
import { ArrowRight, ArrowLeft, Search, Bot, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResearchDialog } from "@/components/ResearchDialog";
import { AIBotDialog } from "@/components/AIBotDialog";
import { downloadPlaybookPdf } from "@/lib/downloadPlaybookPdf";
import { toast } from "@/hooks/use-toast";

export default function AudienceSelect() {
  const navigate = useNavigate();
  const [research, setResearch] = useState(false);
  const [aibot, setAibot] = useState(false);
  const [downloading, setDownloading] = useState<null | { current: number; total: number }>(null);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading({ current: 0, total: 166 });
    try {
      await downloadPlaybookPdf((current, total) => setDownloading({ current, total }));
      toast({ title: "Playbook downloaded", description: "Check your downloads folder." });
    } catch (e) {
      toast({ title: "Download failed", description: String(e), variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };



  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20">
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="size-4" />
            Back to overview
          </Button>
        </div>
        <div className="text-center">
          <h1 className="font-serif text-4xl leading-[1.05] sm:text-6xl">
            Which best describes
            <br />
            <span className="italic text-muted-foreground">your role?</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
            Pick a role to see the chapters most relevant to you. You can switch any time.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-3">
          {AUDIENCES.map((a, i) => (
            <button
              key={a.id}
              onClick={() => navigate(`/${a.id}`)}
              className="group relative flex flex-col items-start overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg"
              style={{ animation: `fadeUp 0.5s ease-out ${i * 80}ms both` }}
            >
              <div className="absolute -right-6 -top-6 size-32 rounded-full bg-accent/5 transition-all group-hover:scale-150 group-hover:bg-accent/10" />
              <span className="relative grid size-14 place-items-center rounded-xl bg-secondary text-3xl">
                {a.icon}
              </span>
              <h2 className="relative mt-5 font-serif text-2xl leading-tight">{a.label}</h2>
              <p className="relative mt-1 text-sm font-medium uppercase tracking-wide text-accent">
                {a.tagline}
              </p>
              <p className="relative mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {a.description}
              </p>
              <span className="relative mt-6 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                Open relevant chapters for this role
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-16 grid gap-8 border-t border-border pt-10 sm:grid-cols-2">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              Not sure where to start? Jump in with one of these:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => setResearch(true)} variant="outline" className="gap-2">
                <Search className="size-4" />
                Search
              </Button>
              <Button onClick={() => setAibot(true)} className="gap-2">
                <Bot className="size-4" />
                AI bot
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              To download playbook as full PDF:
            </p>
            <Button onClick={handleDownload} variant="outline" className="gap-2" disabled={!!downloading}>
              {downloading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Preparing… {downloading.current}/{downloading.total}
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="mt-16 text-center text-xs text-muted-foreground">
          © Gates Foundation · Live document, under continuous refinement
        </p>
      </main>

      <ResearchDialog open={research} onOpenChange={setResearch} audience={null} />
      <AIBotDialog open={aibot} onOpenChange={setAibot} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
