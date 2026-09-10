/**
 * OpenAI Agents SDK API Route
 *
 * Runs an agent loop with tools and multi-agent handoffs.
 * Streams SSE events to the client.
 *
 * Event types from @openai/agents:
 * - raw_model_stream_event → text deltas from the LLM
 * - run_item_stream_event → tool_called, tool_output, handoff_occurred, etc.
 * - agent_updated_stream_event → agent changed (handoff)
 */

import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// ─── Tools ───

const getWeather = tool({
  name: 'get_weather',
  description: 'Get the current weather for a city.',
  parameters: z.object({
    location: z.string().describe('City name, e.g. "Tokyo, Japan"'),
  }),
  async execute({ location }) {
    const conditions = ['Sunny', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Clear'];
    const temp = Math.round(Math.random() * 30 + 5);
    return JSON.stringify({
      location,
      temperature: `${temp}°C / ${Math.round(temp * 1.8 + 32)}°F`,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      humidity: `${Math.round(Math.random() * 60 + 30)}%`,
    });
  },
});

const calculator = tool({
  name: 'calculator',
  description: 'Evaluate a math expression.',
  parameters: z.object({
    expression: z.string().describe('Math expression, e.g. "2 + 2"'),
  }),
  async execute({ expression }) {
    try {
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      return JSON.stringify({ expression, result: String(result) });
    } catch {
      return JSON.stringify({ expression, error: 'Invalid expression' });
    }
  },
});

const searchWeb = tool({
  name: 'search_web',
  description: 'Search the web for information on a topic.',
  parameters: z.object({
    query: z.string().describe('The search query'),
  }),
  async execute({ query }) {
    return JSON.stringify({
      query,
      results: [
        { title: `Results for "${query}"`, snippet: `Latest findings about ${query}. This is a simulated result.` },
        { title: `${query} - Reference`, snippet: `Comprehensive overview of ${query}.` },
      ],
    });
  },
});

// ─── Specialist Agents ───

const codeAgent = new Agent({
  name: 'Code Assistant',
  instructions: `You are an expert code assistant. Write clean, well-documented code.
Always use markdown code blocks with language tags. Explain your code briefly.`,
  model: 'gpt-4.1-mini',
});

const researchAgent = new Agent({
  name: 'Research Assistant',
  instructions: `You are a research assistant. Use search_web to find information.
Summarize findings clearly with sources.`,
  model: 'gpt-4.1-mini',
  tools: [searchWeb],
});

// ─── Main Agent Factory ───

function createMainAgent(model: string) {
  return Agent.create({
    name: 'AI Assistant',
    instructions: `You are a helpful AI assistant with access to tools and specialist agents.
- Use get_weather for weather questions
- Use calculator for math
- Hand off to Code Assistant for coding tasks
- Hand off to Research Assistant for research/search tasks
- Answer general questions directly
Be concise. Use markdown formatting.`,
    model,
    tools: [getWeather, calculator],
    handoffs: [codeAgent, researchAgent],
  });
}

// ─── SSE Stream Handler ───

export async function POST(req: Request) {
  const { message, history, model: modelId } = await req.json();
  const agent = createMainAgent(modelId || 'gpt-4.1-mini');

  const input = [
    ...(history || []),
    { role: 'user' as const, content: message },
  ];

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const stream = await run(agent, input, { stream: true });

        let currentAgentName = 'AI Assistant';
        let fullText = '';

        for await (const event of stream) {
          // Agent handoff
          if (event.type === 'agent_updated_stream_event') {
            currentAgentName = event.agent?.name || 'AI Assistant';
            send({ type: 'agent', name: currentAgentName });
          }

          // Text streaming from LLM
          if (event.type === 'raw_model_stream_event') {
            const data = event.data as Record<string, unknown>;
            if (data.type === 'output_text_delta') {
              const delta = (data.delta as string) || '';
              fullText += delta;
              send({ type: 'text_delta', delta });
            }
          }

          // Tool & handoff events
          if (event.type === 'run_item_stream_event') {
            const item = event.item as unknown as Record<string, unknown>;

            if (event.name === 'tool_called') {
              send({
                type: 'tool_start',
                id: (item.callId as string) || `tc-${Date.now()}`,
                name: (item.name as string) || 'unknown',
                args: JSON.stringify(item.arguments || {}),
              });
            }

            if (event.name === 'tool_output') {
              send({
                type: 'tool_end',
                id: (item.callId as string) || '',
                output: typeof item.output === 'string' ? item.output : JSON.stringify(item.output),
              });
            }

            if (event.name === 'handoff_occurred') {
              send({
                type: 'handoff',
                from: currentAgentName,
                to: (item as Record<string, unknown>).targetAgent
                  ? String((item as Record<string, unknown>).targetAgent)
                  : 'specialist',
              });
            }
          }
        }

        // Completion
        await stream.completed;
        send({
          type: 'done',
          text: stream.finalOutput || fullText,
          agent: stream.lastAgent?.name || currentAgentName,
        });

        controller.close();
      } catch (error) {
        send({
          type: 'error',
          message: error instanceof Error ? error.message : 'Agent run failed',
        });
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
