import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import type { CvData, Provider } from '@/lib/cv-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `أنت مساعد متخصص في إنشاء السير الذاتية الاحترافية. مهمتك تحويل النص الخام (بيانات مهنية غير مرتبة) إلى سيرة ذاتية ثنائية اللغة (عربية + إنجليزية) بتنسيق JSON.

قواعد صارمة:
1. استخرج كل المعلومات من النص الأصلي فقط — لا تبتكر أي حقائق غير موجودة
2. أنشئ نسختين: عربية (ar) وإنجليزية (en) لكل حقل نصي
3. ترجم الأسماء العلمية والمصطلحات بدقة
4. اكتب ملخصاً مهنياً (summary) جذاباً من 2-3 جمل بناءً على الخبرات
5. نظّم المهارات وحدّد مستوى كل مهارة: beginner/intermediate/advanced/expert
6. إذا كانت التواريخ غير واضحة، استخدم تنسيق YYYY-MM أو اكتب "حتى الآن" للوظيفة الحالية
7. أضف اللغات بمستوياتها (Native/Advanced/Intermediate/Beginner)
8. لا تترك أي حقل فارغاً — استخدم سلسلة فارغة "" إذا لم تتوفر معلومة

أعد JSON صالح فقط بهذا الهيكل بالضبط:
{
  "name": { "ar": "...", "en": "..." },
  "title": { "ar": "...", "en": "..." },
  "email": "...",
  "phone": "...",
  "location": { "ar": "...", "en": "..." },
  "website": "",
  "linkedin": "",
  "github": "",
  "summary": { "ar": "...", "en": "..." },
  "experience": [
    {
      "company": { "ar": "...", "en": "..." },
      "position": { "ar": "...", "en": "..." },
      "startDate": "2020-01",
      "endDate": "حتى الآن",
      "location": { "ar": "...", "en": "..." },
      "description": { "ar": "...", "en": "..." },
      "achievements": ["...", "..."]
    }
  ],
  "education": [
    {
      "institution": { "ar": "...", "en": "..." },
      "degree": { "ar": "...", "en": "..." },
      "field": { "ar": "...", "en": "..." },
      "startDate": "2015-09",
      "endDate": "2019-05",
      "gpa": "",
      "description": { "ar": "", "en": "" }
    }
  ],
  "skills": [
    { "name": { "ar": "JavaScript", "en": "JavaScript" }, "level": "expert" }
  ],
  "languages": [
    { "name": { "ar": "العربية", "en": "Arabic" }, "level": { "ar": "اللغة الأم", "en": "Native" } }
  ],
  "certifications": [
    { "name": { "ar": "...", "en": "..." }, "issuer": { "ar": "...", "en": "..." }, "date": "2023-08" }
  ],
  "projects": [],
  "courses": []
}

أعد JSON فقط بدون أي شرح أو نص إضافي.`

// ─── Z.ai (direct fetch, works on Vercel via env vars) ───
async function callZai(model: string, text: string, temperature: number): Promise<string> {
  // Trim and sanitize ZAI_BASE_URL — Vercel env vars sometimes contain trailing whitespace/newlines
  const rawBaseUrl = (process.env.ZAI_BASE_URL || '').trim()
  const baseUrl = rawBaseUrl || 'https://internal-api.z.ai/v1'

  // Validate URL — prevent "Failed to parse URL" errors
  let parsedUrl: URL
  try {
    parsedUrl = new URL(`${baseUrl}/chat/completions`)
  } catch (e: any) {
    throw new Error(`ZAI_BASE_URL غير صالح: "${baseUrl}". تأكد من إضافته بصيغة https://internal-api.z.ai/v1 بدون فراغات.`)
  }

  const apiKey = (process.env.ZAI_API_KEY || '').trim()
  const token = (process.env.ZAI_TOKEN || '').trim()
  const userId = (process.env.ZAI_USER_ID || '').trim()
  const chatId = (process.env.ZAI_CHAT_ID || '').trim()

  if (!apiKey && !token) {
    throw new Error('بيانات اعتماد Z.ai غير مُهيأة. أضف ZAI_TOKEN و ZAI_USER_ID في متغيرات البيئة على Vercel.')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`
  if (token) headers['x-api-token'] = token

  const body: any = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `حلّل هذا النص وأنشئ سيرة ذاتية ثنائية اللغة:\n\n${text}` },
    ],
    temperature,
    max_tokens: 4000,
    stream: false,
  }
  if (userId) body.user_id = userId
  if (chatId) body.chat_id = chatId

  const res = await fetch(parsedUrl.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Z.ai API error ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

// ─── OpenAI ───
async function callOpenAI(model: string, apiKey: string, text: string, temperature: number): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `حلّل هذا النص وأنشئ سيرة ذاتية ثنائية اللغة:\n\n${text}` }
      ],
      temperature,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`OpenAI error ${res.status}: ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.choices[0]?.message?.content || ''
}

