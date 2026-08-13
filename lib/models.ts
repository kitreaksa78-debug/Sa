export type ChatModel = {
  /** Stable id used by the UI and stored in conversations. */
  id: string
  /** Display name in the model selector. */
  name: string
  description: string
  /**
   * The Kie.ai model slug used in the request path:
   * https://api.kie.ai/{kieSlug}/v1/chat/completions
   * See https://kie.ai/market for the full list of available models/slugs.
   */
  kieSlug: string
}

export const MODELS: ChatModel[] = [
  {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    description: 'Most capable — great for complex tasks',
    kieSlug: 'gpt-5-2',
  },
  {
    id: 'gemini-3-pro',
    name: 'Gemini 3 Pro',
    description: 'Strong reasoning and long-form writing',
    kieSlug: 'gemini-3-pro',
  },
  {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash',
    description: 'Fast and efficient for everyday chats',
    kieSlug: 'gemini-3-flash',
  },
]

export const DEFAULT_MODEL = MODELS[0].id

export function isValidModel(id: string): boolean {
  return MODELS.some((m) => m.id === id)
}

/** Resolve a UI model id to its Kie.ai model slug, falling back to the default. */
export function getKieSlug(id?: string): string {
  const model = MODELS.find((m) => m.id === id) ?? MODELS[0]
  return model.kieSlug
}
