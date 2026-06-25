import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  SLIDE_IMAGE,
  TOTAL_SOURCE_SLIDES,
  chaptersForRoute,
  getRouteAudience,
  type RouteAudienceId,
} from "@/data/playbook";
import { PlaybookHeader } from "@/components/PlaybookHeader";
import { ResearchDialog } from "@/components/ResearchDialog";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

export default function ContentView() {
  const { audience, chapterId, subId } = useParams<{
    audience: string;
    chapterId: string;
    subId: string;
  }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [research, setResearch] = useState(false);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const aud = getRouteAudience(audience);
  if (!aud) return <Navigate to="/" replace />;

  const chapters = chaptersForRoute(aud.id);
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) return <Navigate to={`/${aud.id}`} replace />;
  const sub = chapter.subChapters.find((s) => s.id === subId);
  if (!sub) return <Navigate to={`/${aud.id}/${chapter.id}`} replace />;

  // Sync active slide to ?slide= query param (source slide number) and reset on sub change
  useEffect(() => {
    const requested = Number(searchParams.get("slide"));
    if (requested) {
      const idx = sub.slides.indexOf(requested);
      setActive(idx >= 0 ? idx : 0);
    } else {
      setActive(0);
    }
  }, [subId, chapterId, searchParams, sub.slides]);

  // Flat list of every slide across all chapters in this audience, so
  // prev/next steps through one slide at a time without skipping.
  const flatSlides = useMemo(
    () =>
      chapters.flatMap((c) =>
        c.subChapters.flatMap((s) =>
          s.slides.map((slide) => ({ chapter: c, sub: s, slide }))
        )
      ),
    [chapters]
  );

  const currentSlide = sub.slides[active];
  const flatIdx = flatSlides.findIndex(
    (f) => f.chapter.id === chapter.id && f.sub.id === sub.id && f.slide === currentSlide
  );
  const prevSlide = flatIdx > 0 ? flatSlides[flatIdx - 1] : null;
  const nextSlide =
    flatIdx >= 0 && flatIdx < flatSlides.length - 1 ? flatSlides[flatIdx + 1] : null;

  const goTo = (target: { chapter: { id: string }; sub: { id: string; slides: number[] }; slide: number } | null) => {
    if (!target) return;
    if (target.chapter.id === chapter.id && target.sub.id === sub.id) {
      setActive(target.sub.slides.indexOf(target.slide));
    } else {
      navigate(`/${aud.id}/${target.chapter.id}/${target.sub.id}?slide=${target.slide}`);
    }
  };

  // Keyboard navigation across slides + lightbox
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && lightbox) { setLightbox(false); return; }
      if (e.key === "ArrowRight") goTo(nextSlide);
      if (e.key === "ArrowLeft") goTo(prevSlide);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, nextSlide, prevSlide]);

  return (
    <div className="min-h-screen bg-background">
      <PlaybookHeader audience={aud.id as RouteAudienceId} onOpenResearch={() => setResearch(true)} showBack />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <nav className="mb-5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <Link to={`/${aud.id}`} className="hover:text-foreground">{aud.label}</Link>
          <span>/</span>
          <Link to={`/${aud.id}/${chapter.id}`} className="hover:text-foreground">
            Ch. {chapter.number} {chapter.title}
          </Link>
          <span>/</span>
          <span className="text-foreground">{sub.title}</span>
        </nav>

        <div className="mb-6 border-b border-border pb-5">
          <p className="text-xs uppercase tracking-[0.25em] text-accent">
            {chapter.icon} Chapter {chapter.number} · {chapter.title}
          </p>
          <h1 className="mt-2 font-serif text-2xl leading-[1.1] sm:text-4xl">{sub.title}</h1>
          <p className="mt-2 max-w-3xl text-base italic text-muted-foreground">{sub.blurb}</p>
        </div>

        {/* Slide viewer */}
        <div style={{ animation: "fadeUp 0.4s ease-out both" }}>
          <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="relative aspect-[16/9] w-full bg-secondary">
              <img
                key={currentSlide}
                src={SLIDE_IMAGE(currentSlide)}
                alt={`${sub.title}, slide ${currentSlide}`}
                className="absolute inset-0 size-full object-contain"
                loading="eager"
              />

              {/* Arrow controls — step through every slide, never skip */}
              <button
                onClick={() => goTo(prevSlide)}
                disabled={!prevSlide}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow transition-opacity hover:bg-background disabled:opacity-30"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => goTo(nextSlide)}
                disabled={!nextSlide}
                aria-label="Next slide"
                className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow transition-opacity hover:bg-background disabled:opacity-30"
              >
                <ChevronRight className="size-5" />
              </button>

              <button
                onClick={() => setLightbox(true)}
                aria-label="Open full screen"
                className="absolute right-3 top-3 grid size-9 place-items-center rounded-md bg-background/90 text-foreground shadow transition-colors hover:bg-background"
              >
                <Maximize2 className="size-4" />
              </button>

              <div className="absolute bottom-3 left-3 rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow">
                Slide {active + 1} / {sub.slides.length}
                <span className="ml-2 text-muted-foreground">· source p.{currentSlide}</span>
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          {sub.slides.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {sub.slides.map((n, i) => (
                <button
                  key={n}
                  onClick={() => setActive(i)}
                  className={`relative aspect-[16/9] w-32 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                    i === active
                      ? "border-accent shadow-md"
                      : "border-border opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Jump to slide ${i + 1}`}
                >
                  <img
                    src={SLIDE_IMAGE(n)}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                  <span className="absolute bottom-0 left-0 bg-background/85 px-1.5 py-0.5 text-[10px] font-medium">
                    {i + 1}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Global mini-map: position in the full 166-slide playbook */}
          <div className="mt-6 rounded-lg border border-border bg-card px-4 py-3">
            <div className="mb-1.5 flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
              <span>Position in full playbook</span>
              <span className="font-medium text-foreground">
                Slide {currentSlide} of {TOTAL_SOURCE_SLIDES}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${(currentSlide / TOTAL_SOURCE_SLIDES) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Slide prev / next — moves one slide at a time through the chapter */}
        <div className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
          {prevSlide ? (
            <button
              onClick={() => goTo(prevSlide)}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-accent"
            >
              <ArrowLeft className="size-4 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Previous slide</div>
                <div className="truncate text-sm font-medium">{prevSlide.sub.title} · p.{prevSlide.slide}</div>
              </div>
            </button>
          ) : <div />}
          {nextSlide ? (
            <button
              onClick={() => goTo(nextSlide)}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-right transition-colors hover:border-accent sm:flex-row-reverse"
            >
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Next slide</div>
                <div className="truncate text-sm font-medium">{nextSlide.sub.title} · p.{nextSlide.slide}</div>
              </div>
            </button>
          ) : <div />}
        </div>
      </main>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
          <img
            src={SLIDE_IMAGE(currentSlide)}
            alt=""
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {sub.slides.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((i) => Math.max(i - 1, 0)); }}
                disabled={active === 0}
                className="absolute left-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((i) => Math.min(i + 1, sub.slides.length - 1)); }}
                disabled={active === sub.slides.length - 1}
                className="absolute right-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronRight className="size-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                {active + 1} / {sub.slides.length} · source slide {currentSlide}
              </div>
            </>
          )}
        </div>
      )}

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
