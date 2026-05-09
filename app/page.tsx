"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Thread } from "@/components/assistant-ui/thread";
import { LogPanel } from "@/components/log-panel";
import { ContextPanel } from "@/components/context-panel";
import {
  AssistantRuntimeProvider,
  useAui,
  AuiProvider,
  Suggestions,
} from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { DefaultChatTransport } from "ai";
import { useLogStore } from "@/lib/log-store";
import { useContextStore } from "@/lib/context-store";

function ThreadWithSuggestions() {
  const aui = useAui({
    suggestions: Suggestions([
      {
        title: "What's the weather",
        label: "in Tokyo right now?",
        prompt: "What's the weather in Tokyo?",
      },
      {
        title: "Tell me a fun fact",
        label: "about any topic",
        prompt: "Tell me a fun fact about space.",
      },
    ]),
  });
  return (
    <AuiProvider value={aui}>
      <Thread />
    </AuiProvider>
  );
}

const LOG_PANEL_MIN = 240;
const LOG_PANEL_MAX = 800;
const LOG_PANEL_DEFAULT = 384;

export default function Home() {
  const [logPanelWidth, setLogPanelWidth] = useState(LOG_PANEL_DEFAULT);
  const draggingRef = useRef(false);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const next = window.innerWidth - e.clientX;
      setLogPanelWidth(Math.max(LOG_PANEL_MIN, Math.min(LOG_PANEL_MAX, next)));
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const onHandlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: async (opts) => {
          const snap = useContextStore.getState().snapshotForSend();
          if ("error" in snap) {
            throw new Error(snap.error);
          }
          return {
            body: {
              ...opts.body,
              runtimeContext: snap.runtimeContext,
              toolsContext: snap.toolsContext,
            },
          };
        },
      }),
    [],
  );

  const runtime = useChatRuntime({
    transport: transport as never,
    onData: (part) => {
      if (part.type === "data-log") {
        useLogStore
          .getState()
          .append(part.data as { text: string; ts: number });
      }
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full">
        <aside className="w-80 shrink-0 border-r">
          <ContextPanel />
        </aside>
        <div className="min-w-0 flex-1">
          <ThreadWithSuggestions />
        </div>
        <div
          onPointerDown={onHandlePointerDown}
          role="separator"
          aria-orientation="vertical"
          className="hover:bg-primary/40 w-1 shrink-0 cursor-col-resize bg-transparent transition-colors"
        />
        <aside
          className="shrink-0 border-l"
          style={{ width: logPanelWidth }}
        >
          <LogPanel />
        </aside>
      </div>
    </AssistantRuntimeProvider>
  );
}
