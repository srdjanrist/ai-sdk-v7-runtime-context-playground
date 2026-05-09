import { AsyncLocalStorage } from "node:async_hooks";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
  type UIMessageStreamWriter,
} from "ai";

export type LogDataParts = {
  log: { text: string; ts: number };
};

export type MyUIMessage = UIMessage<unknown, LogDataParts>;

const logContext = new AsyncLocalStorage<UIMessageStreamWriter<MyUIMessage>>();

const originalLog = console.log.bind(console);

function formatArg(arg: unknown): string {
  if (typeof arg === "string") return arg;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

console.log = (...args: unknown[]) => {
  originalLog(...args);
  const writer = logContext.getStore();
  if (!writer) return;
  writer.write({
    type: "data-log",
    data: { text: args.map(formatArg).join(" "), ts: Date.now() },
  });
};

export function streamWithLogs(
  execute: (writer: UIMessageStreamWriter<MyUIMessage>) => Promise<void> | void,
) {
  const stream = createUIMessageStream<MyUIMessage>({
    execute: async ({ writer }) => {
      await logContext.run(writer, async () => {
        await execute(writer);
      });
    },
  });
  return createUIMessageStreamResponse({ stream });
}