// ─── Anthropic ───
async function callAnthropic(model: string, apiKey: string, text: string, temperature: number): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `حلّل هذا النص وأنشئ سيرة ذاتية ثنائية اللغة:\n\n${text}` }
      ],
      temperature,
      max_tokens: 4000,
    }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`Anthropic error ${res.status}: ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

// ─── Google Gemini (v1beta generateContent endpoint) ───
// Modern Gemini model names (as of 2026) — old names like "gemini-1.5-flash" return 404
const GEMINI_MODEL_ALIASES: Record<string, string> = {
  // Legacy aliases → modern names (auto-fallback)
  'gemini-1.5-flash': 'gemini-2.0-flash',
  'gemini-1.5-pro': 'gemini-2.5-pro',
  'gemini-2.0-flash-exp': 'gemini-2.0-flash',
  // Modern names pass through
  'gemini-2.0-flash': 'gemini-2.0-flash',
  'gemini-2.5-flash': 'gemini-2.5-flash',
  'gemini-2.5-pro': 'gemini-2.5-pro',
  'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
}

async function callGemini(model: string, apiKey: string, text: string, temperature: number): Promise<string> {
  // Resolve legacy model names → current supported ones
  const resolvedModel = GEMINI_MODEL_ALIASES[model] || model

  // Try the resolved model first, fall back to gemini-2.0-flash if 404
  const modelsToTry = resolvedModel !== 'gemini-2.0-flash'
    ? [resolvedModel, 'gemini-2.0-flash']
    : ['gemini-2.0-flash']

  let lastError = ''
  for (const modelName of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: `حلّل هذا النص وأنشئ سيرة ذاتية ثنائية اللغة:\n\n${text}` }],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: 4000,
            responseMimeType: 'application/json',
          },
        }),
      })

      if (!res.ok) {
        const err = await res.text().catch(() => '')
        // If 404 (model not found), try next model
        if (res.status === 404 && modelName !== modelsToTry[modelsToTry.length - 1]) {
          lastError = `model "${modelName}" returned 404`
          continue
        }
        throw new Error(`Gemini error ${res.status}: ${err.slice(0, 300)}`)
      }

      const data = await res.json()

      if (data.error) {
        // If model not found error, try next model
        if (data.error.status === 'NOT_FOUND' && modelName !== modelsToTry[modelsToTry.length - 1]) {
          lastError = data.error.message || 'NOT_FOUND'
          continue
        }
        throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`)
      }

      const content = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || ''
      if (!content) {
        throw new Error('Gemini returned empty response. ' + JSON.stringify(data).slice(0, 300))
      }
      return content
    } catch (e: any) {
      // If it's a 404-like error and we have more models to try, continue
      if (modelName !== modelsToTry[modelsToTry.length - 1] && (
        e.message?.includes('404') || e.message?.includes('NOT_FOUND')
      )) {
        lastError = e.message
        continue
      }
      throw e
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError}`)
}

// ─── Ollama (local) ───
async function callOllama(model: string, baseUrl: string, text: string, temperature: number): Promise<string> {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  const res = await fetch(`${cleanBaseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `حلّل هذا النص وأنشئ سيرة ذاتية ثنائية اللغة:\n\n${text}` }
      ],
      stream: false,
      options: { temperature },
      format: 'json',
    }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`Ollama error ${res.status}: ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.message?.content || ''
}

// ─── JSON parser (resilient) ───
function parseJson(content: string): CvData | null {
  let cleaned = content.trim()
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
  if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
  cleaned = cleaned.trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        return null
      }
    }
    return null
  }
}

// ─── Provider labels for error messages ───
const PROVIDER_NAMES: Record<Provider, string> = {
  zai: 'Z.ai GLM',
  openai: 'OpenAI',
  anthropic: 'Anthropic Claude',
  gemini: 'Google Gemini',
  ollama: 'Ollama',
}

// ─── Main POST handler ───
export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const { text, provider, model, template, font, accentColor } = await req.json()

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json(
        { error: 'النص قصير جداً. أضف معلوماتك المهنية.' },
        { status: 400 }
      )
    }

    const settings = await db.settings.findUnique({ where: { userId: user.id } })
    const useProvider = (provider || settings?.defaultProvider || 'zai') as Provider
    const useModel = model || settings?.defaultModel || 'glm-4.5'
    const temperature = settings?.temperature ?? 0.4

    let rawContent = ''

    // === Use ONLY the selected provider — no silent fallback ===
    // If user explicitly selects Gemini/OpenAI/Claude, use only that.
    // Show clear error if it fails (don't hide behind Z.ai fallback).
    try {
      switch (useProvider) {
        case 'zai':
          rawContent = await callZai(useModel, text, temperature)
          break
        case 'openai':
          if (!settings?.openaiKey) {
            throw new Error('مفتاح OpenAI غير مُهيأ. اذهب إلى "إعدادات API" وأضف مفتاحك.')
          }
          rawContent = await callOpenAI(useModel, settings.openaiKey, text, temperature)
          break
        case 'anthropic':
          if (!settings?.anthropicKey) {
            throw new Error('مفتاح Anthropic غير مُهيأ. اذهب إلى "إعدادات API" وأضف مفتاحك.')
          }
          rawContent = await callAnthropic(useModel, settings.anthropicKey, text, temperature)
          break
        case 'gemini':
          if (!settings?.geminiKey) {
            throw new Error('مفتاح Google Gemini غير مُهيأ. اذهب إلى "إعدادات API" وأضف مفتاحك.')
          }
          rawContent = await callGemini(useModel, settings.geminiKey, text, temperature)
          break
        case 'ollama':
          rawContent = await callOllama(
            useModel,
            settings?.ollamaUrl || 'http://localhost:11434',
            text,
            temperature
          )
          break
        default:
          throw new Error(`مزود غير معروف: ${useProvider}`)
      }
    } catch (e: any) {
      const providerName = PROVIDER_NAMES[useProvider] || useProvider
      const errMsg = e?.message || 'خطأ غير معروف'
      console.error(`Provider ${useProvider} (${useModel}) failed:`, errMsg)
      return NextResponse.json(
        {
          error: `فشل ${providerName}: ${errMsg}`,
          provider: useProvider,
          model: useModel,
        },
        { status: 500 }
      )
    }

    if (!rawContent) {
      return NextResponse.json(
        { error: `${PROVIDER_NAMES[useProvider]} أعاد استجابة فارغة. حاول مرة أخرى.` },
        { status: 500 }
      )
    }

    const cvData = parseJson(rawContent)
    if (!cvData) {
      return NextResponse.json(
        {
          error: `فشل تحليل استجابة ${PROVIDER_NAMES[useProvider]} كـ JSON. حاول مرة أخرى أو جرّب نموذجاً آخر.`,
          rawPreview: rawContent.slice(0, 200),
        },
        { status: 500 }
      )
    }

    // Save resume in DB
    const resume = await db.resume.create({
      data: {
        userId: user.id,
        candidateName: cvData.name?.ar || cvData.name?.en || 'سيرة ذاتية',
        template: template || 'classic_noir',
        font: font || 'cairo',
        accentColor: accentColor || '#1a1a1a',
        data: JSON.stringify(cvData),
      },
    })

    return NextResponse.json({ resume, cvData })
  } catch (e: any) {
    console.error('CV generate error:', e)
    return NextResponse.json(
      { error: e?.message || 'فشل توليد السيرة الذاتية' },
      { status: 500 }
    )
  }
}
