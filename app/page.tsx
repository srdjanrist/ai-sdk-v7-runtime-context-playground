"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { LogPanel } from "@/components/log-panel";
import {
  AssistantRuntimeProvider,
  useAui,
  AuiProvider,
  Suggestions,
} from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { useLogStore } from "@/lib/log-store";

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

export default function Home() {
  const runtime = useChatRuntime({
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
        <div className="min-w-0 flex-1">
          <ThreadWithSuggestions />
        </div>
        <aside className="w-96 shrink-0 border-l">
          <LogPanel />
        </aside>
      </div>
    </AssistantRuntimeProvider>
  );
}
