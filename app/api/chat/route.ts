import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  type JSONSchema7,
  streamText,
  convertToModelMessages,
  type UIMessage,
  tool,
  stepCountIs,
} from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    system,
    tools,
  }: {
    messages: UIMessage[];
    system?: string;
    tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
  } = await req.json();

  const result = streamText({
    model: openai("gpt-5-mini"),
    messages: await convertToModelMessages(messages),
    ...(system ? { system } : {}),
    stopWhen: stepCountIs(10),
    tools: {
      ...frontendTools(tools ?? {}),
      get_current_weather: tool({
        description: "Get the weather in a location",
        inputSchema: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        contextSchema: z.object({
          weatherApiKey: z.string().describe("The API key for the weather API"),
        }),
        execute: async (
          { location },
          { toolCallId, messages, abortSignal, context },
        ) => {
          const { weatherApiKey } = context;

          console.log("tool call:", toolCallId);
          console.log("messages available to tool:", messages.length);
          console.log("abortable:", abortSignal != null);
          console.log("weather tool api key:", weatherApiKey);

          return {
            location,
            temperature: 72 + Math.floor(Math.random() * 21) - 10,
          };
        },
      }),
    },
    runtimeContext: {
      somethingElse: "other-context",
    },
    toolsContext: {
      get_current_weather: {
        weatherApiKey: "weather-123",
      },
    },
    prepareStep: async ({ runtimeContext, toolsContext }) => {
      console.log("prepareStep runtimeContext:", runtimeContext);
      console.log("prepareStep toolsContext:", toolsContext);

      return {
        runtimeContext,
      };
    },
  });

  return result.toUIMessageStreamResponse();
}
