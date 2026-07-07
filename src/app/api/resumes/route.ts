import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const trash = req.nextUrl.searchParams.get('trash') === '1'
  const resumes = await db.resume.findMany({
    where: { userId: user.id, isTrash: trash },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      candidateName: true,
      template: true,
      font: true,
      accentColor: true,
      version: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ resumes })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { cvData, template, font, accentColor, candidateName, resumeId } = body

    if (!cvData) {
      return NextResponse.json({ error: 'البيانات مطلوبة' }, { status: 400 })
    }

    let resume
    if (resumeId) {
      // Update existing → bump version
      const existing = await db.resume.findFirst({
        where: { id: resumeId, userId: user.id },
      })
      if (existing) {
        resume = await db.resume.update({
          where: { id: resumeId },
          data: {
            data: JSON.stringify(cvData),
            template: template || existing.template,
            font: font || existing.font,
            accentColor: accentColor || existing.accentColor,
            candidateName: candidateName || existing.candidateName,
            version: { increment: 1 },
          },
        })
      }
    }

    if (!resume) {
      resume = await db.resume.create({
        data: {
          userId: user.id,
          candidateName: candidateName || cvData.name?.ar || 'سيرة ذاتية',
          template: template || 'classic_noir',
          font: font || 'cairo',
          accentColor: accentColor || '#1a1a1a',
          data: JSON.stringify(cvData),
        },
      })
    }

    return NextResponse.json({ resume })
  } catch (e: any) {
    console.error('Save resume error:', e)
    return NextResponse.json({ error: 'فشل الحفظ' }, { status: 500 })
  }
}
