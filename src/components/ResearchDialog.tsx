import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchPlaybook } from "@/lib/searchPlaybook";
import type { AudienceId } from "@/data/playbook";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audience: AudienceId | null;
}

const SUGGESTIONS = [
  "How do I select an offtaker?",
  "What does the commercial viability model track?",
  "When should we expand to new counties?",
  "How is impact measured?",
];

export function ResearchDialog({ open, onOpenChange, audience }: Props) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const hits = useMemo(() => searchPlaybook(query, audience, 6), [query, audience]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (chapterId: string, subId: string) => {
    onOpenChange(false);
    const base = audience ? `/${audience}` : "/all";
    navigate(`${base}/${chapterId}/${subId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <Search className="size-5 text-accent" />
            Search
          </DialogTitle>
          <DialogDescription>
            Type a keyword, we'll jump you to the most relevant sub-chapter.
          </DialogDescription>
        </DialogHeader>

        <div className="border-b border-border px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. how do we onboard a new offtaker?"
              className="pl-9 h-11"
            />
          </div>
          {!query && (
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-2 py-2">
          {query && hits.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No matches. Try different keywords (e.g. "RFP", "M&E", "fodder").
            </div>
          )}
          {hits.map((h) => (
            <button
              key={`${h.chapter.id}-${h.subChapter.id}`}
              onClick={() => go(h.chapter.id, h.subChapter.id)}
              className="group flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-secondary"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-base group-hover:bg-background">
                {h.chapter.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Chapter {h.chapter.number} · {h.chapter.title}
                </div>
                <div className="mt-0.5 font-medium">{h.subChapter.title}</div>
                <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {h.snippet}
                </div>
              </div>
              <ArrowRight className="mt-2 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
            </button>
          ))}
          {!query && (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              Searches across all chapters{audience ? ", filtered for your role" : ""}.
            </div>
          )}
        </div>

        <div className="border-t border-border bg-secondary/50 px-6 py-2 text-center text-[11px] text-muted-foreground">
          Press <kbd className="rounded border border-border bg-background px-1">Esc</kbd> to close
        </div>
      </DialogContent>
    </Dialog>
  );
}
