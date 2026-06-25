import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Bot, Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How do I select an offtaker?",
  "What does the commercial viability model track?",
  "How is impact measured?",
  "What are the main risks and mitigations?",
];

export function AIBotDialog({ open, onOpenChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setStreaming(true);

    // Add empty assistant placeholder
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-playbook`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 429) {
          toast({ title: "Too many requests", description: "Slow down a moment and try again.", variant: "destructive" });
        } else if (res.status === 402) {
          toast({ title: "AI credits exhausted", description: "Add credits in Settings → Workspace → Usage.", variant: "destructive" });
        } else {
          toast({ title: "AI error", description: errText.slice(0, 200), variant: "destructive" });
        }
        setMessages((m) => m.slice(0, -1));
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const payload = t.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {
            // ignore
          }
        }
      }
    } catch (e) {
      toast({ title: "Network error", description: String(e), variant: "destructive" });
      setMessages((m) => m.slice(0, -1));
    } finally {
      setStreaming(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleLinkClick = (href: string) => {
    // playbook://chapterId/subChapterId[/slideNumber]
    const match = href.match(/^playbook:\/\/([^/]+)\/([^/]+)(?:\/(\d+))?$/);
    if (match) {
      onOpenChange(false);
      const [, chap, sub, slide] = match;
      navigate(`/all/${chap}/${sub}${slide ? `?slide=${slide}` : ""}`);
      return false;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <Bot className="size-5 text-accent" />
            AI bot
          </DialogTitle>
          <DialogDescription>
            Ask anything about the playbook. Get a summary with links to the relevant sub-chapters.
          </DialogDescription>
        </DialogHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Try one of these:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i}>
                {m.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-foreground prose-headings:font-serif prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground">
                    {m.content ? (
                      <ReactMarkdown
                        urlTransform={(url) => url}
                        components={{
                          a: ({ href, children }) => {
                            if (href?.startsWith("playbook://")) {
                              return (
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleLinkClick(href);
                                  }}
                                  className="cursor-pointer font-medium text-accent hover:underline"
                                >
                                  {children}
                                </a>
                              );
                            }
                            return (
                              <a href={href} target="_blank" rel="noreferrer">
                                {children}
                              </a>
                            );
                          },
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Thinking…
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border bg-secondary/30 px-4 py-3">
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask the playbook anything…"
              rows={1}
              className="min-h-[44px] resize-none bg-background"
              disabled={streaming}
            />
            <Button
              onClick={() => send(input)}
              disabled={streaming || !input.trim()}
              size="icon"
              className="size-11 shrink-0"
            >
              {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            AI may be imprecise — always confirm against the linked sub-chapter.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
