"use client";

import { create } from "zustand";

export type LogEntry = { id: string; text: string; ts: number };

type State = {
  logs: LogEntry[];
  append: (entry: { text: string; ts: number }) => void;
};

export const useLogStore = create<State>((set) => ({
  logs: [],
  append: (entry) =>
    set((s) => ({
      logs: [
        ...s.logs,
        { id: `${entry.ts}-${s.logs.length}`, text: entry.text, ts: entry.ts },
      ],
    })),
}));
