// CV Template Renderer — converts CvData → HTML for preview/print
import type { CvData } from './cv-types'

interface RenderOptions {
  template: string
  font: string
  accentColor: string
  lang: 'ar' | 'en'
  editable?: boolean
}

function getFontFamily(fontId: string): string {
  const map: Record<string, string> = {
    cairo: "'Cairo', sans-serif",
    tajawal: "'Tajawal', sans-serif",
    ibm_plex: "'IBM Plex Sans Arabic', sans-serif",
    almarai: "'Almarai', sans-serif",
    readex: "'Readex Pro', sans-serif",
    alexandria: "'Alexandria', sans-serif",
    el_messiri: "'El Messiri', sans-serif",
    changa: "'Changa', sans-serif",
    vazirmatn: "'Vazirmatn', sans-serif",
    mada: "'Mada', sans-serif",
    noto_sans_arabic: "'Noto Sans Arabic', sans-serif",
    noto_kufi: "'Noto Kufi Arabic', sans-serif",
    reem_kufi: "'Reem Kufi', sans-serif",
    kufam: "'Kufam', sans-serif",
    harmattan: "'Harmattan', sans-serif",
    amiri: "'Amiri', serif",
    markazi: "'Markazi Text', serif",
    baloo: "'Baloo Bhaijaan 2', sans-serif",
    lemonada: "'Lemonada', sans-serif",
  }
  return map[fontId] || "'Cairo', sans-serif"
}

function getFontUrl(fontId: string): string {
  const map: Record<string, string> = {
    cairo: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap',
    tajawal: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap',
    ibm_plex: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap',
    almarai: 'https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap',
    readex: 'https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;600;700&display=swap',
    alexandria: 'https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700&display=swap',
    el_messiri: 'https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;600;700&display=swap',
    changa: 'https://fonts.googleapis.com/css2?family=Changa:wght@400;600;700&display=swap',
    vazirmatn: 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&display=swap',
    mada: 'https://fonts.googleapis.com/css2?family=Mada:wght@400;600;700&display=swap',
    noto_sans_arabic: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap',
    noto_kufi: 'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700&display=swap',
    reem_kufi: 'https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;600;700&display=swap',
    kufam: 'https://fonts.googleapis.com/css2?family=Kufam:wght@400;600;700&display=swap',
    harmattan: 'https://fonts.googleapis.com/css2?family=Harmattan:wght@400;600;700&display=swap',
    amiri: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
    markazi: 'https://fonts.googleapis.com/css2?family=Markazi+Text:wght@400;600;700&display=swap',
    baloo: 'https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;600;700&display=swap',
    lemonada: 'https://fonts.googleapis.com/css2?family=Lemonada:wght@400;600;700&display=swap',
  }
  return map[fontId] || map.cairo
}

