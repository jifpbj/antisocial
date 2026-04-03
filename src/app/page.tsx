"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/platform-icon";
import { usePlatforms } from "@/hooks/use-platforms";
import { usePost, PostResultItem } from "@/hooks/use-post";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function PostResults({
  results,
  platforms,
}: {
  results: PostResultItem[];
  platforms: { id: string; name: string }[];
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Results</h3>
      <div className="space-y-1.5">
        {results.map((r) => {
          const p = platforms.find((pl) => pl.id === r.platformId);
          return (
            <div
              key={r.platformId}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                r.status === "success" && "border-emerald-500/30 bg-emerald-500/5",
                r.status === "manual" && "border-blue-500/30 bg-blue-500/5",
                r.status === "failure" && "border-destructive/30 bg-destructive/5"
              )}
            >
              <div className="flex items-center gap-2">
                <PlatformIcon
                  platform={r.platformId}
                  className="h-4 w-4 shrink-0"
                />
                <span className="font-medium">{p?.name ?? r.platformId}</span>
              </div>
              <div className="flex items-center gap-2">
                {r.status === "success" && (
                  <>
                    <Badge
                      variant="outline"
                      className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                    >
                      Sent
                    </Badge>
                    {r.externalUrl && (
                      <a
                        href={r.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        View
                      </a>
                    )}
                  </>
                )}
                {r.status === "manual" && (
                  <>
                    <Badge
                      variant="outline"
                      className="border-blue-500/50 text-blue-600 dark:text-blue-400"
                    >
                      Manual
                    </Badge>
                    {r.externalUrl && (
                      <a
                        href={r.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        Open
                      </a>
                    )}
                  </>
                )}
                {r.status === "failure" && (
                  <Badge
                    variant="outline"
                    className="border-destructive/50 text-destructive"
                    title={r.error}
                  >
                    Failed{r.error ? `: ${r.error}` : ""}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ComposePage() {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { platforms, loading } = usePlatforms();
  const { posting, results, submitPost, clearResults } = usePost();

  const connectedPlatforms = platforms.filter((p) => p.isConnected);
  const minMaxLength = connectedPlatforms
    .filter((p) => p.maxLength !== null)
    .reduce(
      (min, p) => (p.maxLength! < min ? p.maxLength! : min),
      Infinity
    );
  const charLimit = minMaxLength === Infinity ? null : minMaxLength;
  const overLimit = charLimit !== null && content.length > charLimit;

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.max(160, el.scrollHeight) + "px";
    }
  }, [content]);

  async function handlePost() {
    if (!content.trim() || connectedPlatforms.length === 0) return;
    clearResults();

    try {
      const res = await submitPost(content.trim());

      // Handle manual platforms — copy to clipboard and open URLs
      const manualResults = res.filter((r) => r.status === "manual");
      if (manualResults.length > 0) {
        await navigator.clipboard.writeText(content.trim());
        for (const r of manualResults) {
          if (r.externalUrl) {
            window.open(r.externalUrl, "_blank");
          }
        }
        toast.info("Text copied to clipboard for manual platforms");
      }

      const successCount = res.filter((r) => r.status === "success").length;
      const failCount = res.filter((r) => r.status === "failure").length;

      if (failCount === 0) {
        toast.success(
          `Posted to ${successCount + manualResults.length} platform${successCount + manualResults.length !== 1 ? "s" : ""}`
        );
      } else {
        toast.warning(`${successCount} succeeded, ${failCount} failed`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handlePost();
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="space-y-6">
        {/* Compose box */}
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (results) clearResults();
            }}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            className={cn(
              "w-full resize-none rounded-lg border bg-card p-4 text-base leading-relaxed",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "min-h-[160px]",
              overLimit && "ring-2 ring-destructive"
            )}
            disabled={posting}
          />

          {/* Character count + platform status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {loading ? (
                <span className="text-xs text-muted-foreground">
                  Loading platforms...
                </span>
              ) : (
                platforms.map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "relative rounded-md p-1 transition-opacity",
                      p.isConnected ? "opacity-100" : "opacity-25"
                    )}
                    title={`${p.name}: ${p.isConnected ? "Connected" : "Not connected"}`}
                  >
                    <PlatformIcon platform={p.id} className="h-4 w-4" />
                    {p.isConnected && (
                      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                ))
              )}
            </div>

            {charLimit !== null && (
              <span
                className={cn(
                  "text-xs tabular-nums",
                  overLimit
                    ? "text-destructive font-medium"
                    : "text-muted-foreground"
                )}
              >
                {content.length}/{charLimit}
              </span>
            )}
          </div>
        </div>

        {/* Post button */}
        <Button
          onClick={handlePost}
          disabled={
            posting ||
            !content.trim() ||
            connectedPlatforms.length === 0 ||
            overLimit
          }
          className="w-full h-11 text-base font-medium"
          size="lg"
        >
          {posting
            ? "Posting..."
            : connectedPlatforms.length === 0
              ? "Connect platforms to post"
              : `Post to ${connectedPlatforms.length} platform${connectedPlatforms.length !== 1 ? "s" : ""}`}
        </Button>

        {/* Keyboard shortcut hint */}
        {content.trim() && connectedPlatforms.length > 0 && !posting && (
          <p className="text-center text-xs text-muted-foreground">
            Press{" "}
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
              {typeof navigator !== "undefined" &&
              /Mac/.test(navigator.userAgent)
                ? "\u2318"
                : "Ctrl"}
              +Enter
            </kbd>{" "}
            to post
          </p>
        )}

        {/* Results */}
        {results && <PostResults results={results} platforms={platforms} />}
      </div>
    </div>
  );
}
