// Define available AI providers and models
export type Provider = 'zai' | 'openai' | 'anthropic' | 'ollama'

export interface ModelInfo {
  id: string
  name: string
  provider: Provider
  description: string
  badge?: string
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: 'glm-4.5',
    name: 'GLM-4.5',
    provider: 'zai',
    description: 'نموذج Z.ai الأحدث والأقوى — مجاني ومتاح فوراً',
    badge: 'مجاني',
  },
  {
    id: 'glm-4.5-air',
    name: 'GLM-4.5 Air',
    provider: 'zai',
    description: 'نسخة خفيفة وسريعة للاستجابة الفورية',
    badge: 'سريع',
  },
  {
    id: 'glm-4.5v',
    name: 'GLM-4.5V',
    provider: 'zai',
    description: 'نموذج متعدد الوسائط — يدعم الصور',
    badge: 'رؤية',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'نموذج OpenAI الأقوى — يحتاج مفتاح API',
    badge: 'OpenAI',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'نسخة اقتصادية وسريعة من GPT-4o',
    badge: 'اقتصادي',
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'إصدار Turbo من GPT-4',
    badge: 'OpenAI',
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'نموذج Claude الأحدث — يحتاج مفتاح API',
    badge: 'Anthropic',
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'أقوى نموذج Claude للكتابة والتحليل',
    badge: 'Anthropic',
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    description: 'نسخة سريعة واقتصادية من Claude',
    badge: 'سريع',
  },
  {
    id: 'llama3.2',
    name: 'Llama 3.2',
    provider: 'ollama',
    description: 'نموذج مفتوح المصدر — يحتاج Ollama محلي',
    badge: 'محلي',
  },
  {
    id: 'qwen2.5',
    name: 'Qwen 2.5',
    provider: 'ollama',
    description: 'نموذج Alibaba مفتوح المصدر — يدعم العربية بقوة',
    badge: 'محلي',
  },
]

export function getModelsByProvider(provider: Provider): ModelInfo[] {
  return AVAILABLE_MODELS.filter(m => m.provider === provider)
}

export function getModelInfo(id: string): ModelInfo | undefined {
  return AVAILABLE_MODELS.find(m => m.id === id)
}

export const PROVIDER_LABELS: Record<Provider, string> = {
  zai: 'Z.ai (مجاني)',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  ollama: 'Ollama (محلي)',
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// AI provider clients
export async function streamZai(
  model: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number,
  onChunk: (text: string) => void
): Promise<void> {
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()

  // Convert messages to the format Z.ai expects
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content,
  }))

  const response = await zai.chat.completions.create({
    model,
    messages: formattedMessages,
    temperature,
    max_tokens: maxTokens,
    stream: true,
  })

  for await (const chunk of response) {
    const delta = chunk.choices?.[0]?.delta?.content
    if (delta) {
      onChunk(delta)
    }
  }
}

export async function streamOpenAI(
  model: string,
  apiKey: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number,
  onChunk: (text: string) => void
): Promise<void> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error: ${res.status} - ${err}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim()
        if (data === '[DONE]') return
        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) onChunk(delta)
        } catch {
          // skip
        }
      }
    }
  }
}

export async function streamAnthropic(
  model: string,
  apiKey: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number,
  onChunk: (text: string) => void
): Promise<void> {
  // Extract system message (Anthropic uses separate system field)
  const systemMessage = messages.find(m => m.role === 'system')?.content || ''
  const chatMessages = messages.filter(m => m.role !== 'system')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: systemMessage,
      messages: chatMessages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error: ${res.status} - ${err}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim()
        try {
          const parsed = JSON.parse(data)
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            onChunk(parsed.delta.text)
          }
        } catch {
          // skip
        }
      }
    }
  }
}

export async function streamOllama(
  model: string,
  baseUrl: string,
  messages: ChatMessage[],
  temperature: number,
  onChunk: (text: string) => void
): Promise<void> {
  const url = baseUrl.replace(/\/$/, '') + '/api/chat'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: { temperature },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Ollama API error: ${res.status} - ${err}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.trim()) {
        try {
          const parsed = JSON.parse(line)
          if (parsed.message?.content) {
            onChunk(parsed.message.content)
          }
        } catch {
          // skip
        }
      }
    }
  }
}
