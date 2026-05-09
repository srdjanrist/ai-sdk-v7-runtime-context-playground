"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useContextStore } from "@/lib/context-store";
import { toolNames } from "@/lib/tools";

export function ContextPanel({
  collapsed,
  onToggleCollapsedAction,
}: {
  collapsed: boolean;
  onToggleCollapsedAction: () => void;
}) {
  const runtimeText = useContextStore((s) => s.runtimeText);
  const runtimeError = useContextStore((s) => s.runtimeError);
  const toolTexts = useContextStore((s) => s.toolTexts);
  const toolErrors = useContextStore((s) => s.toolErrors);
  const selectedTool = useContextStore((s) => s.selectedTool);
  const setRuntimeText = useContextStore((s) => s.setRuntimeText);
  const setToolText = useContextStore((s) => s.setToolText);
  const setSelectedTool = useContextStore((s) => s.setSelectedTool);
  const reset = useContextStore((s) => s.reset);
  const toggleRuntimeToolsDisabled = useContextStore(
    (s) => s.toggleRuntimeToolsDisabled,
  );

  const runtimeToolsDisabled = (() => {
    try {
      const parsed = JSON.parse(runtimeText);
      return (
        parsed != null &&
        typeof parsed === "object" &&
        (parsed as { tools?: unknown }).tools === "disabled"
      );
    } catch {
      return false;
    }
  })();

  if (collapsed) {
    return (
      <div className="bg-sidebar text-sidebar-foreground flex h-full flex-col items-center py-2">
        <button
          onClick={onToggleCollapsedAction}
          aria-label="Expand context panel"
          className="hover:bg-accent rounded-md p-1.5"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <span
          className="text-muted-foreground mt-3 text-xs uppercase tracking-wider"
          style={{ writingMode: "vertical-rl" }}
        >
          Context
        </span>
      </div>
    );
  }

  const currentToolText = toolTexts[selectedTool] ?? "";
  const currentToolError = toolErrors[selectedTool] ?? null;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="sticky top-0 flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Context</span>
          <button
            onClick={reset}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Reset
          </button>
        </div>
        <button
          onClick={onToggleCollapsedAction}
          aria-label="Collapse context panel"
          className="hover:bg-accent rounded-md p-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
        <section className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Runtime context
            </label>
            <button
              type="button"
              onClick={toggleRuntimeToolsDisabled}
              disabled={runtimeError !== null}
              aria-pressed={runtimeToolsDisabled}
              className={
                runtimeToolsDisabled
                  ? "rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive ring-1 ring-destructive/30 disabled:opacity-40"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent rounded-full border px-2 py-0.5 text-xs disabled:opacity-40"
              }
            >
              Tools: {runtimeToolsDisabled ? "disabled" : "enabled"}
            </button>
          </div>
          <textarea
            value={runtimeText}
            onChange={(e) => setRuntimeText(e.target.value)}
            spellCheck={false}
            className="min-h-32 resize-y rounded-md border bg-background p-2 font-mono text-xs"
          />
          {runtimeError ? (
            <span className="text-destructive text-xs">{runtimeError}</span>
          ) : (
            <span className="text-muted-foreground text-xs">JSON object</span>
          )}
        </section>

        <section className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tools context
          </label>
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            className="rounded-md border bg-background px-2 py-1 text-sm"
          >
            {toolNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <textarea
            value={currentToolText}
            onChange={(e) => setToolText(selectedTool, e.target.value)}
            spellCheck={false}
            className="min-h-32 resize-y rounded-md border bg-background p-2 font-mono text-xs"
          />
          {currentToolError ? (
            <span className="text-destructive text-xs">{currentToolError}</span>
          ) : (
            <span className="text-muted-foreground text-xs">
              JSON object passed as `toolsContext.{selectedTool}`
            </span>
          )}
        </section>
      </div>
    </div>
  );
}
