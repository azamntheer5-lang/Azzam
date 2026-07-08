import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import type { CvData, Provider } from '@/lib/cv-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `أنت خبير محترف في كتابة السير الذاتية باللغتين العربية والإنجليزية. مهمتك تحويل النص الخام الذي يقدمه المستخدم إلى سيرة ذاتية احترافية ثنائية اللغة بتنسيق JSON.

## القواعد الصارمة:

1. **لا تبتكر معلومات** — استخدم فقط ما ذكره المستخدم في النص الأصلي
2. **ثنائية اللغة**: لكل حقل نصي، أنشئ نسختين: عربية (ar) وإنجليزية (en)
3. **ترجمة دقيقة** للأسماء العلمية والمصطلحات التقنية
4. **ملخص مهني** (summary): 2-3 جمل جذابة تبرز الخبرات والمهارات الأساسية
5. **التواريخ**: تنسيق YYYY-MM (مثل 2022-01) أو "حتى الآن" للوظيفة الحالية
6. **المهارات**: حدد مستوى كل مهارة (beginner/intermediate/advanced/expert)
7. **اللغات**: مع مستوياتها (Native/Advanced/Intermediate/Beginner)
8. **الحقول الفارغة**: استخدم "" إذا لم تتوفر معلومة
9. **لا تكرر المحتوى** — كل قسم يحتوي معلومات فريدة
10. **أعد JSON صالح فقط** بدون أي شرح أو نص إضافي قبل أو بعد الـ JSON

## هيكل JSON المطلوب بالضبط:

{
  "name": { "ar": "الاسم بالعربية", "en": "Name in English" },
  "title": { "ar": "المسمى الوظيفي", "en": "Job Title" },
  "email": "email@example.com",
  "phone": "+xxx",
  "location": { "ar": "المدينة، الدولة", "en": "City, Country" },
  "website": "",
  "linkedin": "",
  "github": "",
  "summary": { "ar": "ملخص مهني موجز", "en": "Brief professional summary" },
  "experience": [
    {
      "company": { "ar": "اسم الشركة", "en": "Company Name" },
      "position": { "ar": "المسمى الوظيفي", "en": "Position" },
      "startDate": "2022-01",
      "endDate": "حتى الآن",
      "location": { "ar": "المدينة", "en": "City" },
      "description": { "ar": "وصف المهام باختصار", "en": "Brief description of tasks" },
      "achievements": ["إنجاز 1", "إنجاز 2"]
    }
  ],
  "education": [
    {
      "institution": { "ar": "اسم الجامعة", "en": "University Name" },
      "degree": { "ar": "البكالوريوس", "en": "Bachelor" },
      "field": { "ar": "التخصص", "en": "Field" },
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
    { "name": { "ar": "اسم الشهادة", "en": "Cert Name" }, "issuer": { "ar": "الجهة المانحة", "en": "Issuer" }, "date": "2023-08" }
  ],
  "projects": [],
  "courses": []
}

تذكر: JSON فقط، بدون تكرار، بدون شرح.`

// ─── Z.ai (direct fetch, free + unlimited on Vercel) ───
async function callZai(model: string, text: string, temperature: number): Promise<string> {
  const rawBaseUrl = (process.env.ZAI_BASE_URL || '').trim()
  const baseUrl = rawBaseUrl || 'https://internal-api.z.ai/v1'

  let parsedUrl: URL
  try {
    parsedUrl = new URL(`${baseUrl}/chat/completions`)
  } catch (e: any) {
    throw new Error('إعدادات Z.ai غير صحيحة على الخادم. تواصل مع المسؤول.')
  }

  const apiKey = (process.env.ZAI_API_KEY || '').trim()
  const token = (process.env.ZAI_TOKEN || '').trim()
  const userId = (process.env.ZAI_USER_ID || '').trim()
  const chatId = (process.env.ZAI_CHAT_ID || '').trim()

  if (!apiKey && !token) {
    throw new Error('خدمة Z.ai غير مُهيأة. جرّب مزوداً آخر.')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`
  if (token) headers['x-api-token'] = token

  const body: any = {
    model: model || 'glm-4.5',
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
    throw new Error(`Z.ai فشل (${res.status})`)
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
    if (res.status === 401) throw new Error('مفتاح OpenAI غير صحيح. تحقق من الإعدادات.')
    if (res.status === 429) throw new Error('انتهت حصة OpenAI. حاول لاحقاً.')
    throw new Error(`OpenAI فشل (${res.status})`)
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
    if (res.status === 401) throw new Error('مفتاح Anthropic غير صحيح. تحقق من الإعدادات.')
    if (res.status === 429) throw new Error('انتهت حصة Anthropic. حاول لاحقاً.')
    throw new Error(`Anthropic فشل (${res.status})`)
  }
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

// ─── Google Gemini (with auto-fallback for deprecated models) ───
const GEMINI_MODEL_ALIASES: Record<string, string> = {
  'gemini-1.5-flash': 'gemini-2.0-flash',
  'gemini-1.5-pro': 'gemini-2.5-pro',
  'gemini-2.0-flash-exp': 'gemini-2.0-flash',
  'gemini-2.0-flash': 'gemini-2.0-flash',
  'gemini-2.5-flash': 'gemini-2.5-flash',
  'gemini-2.5-pro': 'gemini-2.5-pro',
  'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
}

async function callGemini(model: string, apiKey: string, text: string, temperature: number): Promise<string> {
  const resolvedModel = GEMINI_MODEL_ALIASES[model] || model
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
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            { role: 'user', parts: [{ text: `حلّل هذا النص وأنشئ سيرة ذاتية ثنائية اللغة:\n\n${text}` }] },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: 4000,
            responseMimeType: 'application/json',
          },
        }),
      })

      if (!res.ok) {
        const errBody = await res.text().catch(() => '')
        if (res.status === 401) throw new Error('مفتاح Google Gemini غير صحيح. تحقق من الإعدادات.')
        if (res.status === 429) throw new Error('انتهت حصة Google Gemini المجانية. استخدم Z.ai (مجاني) أو انتظر تجديد الحصة.')
        if (res.status === 404 && modelName !== modelsToTry[modelsToTry.length - 1]) {
          lastError = `model "${modelName}" not found`
          continue
        }
        throw new Error(`Gemini فشل (${res.status})`)
      }

      const data = await res.json()
      if (data.error) {
        if (data.error.status === 'NOT_FOUND' && modelName !== modelsToTry[modelsToTry.length - 1]) {
          lastError = data.error.message || 'NOT_FOUND'
          continue
        }
        throw new Error(`Gemini: ${data.error.message || 'خطأ غير معروف'}`)
      }

      const content = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || ''
      if (!content) throw new Error('Gemini أعاد استجابة فارغة')
      return content
    } catch (e: any) {
      if (modelName !== modelsToTry[modelsToTry.length - 1] && (
        e.message?.includes('404') || e.message?.includes('NOT_FOUND')
      )) {
        lastError = e.message
        continue
      }
      throw e
    }
  }
  throw new Error(`فشلت كل نماذج Gemini. ${lastError}`)
}

