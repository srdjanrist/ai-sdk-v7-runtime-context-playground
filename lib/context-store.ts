"use client";

import { create } from "zustand";
import { defaultRuntimeContext } from "./runtime-defaults";
import { defaultToolsContext, toolNames } from "./tools";

const stringify = (v: unknown) => JSON.stringify(v, null, 2);

function tryParse(text: string): { ok: true; value: object } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(text);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, error: "Must be a JSON object" };
    }
    return { ok: true, value: parsed as object };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

type Snapshot =
  | { runtimeContext: object; toolsContext: Record<string, object> }
  | { error: string };

type State = {
  runtimeText: string;
  runtimeError: string | null;
  toolTexts: Record<string, string>;
  toolErrors: Record<string, string | null>;
  selectedTool: string;
  setRuntimeText: (v: string) => void;
  setToolText: (name: string, v: string) => void;
  setSelectedTool: (name: string) => void;
  snapshotForSend: () => Snapshot;
};

const initialToolTexts: Record<string, string> = Object.fromEntries(
  Object.entries(defaultToolsContext).map(([n, v]) => [n, stringify(v)]),
);
const initialToolErrors: Record<string, string | null> = Object.fromEntries(
  toolNames.map((n) => [n, null]),
);

export const useContextStore = create<State>((set, get) => ({
  runtimeText: stringify(defaultRuntimeContext),
  runtimeError: null,
  toolTexts: initialToolTexts,
  toolErrors: initialToolErrors,
  selectedTool: toolNames[0] ?? "",

  setRuntimeText: (v) => {
    const r = tryParse(v);
    set({ runtimeText: v, runtimeError: r.ok ? null : r.error });
  },

  setToolText: (name, v) => {
    const r = tryParse(v);
    set((s) => ({
      toolTexts: { ...s.toolTexts, [name]: v },
      toolErrors: { ...s.toolErrors, [name]: r.ok ? null : r.error },
    }));
  },

  setSelectedTool: (name) => set({ selectedTool: name }),

  snapshotForSend: () => {
    const s = get();
    const runtime = tryParse(s.runtimeText);
    if (!runtime.ok) return { error: `Runtime context: ${runtime.error}` };

    const toolsContext: Record<string, object> = {};
    for (const name of toolNames) {
      const text = s.toolTexts[name] ?? "{}";
      const r = tryParse(text);
      if (!r.ok) return { error: `Tool "${name}" context: ${r.error}` };
      toolsContext[name] = r.value;
    }
    return { runtimeContext: runtime.value, toolsContext };
  },
}));
