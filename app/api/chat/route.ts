import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  type JSONSchema7,
  streamText,
  convertToModelMessages,
  stepCountIs,
} from "ai";
import { streamWithLogs, type MyUIMessage } from "@/lib/log-stream";
import { defaultRuntimeContext } from "@/lib/runtime-defaults";
import { defaultToolsContext, toolsForStreamText } from "@/lib/tools";

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    system,
    tools,
    runtimeContext,
    toolsContext,
  }: {
    messages: MyUIMessage[];
    system?: string;
    tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
    runtimeContext?: Record<string, unknown>;
    toolsContext?: Record<string, Record<string, unknown>>;
  } = await req.json();

  return streamWithLogs(async (writer) => {
    const result = streamText({
      model: openai("gpt-5-mini"),
      messages: await convertToModelMessages(messages),
      ...(system ? { system } : {}),
      stopWhen: stepCountIs(10),
      tools: {
        ...frontendTools(tools ?? {}),
        ...toolsForStreamText,
      },
      runtimeContext: runtimeContext ?? defaultRuntimeContext,
      toolsContext: (toolsContext ?? defaultToolsContext) as {
        get_current_weather: { weatherApiKey: string };
      },
      prepareStep: async (all) => {
        const { runtimeContext, toolsContext, ...rest } = all;
        console.log("prepareStep runtimeContext:", runtimeContext);
        console.log("prepareStep toolsContext:", toolsContext);

        console.log("rest")
        console.log(rest)
        await new Promise((resolve) => setTimeout(resolve, 3000));

        return {
          runtimeContext,
        };
      },
    });

    writer.merge(result.toUIMessageStream());
  });
}
