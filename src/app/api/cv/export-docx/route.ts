import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle,
} from 'docx'
import type { CvData } from '@/lib/cv-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function txt(s: string | { ar: string; en: string }, lang: 'ar' | 'en'): string {
  if (!s) return ''
  if (typeof s === 'string') return s
  return lang === 'ar' ? s.ar : s.en
}

function fmtDate(d: string, lang: 'ar' | 'en'): string {
  if (!d) return ''
  if (d === 'حتى الآن' || d === 'Present') {
    return lang === 'ar' ? 'حتى الآن' : 'Present'
  }
  const m = d.match(/^(\d{4})-(\d{2})$/)
  if (m) {
    const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthIdx = parseInt(m[2]) - 1
    if (monthIdx >= 0 && monthIdx < 12) {
      return lang === 'ar' ? `${monthsAr[monthIdx]} ${m[1]}` : `${monthsEn[monthIdx]} ${m[1]}`
    }
    return m[1]
  }
  return d
}

function buildDocx(data: CvData, lang: 'ar' | 'en'): Document {
  const isAr = lang === 'ar'
  const paragraphs: Paragraph[] = []

  // Name (large)
  paragraphs.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    bidirectional: isAr,
    children: [new TextRun({
      text: txt(data.name, lang),
      bold: true,
      size: 48, // 24pt
      font: isAr ? 'Arial' : 'Calibri',
      rightToLeft: isAr,
    })],
  }))

  // Title
  paragraphs.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    bidirectional: isAr,
    children: [new TextRun({
      text: txt(data.title, lang),
      size: 28,
      color: '555555',
      font: isAr ? 'Arial' : 'Calibri',
      rightToLeft: isAr,
    })],
  }))

  // Contact
  const contactParts = [
    data.email, data.phone,
    data.location ? txt(data.location, lang) : '',
    data.linkedin, data.github, data.website
  ].filter(Boolean)
  paragraphs.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({
      text: contactParts.join(' · '),
      size: 20,
      color: '666666',
      font: isAr ? 'Arial' : 'Calibri',
      rightToLeft: isAr,
    })],
    spacing: { after: 200 },
  }))

  // Horizontal rule via empty paragraph with border
  paragraphs.push(new Paragraph({
    border: { bottom: { color: '999999', size: 6, style: BorderStyle.SINGLE, space: 1 } },
    spacing: { after: 200 },
  }))

  // Helper: section title
  const sectionTitle = (text: string) => new Paragraph({
    heading: HeadingLevel.HEADING_2,
    bidirectional: isAr,
    children: [new TextRun({
      text,
      bold: true,
      size: 28,
      color: '2C3E50',
      font: isAr ? 'Arial' : 'Calibri',
      rightToLeft: isAr,
    })],
    border: { bottom: { color: 'CCCCCC', size: 4, style: BorderStyle.SINGLE, space: 2 } },
    spacing: { before: 200, after: 120 },
  })

  // Summary
  if (data.summary?.[lang]) {
    paragraphs.push(sectionTitle(isAr ? 'الملخص المهني' : 'Professional Summary'))
    paragraphs.push(new Paragraph({
      bidirectional: isAr,
      children: [new TextRun({
        text: data.summary[lang],
        size: 22,
        font: isAr ? 'Arial' : 'Calibri',
        rightToLeft: isAr,
      })],
      spacing: { after: 200 },
    }))
  }

  // Experience
  if (data.experience?.length) {
    paragraphs.push(sectionTitle(isAr ? 'الخبرات المهنية' : 'Professional Experience'))
    for (const e of data.experience) {
      paragraphs.push(new Paragraph({
        bidirectional: isAr,
        children: [
          new TextRun({ text: txt(e.position, lang), bold: true, size: 24, font: isAr ? 'Arial' : 'Calibri', rightToLeft: isAr }),
          new TextRun({ text: ` — ${txt(e.company, lang)}`, size: 22, color: '555555', font: isAr ? 'Arial' : 'Calibri', rightToLeft: isAr }),
        ],
        spacing: { before: 120 },
      }))
      paragraphs.push(new Paragraph({
        children: [new TextRun({
          text: `${fmtDate(e.startDate, lang)} — ${fmtDate(e.endDate, lang)}`,
          italics: true, size: 20, color: '777777', font: isAr ? 'Arial' : 'Calibri', rightToLeft: isAr,
        })],
        spacing: { after: 80 },
      }))
      paragraphs.push(new Paragraph({
        bidirectional: isAr,
        children: [new TextRun({
          text: txt(e.description, lang), size: 22, font: isAr ? 'Arial' : 'Calibri', rightToLeft: isAr,
        })],
        spacing: { after: 80 },
      }))
      if (e.achievements?.length) {
        for (const a of e.achievements) {
          paragraphs.push(new Paragraph({
            bidirectional: isAr,
            bullet: { level: 0 },
            children: [new TextRun({ text: a, size: 22, font: isAr ? 'Arial' : 'Calibri', rightToLeft: isAr })],
          }))
        }
      }
    }
  }

  // Education
  if (data.education?.length) {
    paragraphs.push(sectionTitle(isAr ? 'التعليم' : 'Education'))
    for (const ed of data.education) {
      paragraphs.push(new Paragraph({
        bidirectional: isAr,
        children: [
          new TextRun({ text: `${txt(ed.degree, lang)} · ${txt(ed.field, lang)}`, bold: true, size: 24, font: isAr ? 'Arial' : 'Calibri', rightToLeft: isAr }),
        ],
        spacing: { before: 80 },
      }))
      paragraphs.push(new Paragraph({
        bidirectional: isAr,
        children: [
          new TextRun({ text: txt(ed.institution, lang), size: 22, color: '555555', font: isAr ? 'Arial' : 'Calibri', rightToLeft: isAr }),
          ...ed.gpa ? [new TextRun({ text: ` · GPA: ${ed.gpa}`, size: 20, color: '777777', font: isAr ? 'Arial' : 'Calibri', rightToLeft: isAr })] : [],
        ],
        spacing: { after: 40 },
      }))
      paragraphs.push(new Paragraph({
        children: [new TextRun({
          text: `${fmtDate(ed.startDate, lang)} — ${fmtDate(ed.endDate, lang)}`,
          italics: true, size: 20, color: '777777', font: isAr ? 'Arial' : 'Calibri', rightToLeft: isAr,
        })],
        spacing: { after: 120 },
      }))
    }
  }

  // Skills
  if (data.skills?.length) {
    paragraphs.push(sectionTitle(isAr ? 'المهارات' : 'Skills'))
    const skillsText = data.skills.map((s) => txt(s.name, lang) + (s.level ? ` (${s.level})` : '')).join(' · ')
    paragraphs.push(new Paragraph({
      bidirectional: isAr,
      children: [new TextRun({ text: skillsText, size: 22, font: isAr ? 'Arial' : 'Calibri', rightToLeft: isAr })],
      spacing: { after: 200 },
    }))
  }

  // Languages
  if (data.languages?.length) {
    paragraphs.push(sectionTitle(isAr ? 'اللغات' : 'Languages'))
    const langsText = data.languages.map((l) => `${txt(l.name, lang)} (${txt(l.level, lang)})`).join(' · ')
    paragraphs.push(new Paragraph({
      bidirectional: isAr,
      children: [new TextRun({ text: langsText, size: 22, font: isAr ? 'Arial' : 'Calibri', rightToLeft: isAr })],
      spacing: { after: 200 },
    }))
  }

  // Certifications
  if (data.certifications?.length) {
    paragraphs.push(sectionTitle(isAr ? 'الشهادات' : 'Certifications'))
    for (const c of data.certifications) {
      paragraphs.push(new Paragraph({
        bidirectional: isAr,
        children: [
          new TextRun({ text: txt(c.name, lang), bold: true, size: 22, font: isAr ? 'Arial' : 'Calibri', rightToLeft: isAr }),
          new TextRun({ text: ` — ${txt(c.issuer, lang)} (${c.date})`, size: 20, color: '666666', font: isAr ? 'Arial' : 'Calibri', rightToLeft: isAr }),
        ],
        spacing: { after: 80 },
      }))
    }
  }

  return new Document({
    styles: {
      default: {
        document: { run: { font: isAr ? 'Arial' : 'Calibri', size: 22 } },
      },
    },
    sections: [{
      properties: {
        page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } }, // 0.5 inch
      },
      children: paragraphs,
    }],
  })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const body = await req.json()
  const { resumeId, cvData, lang } = body

  let data: CvData | null = cvData

  if (resumeId && !data) {
    const resume = await db.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    })
    if (!resume) {
      return NextResponse.json({ error: 'غير موجود' }, { status: 404 })
    }
    data = JSON.parse(resume.data)
  }

  if (!data) {
    return NextResponse.json({ error: 'لا توجد بيانات' }, { status: 400 })
  }

  const doc = buildDocx(data, lang || 'ar')
  const buffer = await Packer.toBuffer(doc)

  const filename = (data.name?.ar || data.name?.en || 'CV').replace(/\s+/g, '_') + '.docx'

  return new NextResponse(buffer as any, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  })
}