function fmtDate(d: string, lang: 'ar' | 'en'): string {
  if (!d) return ''
  if (d === 'حتى الآن' || d === 'Present') {
    return lang === 'ar' ? 'حتى الآن' : 'Present'
  }
  // YYYY-MM → Month YYYY
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

function escapeHtml(s: string): string {
  if (!s) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Editable attribute for contenteditable
function ed(label: string, value: string, editable?: boolean): string {
  const v = escapeHtml(value)
  if (editable) {
    return `contenteditable="true" data-field="${label}" data-value="${v}"`
  }
  return ''
}

// ─── Template: classic_noir (ATS, black & white) ───
function renderClassicNoir(data: CvData, lang: 'ar' | 'en', accent: string, editable?: boolean): string {
  const t = (ar: string, en: string) => lang === 'ar' ? ar : en
  const fontFamily = getFontFamily('cairo') // ATS uses default sans-serif

  let expHtml = ''
  for (const e of data.experience || []) {
    const desc = lang === 'ar' ? e.description.ar : e.description.en
    const comp = lang === 'ar' ? e.company.ar : e.company.en
    const pos = lang === 'ar' ? e.position.ar : e.position.en
    const loc = lang === 'ar' ? e.location?.ar : e.location?.en
    expHtml += `
      <div class="exp-item">
        <div class="exp-header">
          <div>
            <div class="exp-position" ${ed('position', pos, editable)}>${escapeHtml(pos)}</div>
            <div class="exp-company" ${ed('company', comp, editable)}>${escapeHtml(comp)}${loc ? ` · ${escapeHtml(loc)}` : ''}</div>
          </div>
          <div class="exp-dates">${escapeHtml(fmtDate(e.startDate, lang))} — ${escapeHtml(fmtDate(e.endDate, lang))}</div>
        </div>
        <div class="exp-desc" ${ed('exp_desc', desc, editable)}>${escapeHtml(desc)}</div>
        ${e.achievements && e.achievements.length ? `
          <ul class="exp-ach">
            ${e.achievements.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `
  }

  let eduHtml = ''
  for (const ed of data.education || []) {
    const inst = lang === 'ar' ? ed.institution.ar : ed.institution.en
    const deg = lang === 'ar' ? ed.degree.ar : ed.degree.en
    const field = lang === 'ar' ? ed.field.ar : ed.field.en
    eduHtml += `
      <div class="edu-item">
        <div class="edu-header">
          <div>
            <div class="edu-degree">${escapeHtml(deg)} · ${escapeHtml(field)}</div>
            <div class="edu-inst">${escapeHtml(inst)}</div>
            ${ed.gpa ? `<div class="edu-gpa">GPA: ${escapeHtml(ed.gpa)}</div>` : ''}
          </div>
          <div class="edu-dates">${escapeHtml(fmtDate(ed.startDate, lang))} — ${escapeHtml(fmtDate(ed.endDate, lang))}</div>
        </div>
      </div>
    `
  }

  const skills = (data.skills || []).map((s) => escapeHtml(lang === 'ar' ? s.name.ar : s.name.en)).join(' · ')
  const langs = (data.languages || []).map((l) => `${escapeHtml(lang === 'ar' ? l.name.ar : l.name.en)} (${escapeHtml(lang === 'ar' ? l.level.ar : l.level.en)})`).join(' · ')
  const certs = (data.certifications || []).map((c) => `${escapeHtml(lang === 'ar' ? c.name.ar : c.name.en)} — ${escapeHtml(lang === 'ar' ? c.issuer.ar : c.issuer.en)} (${escapeHtml(c.date)})`).join('<br>')

  return `
    <div class="cv classic-noir" dir="${lang === 'ar' ? 'rtl' : 'ltr'}" style="font-family: ${fontFamily}; color: #1a1a1a;">
      <header class="cv-header" style="border-bottom: 2px solid ${accent}; padding-bottom: 12px; margin-bottom: 16px;">
        <h1 class="cv-name" style="font-size: 26px; font-weight: 700; margin: 0; color: ${accent};" ${ed('name', lang === 'ar' ? data.name.ar : data.name.en, editable)}>${escapeHtml(lang === 'ar' ? data.name.ar : data.name.en)}</h1>
        <div class="cv-title" style="font-size: 15px; color: #555; margin-top: 4px;" ${ed('title', lang === 'ar' ? data.title.ar : data.title.en, editable)}>${escapeHtml(lang === 'ar' ? data.title.ar : data.title.en)}</div>
        <div class="cv-contact" style="font-size: 12px; color: #666; margin-top: 8px;" dir="ltr">
          ${data.email ? `<span>${escapeHtml(data.email)}</span>` : ''}
          ${data.phone ? ` · <span>${escapeHtml(data.phone)}</span>` : ''}
          ${data.location ? ` · <span>${escapeHtml(lang === 'ar' ? data.location.ar : data.location.en)}</span>` : ''}
          ${data.linkedin ? ` · <span>${escapeHtml(data.linkedin)}</span>` : ''}
        </div>
      </header>

      ${data.summary?.[lang] ? `
        <section class="cv-section">
          <h2 class="section-title" style="font-size: 14px; font-weight: 700; color: ${accent}; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px;">${t('الملخص المهني', 'Professional Summary')}</h2>
          <p style="font-size: 13px; line-height: 1.6; margin: 0;" ${ed('summary', data.summary[lang], editable)}>${escapeHtml(data.summary[lang])}</p>
        </section>
      ` : ''}

      ${expHtml ? `
        <section class="cv-section">
          <h2 class="section-title" style="font-size: 14px; font-weight: 700; color: ${accent}; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px;">${t('الخبرات المهنية', 'Professional Experience')}</h2>
          ${expHtml}
        </section>
      ` : ''}

      ${eduHtml ? `
        <section class="cv-section">
          <h2 class="section-title" style="font-size: 14px; font-weight: 700; color: ${accent}; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px;">${t('التعليم', 'Education')}</h2>
          ${eduHtml}
        </section>
      ` : ''}

      ${skills ? `
        <section class="cv-section">
          <h2 class="section-title" style="font-size: 14px; font-weight: 700; color: ${accent}; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px;">${t('المهارات', 'Skills')}</h2>
          <p style="font-size: 13px; line-height: 1.6; margin: 0;">${skills}</p>
        </section>
      ` : ''}

      ${langs ? `
        <section class="cv-section">
          <h2 class="section-title" style="font-size: 14px; font-weight: 700; color: ${accent}; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px;">${t('اللغات', 'Languages')}</h2>
          <p style="font-size: 13px; line-height: 1.6; margin: 0;">${langs}</p>
        </section>
      ` : ''}

      ${certs ? `
        <section class="cv-section">
          <h2 class="section-title" style="font-size: 14px; font-weight: 700; color: ${accent}; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px;">${t('الشهادات', 'Certifications')}</h2>
          <p style="font-size: 13px; line-height: 1.6; margin: 0;">${certs}</p>
        </section>
      ` : ''}
    </div>
  `
}

// ─── Template: modern_blue (ATS, accent header) ───
function renderModernBlue(data: CvData, lang: 'ar' | 'en', accent: string, editable?: boolean): string {
  const t = (ar: string, en: string) => lang === 'ar' ? ar : en
  const fontFamily = getFontFamily('cairo')

  let expHtml = ''
  for (const e of data.experience || []) {
    const desc = lang === 'ar' ? e.description.ar : e.description.en
    const comp = lang === 'ar' ? e.company.ar : e.company.en
    const pos = lang === 'ar' ? e.position.ar : e.position.en
    const loc = lang === 'ar' ? e.location?.ar : e.location?.en
    expHtml += `
      <div class="exp-item" style="margin-bottom: 14px; padding-inline-start: 14px; border-inline-start: 3px solid ${accent};">
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
          <div>
            <div style="font-weight: 700; font-size: 14px; color: #1a1a1a;">${escapeHtml(pos)}</div>
            <div style="color: ${accent}; font-size: 13px; font-weight: 600;">${escapeHtml(comp)}${loc ? ` · ${escapeHtml(loc)}` : ''}</div>
          </div>
          <div style="font-size: 12px; color: #666;">${escapeHtml(fmtDate(e.startDate, lang))} — ${escapeHtml(fmtDate(e.endDate, lang))}</div>
        </div>
        <div style="font-size: 13px; line-height: 1.6; margin-top: 6px; color: #333;">${escapeHtml(desc)}</div>
        ${e.achievements && e.achievements.length ? `<ul style="margin: 6px 0 0; padding-inline-start: 18px; font-size: 13px;">${e.achievements.map((a) => `<li style="margin-bottom: 2px;">${escapeHtml(a)}</li>`).join('')}</ul>` : ''}
      </div>
    `
  }

  let eduHtml = ''
  for (const ed of data.education || []) {
    const inst = lang === 'ar' ? ed.institution.ar : ed.institution.en
    const deg = lang === 'ar' ? ed.degree.ar : ed.degree.en
    const field = lang === 'ar' ? ed.field.ar : ed.field.en
    eduHtml += `
      <div style="margin-bottom: 10px; padding-inline-start: 14px; border-inline-start: 3px solid ${accent};">
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
          <div>
            <div style="font-weight: 700; font-size: 14px;">${escapeHtml(deg)} · ${escapeHtml(field)}</div>
            <div style="color: ${accent}; font-size: 13px;">${escapeHtml(inst)}${ed.gpa ? ` · GPA: ${escapeHtml(ed.gpa)}` : ''}</div>
          </div>
          <div style="font-size: 12px; color: #666;">${escapeHtml(fmtDate(ed.startDate, lang))} — ${escapeHtml(fmtDate(ed.endDate, lang))}</div>
        </div>
      </div>
    `
  }

  const skills = (data.skills || []).map((s) => `<span style="display: inline-block; background: ${accent}15; color: ${accent}; padding: 3px 10px; border-radius: 999px; font-size: 12px; margin: 0 4px 4px 0;">${escapeHtml(lang === 'ar' ? s.name.ar : s.name.en)}</span>`).join('')
  const langs = (data.languages || []).map((l) => `${escapeHtml(lang === 'ar' ? l.name.ar : l.name.en)} <span style="color:#888">(${escapeHtml(lang === 'ar' ? l.level.ar : l.level.en)})</span>`).join(' · ')
  const certs = (data.certifications || []).map((c) => `<div style="margin-bottom: 4px;"><strong>${escapeHtml(lang === 'ar' ? c.name.ar : c.name.en)}</strong> — ${escapeHtml(lang === 'ar' ? c.issuer.ar : c.issuer.en)} <span style="color:#888">(${escapeHtml(c.date)})</span></div>`).join('')

  return `
    <div class="cv modern-blue" dir="${lang === 'ar' ? 'rtl' : 'ltr'}" style="font-family: ${fontFamily}; color: #1a1a1a;">
      <header style="background: ${accent}; color: white; padding: 24px; margin: -24px -24px 16px; border-radius: 0;">
        <h1 style="font-size: 28px; font-weight: 700; margin: 0;" ${ed('name', lang === 'ar' ? data.name.ar : data.name.en, editable)}>${escapeHtml(lang === 'ar' ? data.name.ar : data.name.en)}</h1>
        <div style="font-size: 16px; opacity: 0.9; margin-top: 4px;" ${ed('title', lang === 'ar' ? data.title.ar : data.title.en, editable)}>${escapeHtml(lang === 'ar' ? data.title.ar : data.title.en)}</div>
        <div style="font-size: 12px; margin-top: 10px; opacity: 0.85;" dir="ltr">
          ${data.email ? `<span>${escapeHtml(data.email)}</span>` : ''}
          ${data.phone ? ` · <span>${escapeHtml(data.phone)}</span>` : ''}
          ${data.location ? ` · <span>${escapeHtml(lang === 'ar' ? data.location.ar : data.location.en)}</span>` : ''}
          ${data.linkedin ? ` · <span>${escapeHtml(data.linkedin)}</span>` : ''}
        </div>
      </header>

      ${data.summary?.[lang] ? `
        <section style="margin-bottom: 16px;">
          <h2 style="font-size: 15px; font-weight: 700; color: ${accent}; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid ${accent}30;">${t('الملخص المهني', 'Summary')}</h2>
          <p style="font-size: 13px; line-height: 1.7; margin: 0;" ${ed('summary', data.summary[lang], editable)}>${escapeHtml(data.summary[lang])}</p>
        </section>
      ` : ''}

      ${expHtml ? `
        <section style="margin-bottom: 16px;">
          <h2 style="font-size: 15px; font-weight: 700; color: ${accent}; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 2px solid ${accent}30;">${t('الخبرات المهنية', 'Experience')}</h2>
          ${expHtml}
        </section>
      ` : ''}

      ${eduHtml ? `
        <section style="margin-bottom: 16px;">
          <h2 style="font-size: 15px; font-weight: 700; color: ${accent}; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 2px solid ${accent}30;">${t('التعليم', 'Education')}</h2>
          ${eduHtml}
        </section>
      ` : ''}

      ${skills ? `
        <section style="margin-bottom: 16px;">
          <h2 style="font-size: 15px; font-weight: 700; color: ${accent}; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 2px solid ${accent}30;">${t('المهارات', 'Skills')}</h2>
          <div>${skills}</div>
        </section>
      ` : ''}

      ${langs ? `
        <section style="margin-bottom: 16px;">
          <h2 style="font-size: 15px; font-weight: 700; color: ${accent}; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 2px solid ${accent}30;">${t('اللغات', 'Languages')}</h2>
          <p style="font-size: 13px; margin: 0;">${langs}</p>
        </section>
      ` : ''}

      ${certs ? `
        <section>
          <h2 style="font-size: 15px; font-weight: 700; color: ${accent}; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 2px solid ${accent}30;">${t('الشهادات', 'Certifications')}</h2>
          ${certs}
        </section>
      ` : ''}
    </div>
  `
}

// ─── Template: sidebar_color (creative, two-column) ───
function renderSidebarColor(data: CvData, lang: 'ar' | 'en', accent: string, editable?: boolean): string {
  const t = (ar: string, en: string) => lang === 'ar' ? ar : en
  const fontFamily = getFontFamily('cairo')

  let expHtml = ''
  for (const e of data.experience || []) {
    const desc = lang === 'ar' ? e.description.ar : e.description.en
    const comp = lang === 'ar' ? e.company.ar : e.company.en
    const pos = lang === 'ar' ? e.position.ar : e.position.en
    expHtml += `
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 700; font-size: 14px;">${escapeHtml(pos)}</div>
        <div style="color: ${accent}; font-size: 13px; font-weight: 600; margin-bottom: 2px;">${escapeHtml(comp)}</div>
        <div style="font-size: 12px; color: #888; margin-bottom: 6px;">${escapeHtml(fmtDate(e.startDate, lang))} — ${escapeHtml(fmtDate(e.endDate, lang))}</div>
        <div style="font-size: 13px; line-height: 1.6; color: #333;">${escapeHtml(desc)}</div>
        ${e.achievements && e.achievements.length ? `<ul style="margin: 4px 0 0; padding-inline-start: 18px; font-size: 12px; color: #555;">${e.achievements.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>` : ''}
      </div>
    `
  }

  let eduHtml = ''
  for (const ed of data.education || []) {
    eduHtml += `
      <div style="margin-bottom: 10px;">
        <div style="font-weight: 700; font-size: 13px;">${escapeHtml(lang === 'ar' ? ed.degree.ar : ed.degree.en)} · ${escapeHtml(lang === 'ar' ? ed.field.ar : ed.field.en)}</div>
        <div style="color: ${accent}; font-size: 12px;">${escapeHtml(lang === 'ar' ? ed.institution.ar : ed.institution.en)}</div>
        <div style="font-size: 11px; color: #888;">${escapeHtml(fmtDate(ed.startDate, lang))} — ${escapeHtml(fmtDate(ed.endDate, lang))}</div>
      </div>
    `
  }

  const skills = (data.skills || []).map((s) => `<div style="margin-bottom: 6px;"><div style="font-size: 12px; margin-bottom: 3px;">${escapeHtml(lang === 'ar' ? s.name.ar : s.name.en)}</div><div style="background: rgba(255,255,255,0.2); height: 4px; border-radius: 2px;"><div style="background: white; height: 100%; border-radius: 2px; width: ${s.level === 'expert' ? '95%' : s.level === 'advanced' ? '75%' : s.level === 'intermediate' ? '50%' : '25%'};"></div></div></div>`).join('')

  const langs = (data.languages || []).map((l) => `<div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;"><span>${escapeHtml(lang === 'ar' ? l.name.ar : l.name.en)}</span><span style="opacity: 0.85;">${escapeHtml(lang === 'ar' ? l.level.ar : l.level.en)}</span></div>`).join('')

  const certs = (data.certifications || []).map((c) => `<div style="font-size: 12px; margin-bottom: 6px;"><strong>${escapeHtml(lang === 'ar' ? c.name.ar : c.name.en)}</strong><br><span style="opacity: 0.85;">${escapeHtml(lang === 'ar' ? c.issuer.ar : c.issuer.en)} · ${escapeHtml(c.date)}</span></div>`).join('')

  return `
    <div class="cv sidebar-color" dir="${lang === 'ar' ? 'rtl' : 'ltr'}" style="font-family: ${fontFamily}; color: #1a1a1a; display: flex; min-height: 100vh;">
      <aside style="width: 35%; background: ${accent}; color: white; padding: 24px;">
        ${data.photo ? `<img src="${escapeHtml(data.photo)}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin: 0 auto 16px; display: block; border: 3px solid white;">` : ''}
        <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 4px;" ${ed('name', lang === 'ar' ? data.name.ar : data.name.en, editable)}>${escapeHtml(lang === 'ar' ? data.name.ar : data.name.en)}</h1>
        <div style="font-size: 13px; opacity: 0.9; margin-bottom: 18px;" ${ed('title', lang === 'ar' ? data.title.ar : data.title.en, editable)}>${escapeHtml(lang === 'ar' ? data.title.ar : data.title.en)}</div>

        <section style="margin-bottom: 18px;">
          <h2 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.3);">${t('التواصل', 'Contact')}</h2>
          <div style="font-size: 11px; line-height: 1.7;" dir="ltr">
            ${data.email ? `<div>${escapeHtml(data.email)}</div>` : ''}
            ${data.phone ? `<div>${escapeHtml(data.phone)}</div>` : ''}
            ${data.location ? `<div>${escapeHtml(lang === 'ar' ? data.location.ar : data.location.en)}</div>` : ''}
            ${data.linkedin ? `<div>${escapeHtml(data.linkedin)}</div>` : ''}
          </div>
        </section>

        ${skills ? `
          <section style="margin-bottom: 18px;">
            <h2 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.3);">${t('المهارات', 'Skills')}</h2>
            ${skills}
          </section>
        ` : ''}

        ${langs ? `
          <section style="margin-bottom: 18px;">
            <h2 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.3);">${t('اللغات', 'Languages')}</h2>
            ${langs}
          </section>
        ` : ''}
      </aside>

      <main style="flex: 1; padding: 24px; background: white;">
        ${data.summary?.[lang] ? `
          <section style="margin-bottom: 20px;">
            <h2 style="font-size: 15px; font-weight: 700; color: ${accent}; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid ${accent}30;">${t('الملخص المهني', 'Profile')}</h2>
            <p style="font-size: 13px; line-height: 1.7; margin: 0; color: #333;" ${ed('summary', data.summary[lang], editable)}>${escapeHtml(data.summary[lang])}</p>
          </section>
        ` : ''}

        ${expHtml ? `
          <section style="margin-bottom: 20px;">
            <h2 style="font-size: 15px; font-weight: 700; color: ${accent}; margin-bottom: 12px; padding-bottom: 4px; border-bottom: 2px solid ${accent}30;">${t('الخبرات المهنية', 'Experience')}</h2>
            ${expHtml}
          </section>
        ` : ''}

        ${eduHtml ? `
          <section style="margin-bottom: 20px;">
            <h2 style="font-size: 15px; font-weight: 700; color: ${accent}; margin-bottom: 12px; padding-bottom: 4px; border-bottom: 2px solid ${accent}30;">${t('التعليم', 'Education')}</h2>
            ${eduHtml}
          </section>
        ` : ''}

        ${certs ? `
          <section>
            <h2 style="font-size: 15px; font-weight: 700; color: ${accent}; margin-bottom: 12px; padding-bottom: 4px; border-bottom: 2px solid ${accent}30;">${t('الشهادات', 'Certifications')}</h2>
            ${certs}
          </section>
        ` : ''}
      </main>
    </div>
  `
}

// ─── Template: minimal_lines ───
function renderMinimalLines(data: CvData, lang: 'ar' | 'en', accent: string, editable?: boolean): string {
  const t = (ar: string, en: string) => lang === 'ar' ? ar : en
  const fontFamily = getFontFamily('cairo')

  let expHtml = (data.experience || []).map((e) => `
    <div style="margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 6px;">
        <div>
          <span style="font-weight: 600; font-size: 14px;">${escapeHtml(lang === 'ar' ? e.position.ar : e.position.en)}</span>
          <span style="color: #888; font-size: 13px;"> · ${escapeHtml(lang === 'ar' ? e.company.ar : e.company.en)}</span>
        </div>
        <div style="font-size: 12px; color: #888;">${escapeHtml(fmtDate(e.startDate, lang))} — ${escapeHtml(fmtDate(e.endDate, lang))}</div>
      </div>
      <div style="font-size: 13px; line-height: 1.6; color: #444;">${escapeHtml(lang === 'ar' ? e.description.ar : e.description.en)}</div>
    </div>
  `).join('')

  let eduHtml = (data.education || []).map((ed) => `
    <div style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 4px;">
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
        <div>
          <span style="font-weight: 600; font-size: 13px;">${escapeHtml(lang === 'ar' ? ed.degree.ar : ed.degree.en)} · ${escapeHtml(lang === 'ar' ? ed.field.ar : ed.field.en)}</span>
          <span style="color: #888; font-size: 12px;"> · ${escapeHtml(lang === 'ar' ? ed.institution.ar : ed.institution.en)}</span>
        </div>
        <div style="font-size: 11px; color: #888;">${escapeHtml(fmtDate(ed.startDate, lang))} — ${escapeHtml(fmtDate(ed.endDate, lang))}</div>
      </div>
    </div>
  `).join('')

  const skills = (data.skills || []).map((s) => escapeHtml(lang === 'ar' ? s.name.ar : s.name.en)).join(' · ')
  const langs = (data.languages || []).map((l) => `${escapeHtml(lang === 'ar' ? l.name.ar : l.name.en)} (${escapeHtml(lang === 'ar' ? l.level.ar : l.level.en)})`).join(' · ')

  return `
    <div class="cv minimal-lines" dir="${lang === 'ar' ? 'rtl' : 'ltr'}" style="font-family: ${fontFamily}; color: #1a1a1a;">
      <header style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 28px; font-weight: 300; margin: 0; letter-spacing: 2px; color: ${accent};" ${ed('name', lang === 'ar' ? data.name.ar : data.name.en, editable)}>${escapeHtml(lang === 'ar' ? data.name.ar : data.name.en)}</h1>
        <div style="font-size: 14px; color: #666; margin-top: 6px; letter-spacing: 1px;" ${ed('title', lang === 'ar' ? data.title.ar : data.title.en, editable)}>${escapeHtml(lang === 'ar' ? data.title.ar : data.title.en)}</div>
        <div style="font-size: 12px; color: #888; margin-top: 8px;" dir="ltr">
          ${[data.email, data.phone, data.location ? (lang === 'ar' ? data.location.ar : data.location.en) : '', data.linkedin].filter(Boolean).map(escapeHtml).join(' · ')}
        </div>
      </header>

      ${data.summary?.[lang] ? `
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 13px; font-weight: 700; color: ${accent}; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; text-align: center;">${t('الملخص', 'Summary')}</h2>
          <p style="font-size: 13px; line-height: 1.7; color: #444; margin: 0; text-align: center; max-width: 90%; margin-inline: auto;" ${ed('summary', data.summary[lang], editable)}>${escapeHtml(data.summary[lang])}</p>
        </section>
      ` : ''}

      ${expHtml ? `
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 13px; font-weight: 700; color: ${accent}; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px; text-align: center;">${t('الخبرات', 'Experience')}</h2>
          ${expHtml}
        </section>
      ` : ''}

      ${eduHtml ? `
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 13px; font-weight: 700; color: ${accent}; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px; text-align: center;">${t('التعليم', 'Education')}</h2>
          ${eduHtml}
        </section>
      ` : ''}

      ${skills ? `
        <section style="margin-bottom: 20px; text-align: center;">
          <h2 style="font-size: 13px; font-weight: 700; color: ${accent}; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px;">${t('المهارات', 'Skills')}</h2>
          <p style="font-size: 13px; color: #444; margin: 0;">${skills}</p>
        </section>
      ` : ''}

      ${langs ? `
        <section style="text-align: center;">
          <h2 style="font-size: 13px; font-weight: 700; color: ${accent}; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px;">${t('اللغات', 'Languages')}</h2>
          <p style="font-size: 13px; color: #444; margin: 0;">${langs}</p>
        </section>
      ` : ''}
    </div>
  `
}

// ─── Master render function ───
export function renderCv(data: CvData, opts: RenderOptions): string {
  const { template, font, accentColor, lang, editable } = opts
  const fontFamily = getFontFamily(font)
  const fontUrl = getFontUrl(font)

  let body = ''
  switch (template) {
    case 'modern_blue':
      body = renderModernBlue(data, lang, accentColor, editable)
      break
    case 'sidebar_color':
      body = renderSidebarColor(data, lang, accentColor, editable)
      break
    case 'minimal_lines':
      body = renderMinimalLines(data, lang, accentColor, editable)
      break
    case 'classic_noir':
    default:
      body = renderClassicNoir(data, lang, accentColor, editable)
      break
  }

  // Common CSS for all templates
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8">
<link href="${fontUrl}" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    background: white;
    font-family: ${fontFamily};
    color: #1a1a1a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body { padding: 24px; }
  .cv { max-width: 800px; margin: 0 auto; }
  .cv-section { margin-bottom: 16px; }
  .section-title { margin-bottom: 8px; }
  .exp-item, .edu-item { margin-bottom: 12px; }
  .exp-header, .edu-header { display: flex; justify-content: space-between; flex-wrap: wrap; }
  .exp-position, .edu-degree { font-weight: 700; font-size: 14px; }
  .exp-company, .edu-inst { font-size: 13px; color: #555; }
  .exp-dates, .edu-dates { font-size: 12px; color: #888; }
  .exp-desc { font-size: 13px; line-height: 1.6; margin-top: 4px; color: #333; }
  .exp-ach { margin: 6px 0 0; padding-inline-start: 18px; font-size: 12px; color: #555; }
  .exp-ach li { margin-bottom: 3px; }

  [contenteditable="true"] {
    outline: 1px dashed ${accentColor}80;
    outline-offset: 2px;
    transition: outline 0.15s;
  }
  [contenteditable="true"]:hover { outline-color: ${accentColor}; }
  [contenteditable="true"]:focus { outline: 2px solid ${accentColor}; background: ${accentColor}08; }

  @media print {
    body { padding: 0; }
    .cv { max-width: 100%; }
  }
  @page { size: A4; margin: 12mm; }
</style>
</head>
<body>
${body}
</body>
</html>`
}
