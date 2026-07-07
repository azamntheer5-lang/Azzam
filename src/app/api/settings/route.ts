import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const settings = await db.settings.findUnique({ where: { userId: user.id } })
  if (!settings) {
    return NextResponse.json({
      openaiKey: '',
      anthropicKey: '',
      geminiKey: '',
      ollamaUrl: 'http://localhost:11434',
      defaultProvider: 'zai',
      defaultModel: 'glm-4.5',
      temperature: 0.4,
    })
  }

  return NextResponse.json({
    openaiKey: settings.openaiKey ? `set:${settings.openaiKey.slice(-4)}` : '',
    anthropicKey: settings.anthropicKey ? `set:${settings.anthropicKey.slice(-4)}` : '',
    geminiKey: settings.geminiKey ? `set:${settings.geminiKey.slice(-4)}` : '',
    ollamaUrl: settings.ollamaUrl,
    defaultProvider: settings.defaultProvider,
    defaultModel: settings.defaultModel,
    temperature: settings.temperature,
  })
}

export async function PUT(req: NextRequest) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const body = await req.json()
  const { openaiKey, anthropicKey, geminiKey, ollamaUrl, defaultProvider, defaultModel, temperature } = body

  const data: any = {}
  if (openaiKey && !openaiKey.startsWith('set:')) data.openaiKey = openaiKey
  if (anthropicKey && !anthropicKey.startsWith('set:')) data.anthropicKey = anthropicKey
  if (geminiKey && !geminiKey.startsWith('set:')) data.geminiKey = geminiKey
  if (ollamaUrl !== undefined) data.ollamaUrl = ollamaUrl
  if (defaultProvider !== undefined) data.defaultProvider = defaultProvider
  if (defaultModel !== undefined) data.defaultModel = defaultModel
  if (temperature !== undefined) data.temperature = temperature

  await db.settings.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
  })

  return NextResponse.json({ ok: true })
}
