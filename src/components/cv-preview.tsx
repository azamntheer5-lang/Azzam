'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  X,
  Download,
  FileText,
  Save,
  Edit3,
  Eye,
  Languages,
  Palette,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CV_TEMPLATES, type CvData } from '@/lib/cv-types'

const PRESET_COLORS = [
  '#1a1a1a', '#2563eb', '#7c3aed', '#db2777',
  '#0f766e', '#991b1b', '#7c2d12', '#4338ca',
  '#059669', '#ea580c', '#0891b2', '#be185d',
]

export function CvPreview() {
  const {
    previewOpen,
    setPreviewOpen,
    currentResumeId,
    cvData,
    template,
    font,
    accentColor,
    previewLang,
    editMode,
    a4Mode,
    setAccentColor,
    setPreviewLang,
    setEditMode,
    setA4Mode,
    setCvData,
    setCurrentResume,
    setResumes,
    resumes,
  } = useAppStore()

  const [showColors, setShowColors] = useState(false)
  const [saving, setSaving] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [downloadingDocx, setDownloadingDocx] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeKey, setIframeKey] = useState(0)

  // Build preview HTML and load into iframe
  const loadPreview = useCallback(async () => {
    if (!cvData) return
    try {
      const res = await fetch('/api/cv/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvData,
          template,
          font,
          accentColor,
          lang: previewLang,
          editable: editMode,
        }),
      })
      const html = await res.text()
      const iframe = iframeRef.current
      if (iframe) {
        const doc = iframe.contentDocument
        if (doc) {
          doc.open()
          doc.write(html)
          doc.close()
        }
      }
    } catch (e) {
      console.error('Preview load failed:', e)
    }
  }, [cvData, template, font, accentColor, previewLang, editMode])

  useEffect(() => {
    if (previewOpen) {
      loadPreview()
    }
  }, [previewOpen, loadPreview, iframeKey])

  // Reload iframe when key params change
  const reloadIframe = () => setIframeKey((k) => k + 1)

  // Capture edits from iframe
  const captureEdits = useCallback(() => {
    if (!cvData) return null
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return null

    const doc = iframe.contentDocument
    const edited = JSON.parse(JSON.stringify(cvData)) as CvData

    // Find all editable elements and update data
    const editables = doc.querySelectorAll('[contenteditable="true"][data-field]')
    const updates: Record<string, string> = {}
    editables.forEach((el) => {
      const field = el.getAttribute('data-field')
      const text = el.textContent || ''
      if (field) updates[field] = text
    })

    if (updates.name) {
      edited.name[previewLang] = updates.name
    }
    if (updates.title) {
      edited.title[previewLang] = updates.title
    }
    if (updates.summary) {
      edited.summary[previewLang] = updates.summary
    }

    return edited
  }, [cvData, previewLang])

  const save = async () => {
    if (!cvData) return
    setSaving(true)
    try {
      // Capture latest edits
      const edited = editMode ? captureEdits() : cvData
      if (edited) setCvData(edited)

      const tpl = CV_TEMPLATES.find((t) => t.id === template)
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: currentResumeId,
          cvData: edited,
          template,
          font,
          accentColor,
          candidateName: edited?.name?.ar || edited?.name?.en || 'سيرة ذاتية',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'فشل الحفظ')
        return
      }
      toast.success('تم الحفظ ✓')
      if (!currentResumeId) {
        setCurrentResume(data.resume.id, edited)
        setResumes([
          {
            id: data.resume.id,
            candidateName: data.resume.candidateName,
            template: data.resume.template,
            font: data.resume.font,
            accentColor: data.resume.accentColor,
            version: data.resume.version,
            createdAt: data.resume.createdAt,
            updatedAt: data.resume.updatedAt,
          },
          ...resumes,
        ])
      }
    } catch {
      toast.error('فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const downloadPdf = async () => {
    // Make sure to capture edits first if in edit mode
    if (editMode) {
      const edited = captureEdits()
      if (edited) setCvData(edited)
    }
    setDownloadingPdf(true)
    // Wait for next render
    await new Promise((r) => setTimeout(r, 200))
    try {
      const iframe = iframeRef.current
      if (!iframe?.contentWindow) return
      // Trigger print dialog (user can "Save as PDF")
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      toast.info('اختر "Save as PDF" في نافذة الطباعة')
    } catch (e) {
      toast.error('فشل تنزيل PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const downloadDocx = async () => {
    if (!cvData) return
    setDownloadingDocx(true)
    try {
      // Capture edits
      const edited = editMode ? captureEdits() : cvData
      if (edited) setCvData(edited)

      const res = await fetch('/api/cv/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvData: edited,
          lang: previewLang,
          resumeId: currentResumeId,
        }),
      })
      if (!res.ok) {
        toast.error('فشل التصدير')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = (edited?.name?.ar || edited?.name?.en || 'CV').replace(/\s+/g, '_') + '.docx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('تم تنزيل Word ✓')
    } catch (e) {
      toast.error('فشل التصدير')
    } finally {
      setDownloadingDocx(false)
    }
  }

  if (!previewOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm">
      {/* Header / Toolbar */}
      <div className="flex items-center gap-2 px-3 py-3 glass-strong border-b border-border/50 flex-wrap">
        <div className="flex items-center gap-2 mr-2">
          <FileText className="w-5 h-5 text-violet-400" />
          <span className="font-bold gradient-text">Azzam</span>
          <span className="text-muted-foreground hidden sm:inline">· معاينة السيرة</span>
        </div>

        <div className="flex-1" />

        {/* Language toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-background/40">
          <button
            onClick={() => setPreviewLang('ar')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              previewLang === 'ar' ? 'bg-violet-600 text-white' : 'text-muted-foreground'
            )}
          >
            عربي
          </button>
          <button
            onClick={() => setPreviewLang('en')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              previewLang === 'en' ? 'bg-violet-600 text-white' : 'text-muted-foreground'
            )}
          >
            EN
          </button>
        </div>

        {/* Edit toggle */}
        <Button
          variant={editMode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            setEditMode(!editMode)
            // Need to reload iframe to apply editable attrs
            setTimeout(reloadIframe, 100)
          }}
          className={editMode ? 'bg-violet-600 text-white' : ''}
        >
          <Edit3 className="w-4 h-4 ml-1.5" />
          <span className="text-sm hidden sm:inline">{editMode ? 'تعديل مفعّل' : 'تعديل'}</span>
        </Button>

        {/* Colors */}
        <Button
          variant={showColors ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setShowColors(!showColors)}
          className={showColors ? 'bg-violet-600 text-white' : ''}
        >
          <Palette className="w-4 h-4 ml-1.5" />
          <span className="text-sm hidden sm:inline">ألوان</span>
        </Button>

        {/* A4 mode */}
        <Button
          variant={a4Mode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setA4Mode(!a4Mode)}
          className={a4Mode ? 'bg-violet-600 text-white' : ''}
        >
          <Eye className="w-4 h-4 ml-1.5" />
          <span className="text-sm hidden sm:inline">A4</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={save}
          disabled={saving}
          className="bg-amber-600/90 hover:bg-amber-500 text-white"
        >
          {saving ? <Loader2 className="w-4 h-4 ml-1.5 animate-spin" /> : <Save className="w-4 h-4 ml-1.5" />}
          <span className="text-sm hidden sm:inline">حفظ</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={downloadPdf}
          disabled={downloadingPdf}
          className="bg-sky-600/90 hover:bg-sky-500 text-white"
        >
          {downloadingPdf ? <Loader2 className="w-4 h-4 ml-1.5 animate-spin" /> : <Download className="w-4 h-4 ml-1.5" />}
          <span className="text-sm hidden sm:inline">PDF</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={downloadDocx}
          disabled={downloadingDocx}
          className="bg-blue-700/90 hover:bg-blue-600 text-white"
        >
          {downloadingDocx ? <Loader2 className="w-4 h-4 ml-1.5 animate-spin" /> : <Download className="w-4 h-4 ml-1.5" />}
          <span className="text-sm hidden sm:inline">Word</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPreviewOpen(false)}
          className="ml-1"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Color bar */}
      {showColors && (
        <div className="px-4 py-3 glass border-b border-border/50 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">اللون الأساسي:</span>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setAccentColor(c)}
              className={cn(
                'w-8 h-8 rounded-full transition-all border-2',
                accentColor === c ? 'border-white scale-110' : 'border-transparent hover:scale-110'
              )}
              style={{ background: c }}
            />
          ))}
          <div className="flex-1" />
          <label className="text-xs text-muted-foreground font-medium cursor-pointer flex items-center gap-2">
            مخصص:
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
          </label>
        </div>
      )}

      {/* Edit hint */}
      {editMode && (
        <div className="px-4 py-2 bg-violet-600/10 border-b border-violet-500/30 text-xs text-violet-200 flex items-center gap-2">
          <Edit3 className="w-3.5 h-3.5" />
          انقر أي نص để تعديله مباشرةً (الاسم، المسمى الوظيفي، الملخص فقط). اضغط «حفظ» بعد التعديل.
        </div>
      )}

      {/* Preview body */}
      <div className="flex-1 overflow-auto bg-zinc-800 p-4 sm:p-8 flex justify-center">
        <div
          className={cn(
            'bg-white shadow-2xl transition-all',
            a4Mode ? 'w-[210mm] min-h-[297mm]' : 'w-full max-w-[800px]'
          )}
        >
          <iframe
            ref={iframeRef}
            key={iframeKey}
            title="CV Preview"
            className="w-full h-full min-h-[297mm] border-0"
            sandbox="allow-same-origin allow-scripts allow-modals"
          />
        </div>
      </div>
    </div>
  )
}
