import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { renderCv } from '@/lib/cv-renderer'
import type { CvData } from '@/lib/cv-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const body = await req.json()
  const { resumeId, cvData, template, font, accentColor, lang, editable } = body

  let data: CvData | null = cvData
  let tpl = template || 'classic_noir'
  let fnt = font || 'cairo'
  let color = accentColor || '#1a1a1a'

  if (resumeId && !data) {
    const resume = await db.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    })
    if (!resume) {
      return NextResponse.json({ error: 'غير موجود' }, { status: 404 })
    }
    data = JSON.parse(resume.data)
    tpl = resume.template
    fnt = resume.font
    color = resume.accentColor
  }

  if (!data) {
    return NextResponse.json({ error: 'لا توجد بيانات' }, { status: 400 })
  }

  const html = renderCv(data, {
    template: tpl,
    font: fnt,
    accentColor: color,
    lang: lang || 'ar',
    editable,
  })

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
