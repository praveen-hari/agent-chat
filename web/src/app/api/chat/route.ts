/**
 * AI SDK API Route — handles chat messages with streaming, tools, and reasoning.
 *
 * Demonstrates:
 * - streamText with OpenAI provider
 * - Multi-step tool calling (weather, calculator, web search)
 * - Reasoning tokens forwarding
 * - Message metadata (timestamps, token usage)
 */

import {
  streamText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  tool,
  isStepCount,
} from 'ai';
import type { UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, model: modelId }: { messages: UIMessage[]; model?: string } =
    await req.json();

  const model = openai(modelId || 'gpt-4o-mini');

  const result = streamText({
    model,
    instructions: `You are a helpful AI coding assistant. You can:
- Answer questions about code and programming
- Use tools to get weather, perform calculations, and search the web
- Break down complex tasks into steps
- Provide code examples with syntax highlighting

When asked about the weather, use the weather tool.
When asked to calculate something, use the calculator tool.
Be concise but thorough. Use markdown formatting for code blocks.`,
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(5),
    tools: {
      weather: tool({
        description: 'Get the current weather for a location',
        inputSchema: z.object({
          location: z.string().describe('City and optional country, e.g., "London, UK"'),
        }),
        execute: async ({ location }) => {
          // Simulated weather data
          const conditions = ['Sunny', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Clear'];
          const condition = conditions[Math.floor(Math.random() * conditions.length)];
          const temperature = Math.round(Math.random() * 30 + 5);
          const humidity = Math.round(Math.random() * 60 + 30);

          return {
            location,
            temperature: `${temperature}°C / ${Math.round(temperature * 1.8 + 32)}°F`,
            condition,
            humidity: `${humidity}%`,
            wind: `${Math.round(Math.random() * 30 + 5)} km/h`,
          };
        },
      }),

      calculator: tool({
        description: 'Perform a mathematical calculation',
        inputSchema: z.object({
          expression: z.string().describe('The math expression to evaluate, e.g., "2 + 2"'),
        }),
        execute: async ({ expression }) => {
          try {
            // Safe math evaluation (no eval)
            const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
            const result = Function(`"use strict"; return (${sanitized})`)();
            return { expression, result: String(result) };
          } catch {
            return { expression, result: 'Error: Invalid expression' };
          }
        },
      }),

      searchWeb: tool({
        description: 'Search the web for current information on a topic',
        inputSchema: z.object({
          query: z.string().describe('The search query'),
        }),
        execute: async ({ query }) => {
          // Simulated search results
          return {
            query,
            results: [
              {
                title: `Latest results for "${query}"`,
                snippet: `Here are the most relevant findings about ${query}. This is a simulated search result for demonstration purposes.`,
                url: `https://example.com/search?q=${encodeURIComponent(query)}`,
              },
              {
                title: `${query} - Wikipedia`,
                snippet: `${query} is a topic with many interesting aspects. For the full article, visit the link.`,
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
              },
            ],
          };
        },
      }),
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      sendReasoning: true,
      messageMetadata: ({ part }) => {
        if (part.type === 'start') {
          return { createdAt: Date.now() };
        }
        if (part.type === 'finish') {
          return {
            completedAt: Date.now(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            totalTokens: (part.totalUsage as any)?.totalTokens,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            promptTokens: (part.totalUsage as any)?.promptTokens,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            completionTokens: (part.totalUsage as any)?.completionTokens,
          };
        }
      },
    }),
  });
}
