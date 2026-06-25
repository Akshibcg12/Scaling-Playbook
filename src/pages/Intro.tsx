import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Search, Bot, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResearchDialog } from "@/components/ResearchDialog";
import { AIBotDialog } from "@/components/AIBotDialog";
import { downloadPlaybookPdf } from "@/lib/downloadPlaybookPdf";
import { toast } from "@/hooks/use-toast";
import { SLIDE_IMAGE, LAST_UPDATED } from "@/data/playbook";
import chaptersOverview from "@/assets/playbook-chapters-overview-v2.png.asset.json";

type Step = {
  image: string;
  eyebrow: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    image: SLIDE_IMAGE(5),
    eyebrow: "01 · Why pastoral markets",
    title: "The opportunity and the barriers",
    body:
      "Pastoralism supports 50-100 million people across 43% of Africa's land, yet faces persistent market failures. Pastoral Market Development (PMD) programs are built to address these challenges.",
  },
  {
    image: SLIDE_IMAGE(7),
    eyebrow: "02 · How to use this playbook",
    title: "A practical, decision-oriented guide",
    body:
      "An end-to-end guide that acts as a starting point to launch and scale a PMD program, distilled from years of implementation experience in Kenya and Ethiopia.",
  },
  {
    image: chaptersOverview.url,
    eyebrow: "03 · What's inside",
    title: "Eight chapters covering the full program",
    body:
      "The chapters cover the full spectrum of activities to successfully start and run the program, from location and offtaker selection to PMO & M&E framework.",
  },
];

export default function Intro() {
  const navigate = useNavigate();
  const [research, setResearch] = useState(false);
  const [aibot, setAibot] = useState(false);
  const [downloading, setDownloading] = useState<null | { current: number; total: number }>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) navigate("/select");
    else setStep((s) => s + 1);
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading({ current: 0, total: 166 });
    try {
      await downloadPlaybookPdf((c, t) => setDownloading({ current: c, total: t }));
      toast({ title: "Playbook downloaded", description: "Check your downloads folder." });
    } catch (e) {
      toast({ title: "Download failed", description: String(e), variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          Scaling Playbook · Updated {LAST_UPDATED}
        </p>
        <div className="flex items-center gap-2">
          <Button onClick={() => setResearch(true)} variant="ghost" size="sm" className="gap-2">
            <Search className="size-4" /> <span className="hidden sm:inline">Search</span>
          </Button>
          <Button onClick={() => setAibot(true)} variant="ghost" size="sm" className="gap-2">
            <Bot className="size-4" /> <span className="hidden sm:inline">AI bot</span>
          </Button>
          <Button onClick={handleDownload} variant="ghost" size="sm" className="gap-2" disabled={!!downloading}>
            {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            <span className="hidden sm:inline">
              {downloading ? `${downloading.current}/${downloading.total}` : "PDF"}
            </span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-10 sm:px-8">
        {/* Hero intro line */}
        <div className="mb-8 max-w-3xl sm:mb-12">
          <h1 className="font-serif text-3xl leading-[1.05] sm:text-5xl">
            What does this PMD program scaling playbook cover?
          </h1>
        </div>

        {/* Stepper: large slide + side copy */}
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_2fr]">
          {/* Side copy */}
          <div key={`copy-${step}`} style={{ animation: "fadeIn 0.45s ease-out" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
              {current.eyebrow}
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
              {current.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {current.body}
            </p>

            {/* Progress dots */}
            <div className="mt-8 flex items-center gap-2">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStep(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === step ? "w-8 bg-foreground" : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/70"
                  }`}
                />
              ))}
              <span className="ml-3 text-xs text-muted-foreground">
                {step + 1} / {STEPS.length}
              </span>
            </div>
          </div>

          {/* Slide */}
          <button
            key={current.image}
            type="button"
            onClick={() => setLightbox(current.image)}
            className="group relative mx-auto block aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-secondary shadow-lg transition-shadow hover:shadow-xl"
            aria-label="Enlarge slide"
            style={{ animation: "fadeIn 0.45s ease-out" }}
          >
            <img
              src={current.image}
              alt={current.title}
              className="absolute inset-0 size-full object-contain"
            />
            <span className="absolute bottom-3 right-3 rounded-md bg-background/90 px-2 py-1 text-[10px] font-medium text-foreground shadow">
              Click to enlarge
            </span>
          </button>
        </div>

        {/* Sticky-feeling navigation row */}
        <div className="mt-10 flex flex-col items-stretch gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Previous
          </Button>


          <Button
            size="lg"
            onClick={handleNext}
            className="group gap-2 rounded-full px-7"
          >
            {isLast ? "Continue to playbook" : "Next"}
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </main>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <ResearchDialog open={research} onOpenChange={setResearch} audience={null} />
      <AIBotDialog open={aibot} onOpenChange={setAibot} />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
