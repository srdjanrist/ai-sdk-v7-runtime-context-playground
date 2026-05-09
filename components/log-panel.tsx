"use client";

import { useEffect, useRef } from "react";
import { useLogStore, type LogEntry } from "@/lib/log-store";

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

export function LogPanel() {
  const logs = useLogStore((s) => s.logs);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 16;
  };

  useEffect(() => {
    if (!stickToBottom.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs.length]);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="sticky top-0 flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">Backend logs</span>
        <span className="text-muted-foreground text-xs">{logs.length}</span>
      </div>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="text-muted-foreground italic">
            Waiting for backend output...
          </div>
        ) : (
          logs.map((entry: LogEntry) => (
            <div key={entry.id} className="whitespace-pre-wrap break-words">
              <span className="text-muted-foreground">
                [{formatTime(entry.ts)}]
              </span>{" "}
              <span>{entry.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
