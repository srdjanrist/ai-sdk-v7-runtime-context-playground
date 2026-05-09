"use client";

import { useContextStore } from "@/lib/context-store";
import { toolNames } from "@/lib/tools";

export function ContextPanel() {
  const runtimeText = useContextStore((s) => s.runtimeText);
  const runtimeError = useContextStore((s) => s.runtimeError);
  const toolTexts = useContextStore((s) => s.toolTexts);
  const toolErrors = useContextStore((s) => s.toolErrors);
  const selectedTool = useContextStore((s) => s.selectedTool);
  const setRuntimeText = useContextStore((s) => s.setRuntimeText);
  const setToolText = useContextStore((s) => s.setToolText);
  const setSelectedTool = useContextStore((s) => s.setSelectedTool);

  const currentToolText = toolTexts[selectedTool] ?? "";
  const currentToolError = toolErrors[selectedTool] ?? null;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="sticky top-0 border-b px-3 py-2">
        <span className="text-sm font-medium">Context</span>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
        <section className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Runtime context
          </label>
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
