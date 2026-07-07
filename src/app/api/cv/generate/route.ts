import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import type { CvData, Provider } from '@/lib/cv-types'
import ZAI from 'z-ai-web-dev-sdk'

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

async function callZai(model: string, text: string, temperature: number): Promise<string> {
  const zai = await ZAI.create()
  const response = await zai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `حلّل هذا النص وأنشئ سيرة ذاتية ثنائية اللغة:\n\n${text}` }
    ],
    temperature,
    max_tokens: 4000,
  })
  return response.choices[0]?.message?.content || ''
}

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
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`)
  const data = await res.json()
  return data.choices[0]?.message?.content || ''
}

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
  if (!res.ok) throw new Error(`Anthropic error: ${res.status}`)
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

async function callOllama(model: string, baseUrl: string, text: string, temperature: number): Promise<string> {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
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
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`)
  const data = await res.json()
  return data.message?.content || ''
}

function parseJson(content: string): CvData | null {
  // Strip code fences if present
  let cleaned = content.trim()
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
  if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
  cleaned = cleaned.trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    // Try to extract JSON object
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

    // Try requested provider, fall back to Z.ai (always available)
    const providers: Provider[] = [useProvider]
    if (useProvider !== 'zai') providers.push('zai')

    let lastError = ''
    for (const p of providers) {
      try {
        switch (p) {
          case 'zai':
            rawContent = await callZai(useProvider === 'zai' ? useModel : 'glm-4.5', text, temperature)
            break
          case 'openai':
            if (!settings?.openaiKey) throw new Error('لا يوجد مفتاح OpenAI')
            rawContent = await callOpenAI(useModel, settings.openaiKey, text, temperature)
            break
          case 'anthropic':
            if (!settings?.anthropicKey) throw new Error('لا يوجد مفتاح Anthropic')
            rawContent = await callAnthropic(useModel, settings.anthropicKey, text, temperature)
            break
          case 'ollama':
            rawContent = await callOllama(useModel, settings?.ollamaUrl || 'http://localhost:11434', text, temperature)
            break
        }
        if (rawContent) break
      } catch (e: any) {
        lastError = e?.message || 'خطأ غير معروف'
        console.error(`Provider ${p} failed:`, lastError)
      }
    }

    if (!rawContent) {
      return NextResponse.json(
        { error: `فشل الاتصال بجميع المزودين. آخر خطأ: ${lastError}` },
        { status: 500 }
      )
    }

    const cvData = parseJson(rawContent)
    if (!cvData) {
      return NextResponse.json(
        { error: 'فشل تحليل استجابة الذكاء الاصطناعي. حاول مرة أخرى.' },
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
