import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { getKieSlug } from '@/lib/models'

// Allow streaming responses up to 60 seconds
export const maxDuration = 60

const KIE_BASE_URL = 'https://api.kie.ai'

const SYSTEM_PROMPT = `You are a helpful, friendly AI assistant, similar to ChatGPT.
- Answer clearly and concisely, and expand with detail when the question warrants it.
- Use Markdown for structure: headings, bold, lists, tables, and fenced code blocks with language labels.
- When you show code, always wrap it in a fenced code block with the correct language.
- If you are unsure, say so rather than inventing facts.
- Respond in the same language the user writes in.`

/**
 * Kie.ai is OpenAI-compatible, but on failures it responds with HTTP 200 and a
 * JSON error body like {"code":401,"msg":"..."} instead of a real HTTP error
 * status. This wrapper detects that shape and converts it into a proper error
 * Response so the AI SDK surfaces a clean, catchable error.
 */
const kieFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init)
  const contentType = response.headers.get('content-type') ?? ''

  // Successful streaming responses are text/event-stream — pass them through.
  if (!contentType.includes('application/json')) {
    return response
  }

  const body = await response.text()
  try {
    const json = JSON.parse(body)
    // A Kie.ai error envelope: a numeric `code` that isn't a success code.
    if (
      json &&
      typeof json.code === 'number' &&
      json.code !== 200 &&
      json.code !== 0
    ) {
      const status =
        json.code >= 400 && json.code < 600 ? json.code : 502
      return new Response(
        JSON.stringify({
          error: {
            message: json.msg || `Kie.ai request failed (code ${json.code})`,
            code: json.code,
          },
        }),
        { status, headers: { 'content-type': 'application/json' } },
      )
    }
  } catch {
    // Not JSON we understand — fall through and return the original body.
  }

  return new Response(body, {
    status: response.status,
    headers: response.headers,
  })
}

function friendlyError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : String(error ?? 'Unknown error')
  const lower = message.toLowerCase()

  if (lower.includes('401') || lower.includes('unauthorized') || lower.includes('authentication')) {
    return 'Authentication with Kie.ai failed. Please check that KIE_API_KEY is set correctly.'
  }
  if (lower.includes('402') || lower.includes('quota') || lower.includes('insufficient') || lower.includes('credit') || lower.includes('balance')) {
    return 'Your Kie.ai account is out of credits or has a billing issue. Please top up at kie.ai.'
  }
  if (lower.includes('429') || lower.includes('rate limit')) {
    return 'Too many requests to Kie.ai. Please wait a moment and try again.'
  }
  if (lower.includes('404') || lower.includes('not found') || lower.includes('model')) {
    return 'The selected model is not available on Kie.ai. Try a different model.'
  }
  return 'Something went wrong talking to Kie.ai. Please try again.'
}

export async function POST(req: Request) {
  const apiKey = process.env.KIE_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'KIE_API_KEY is not configured. Add it in your project environment variables.',
      }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    )
  }

  const { messages, model }: { messages: UIMessage[]; model?: string } =
    await req.json()

  const kieSlug = getKieSlug(model)

  // Kie.ai puts the model in the request path:
  // https://api.kie.ai/{kieSlug}/v1/chat/completions
  const kie = createOpenAICompatible({
    name: 'kie',
    baseURL: `${KIE_BASE_URL}/${kieSlug}/v1`,
    headers: { Authorization: `Bearer ${apiKey}` },
    fetch: kieFetch,
  })

  const result = streamText({
    model: kie.chatModel(kieSlug),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse({
    onError: friendlyError,
  })
}
