import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  const resume = await db.resume.findFirst({
    where: { id, userId: user.id },
  })

  if (!resume) {
    return NextResponse.json({ error: 'غير موجود' }, { status: 404 })
  }

  return NextResponse.json({
    resume: {
      ...resume,
      data: JSON.parse(resume.data),
    },
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { template, font, accentColor, candidateName, isTrash } = body

  const resume = await db.resume.updateMany({
    where: { id, userId: user.id },
    data: {
      ...(template !== undefined && { template }),
      ...(font !== undefined && { font }),
      ...(accentColor !== undefined && { accentColor }),
      ...(candidateName !== undefined && { candidateName }),
      ...(isTrash !== undefined && { isTrash, trashedAt: isTrash ? new Date() : null }),
    },
  })

  if (resume.count === 0) {
    return NextResponse.json({ error: 'غير موجود' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  await db.resume.deleteMany({ where: { id, userId: user.id } })

  return NextResponse.json({ ok: true })
}