// ─── Ollama ───
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
  if (!res.ok) throw new Error(`Ollama فشل (${res.status}). تأكد من تشغيله محلياً.`)
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

const PROVIDER_NAMES: Record<Provider, string> = {
  zai: 'Z.ai GLM',
  openai: 'OpenAI',
  anthropic: 'Anthropic Claude',
  gemini: 'Google Gemini',
  ollama: 'Ollama',
}

// ─── Main POST handler with smart fallback ───
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
    let usedProvider = useProvider
    let usedModel = useModel
    let primaryError = ''

    // Try the selected provider first
    try {
      switch (useProvider) {
        case 'zai':
          rawContent = await callZai(useModel, text, temperature)
          break
        case 'openai':
          if (!settings?.openaiKey) throw new Error('مفتاح OpenAI غير مُهيأ')
          rawContent = await callOpenAI(useModel, settings.openaiKey, text, temperature)
          break
        case 'anthropic':
          if (!settings?.anthropicKey) throw new Error('مفتاح Anthropic غير مُهيأ')
          rawContent = await callAnthropic(useModel, settings.anthropicKey, text, temperature)
          break
        case 'gemini':
          if (!settings?.geminiKey) throw new Error('مفتاح Google Gemini غير مُهيأ')
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
      }
    } catch (e: any) {
      primaryError = e?.message || 'خطأ غير معروف'
      console.error(`Primary provider ${useProvider} failed:`, primaryError)

      // Smart fallback: if not Z.ai, try Z.ai (free + always available)
      if (useProvider !== 'zai') {
        try {
          rawContent = await callZai('glm-4.5', text, temperature)
          usedProvider = 'zai'
          usedModel = 'glm-4.5'
          console.log('Fell back to Z.ai successfully')
        } catch (fallbackErr: any) {
          console.error('Z.ai fallback also failed:', fallbackErr?.message)
        }
      }
    }

    if (!rawContent) {
      // Final error — primary failed AND fallback failed (or no fallback)
      const friendlyError = primaryError.includes('429')
        ? 'انتهت حصة المزود المختار. جرّب Z.ai GLM (مجاني وغير محدود).'
        : primaryError.includes('401')
        ? 'مفتاح المزود غير صحيح. راجع إعدادات API.'
        : primaryError || 'فشل توليد السيرة الذاتية'
      return NextResponse.json(
        { error: friendlyError, originalError: primaryError },
        { status: 500 }
      )
    }

    const cvData = parseJson(rawContent)
    if (!cvData) {
      return NextResponse.json(
        { error: 'فشل تحليل الاستجابة. جرّب Z.ai GLM-4.5 (الأكثر استقراراً).' },
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

    return NextResponse.json({
      resume,
      cvData,
      usedProvider,  // tell client which provider actually succeeded
      usedModel,
      fellBack: usedProvider !== useProvider,  // true if we used fallback
    })
  } catch (e: any) {
    console.error('CV generate error:', e)
    return NextResponse.json(
      { error: e?.message || 'فشل توليد السيرة الذاتية' },
      { status: 500 }
    )
  }
}
