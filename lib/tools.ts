import { tool } from "ai";
import { z } from "zod";

export const toolRegistry = {
  get_current_weather: {
    tool: tool({
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
        console.log("weather tool api key:", weatherApiKey);

        return {
          location,
          temperature: 72 + Math.floor(Math.random() * 21) - 10,
        };
      },
    }),
    defaultContext: { weatherApiKey: "weather-123" } as Record<string, unknown>,
  },
} as const;

export const toolNames = Object.keys(toolRegistry) as Array<keyof typeof toolRegistry>;

export const defaultToolsContext: Record<string, Record<string, unknown>> =
  Object.fromEntries(
    Object.entries(toolRegistry).map(([name, entry]) => [name, entry.defaultContext]),
  );

type ToolsForStreamText = {
  [K in keyof typeof toolRegistry]: (typeof toolRegistry)[K]["tool"];
};

export const toolsForStreamText: ToolsForStreamText = Object.fromEntries(
  Object.entries(toolRegistry).map(([name, entry]) => [name, entry.tool]),
) as ToolsForStreamText;
