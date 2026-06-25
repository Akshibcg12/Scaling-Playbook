import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowLeft, BookOpen, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRouteAudience, LAST_UPDATED, type RouteAudienceId } from "@/data/playbook";
import { AIBotDialog } from "@/components/AIBotDialog";

interface Props {
  audience?: RouteAudienceId | null;
  onOpenResearch: () => void;
  showBack?: boolean;
}

export function PlaybookHeader({ audience, onOpenResearch, showBack }: Props) {
  const navigate = useNavigate();
  const [aibot, setAibot] = useState(false);
  const aud = audience ? getRouteAudience(audience) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        {showBack ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1 -ml-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        ) : null}

        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </span>
          <span className="font-serif text-lg leading-none">
            MTLDK <span className="text-muted-foreground">Playbook</span>
          </span>
          <span className="ml-1 hidden rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:inline-block">
            Updated {LAST_UPDATED}
          </span>
        </Link>

        <div className="flex-1" />

        {aud ? (
          <Link
            to="/select"
            className="hidden items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm transition-colors hover:border-accent sm:flex"
          >
            <span className="text-base leading-none">{aud.icon}</span>
            <span className="font-medium">{aud.label}</span>
            <span className="text-xs text-muted-foreground">switch ↻</span>
          </Link>
        ) : null}

        <Button onClick={onOpenResearch} size="sm" variant="outline" className="gap-2">
          <Search className="size-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>

        <Button onClick={() => setAibot(true)} size="sm" className="gap-2">
          <Bot className="size-4" />
          <span className="hidden sm:inline">AI bot</span>
        </Button>
      </div>
      <AIBotDialog open={aibot} onOpenChange={setAibot} />
    </header>
  );
}
