'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Sparkles,
  Loader2,
  FileText,
  Settings,
  History,
  Palette,
  ChevronDown,
  Wand2,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CV_TEMPLATES,
  CV_FONTS,
  AVAILABLE_MODELS,
  PROVIDER_LABELS,
  PROVIDER_ICONS,
  type Provider,
  type CvData,
  SAMPLE_CV,
} from '@/lib/cv-types'
import { cn } from '@/lib/utils'

export function Generator() {
  const {
    user,
    template,
    font,
    setTemplate,
    setFont,
    setAccentColor,
    setGalleryOpen,
    setSettingsOpen,
    setHistoryOpen,
    setTrashOpen,
    setPreviewOpen,
    setCurrentResume,
    setCvData,
    settings,
    resumes,
    setResumes,
  } = useAppStore()

  const [text, setText] = useState('')
  const [provider, setProvider] = useState<Provider>('zai')
  const [model, setModel] = useState('glm-4.5')
  const [generating, setGenerating] = useState(false)

  // Sync provider/model from settings
  useEffect(() => {
    if (settings) {
      setProvider(settings.defaultProvider as Provider)
      setModel(settings.defaultModel)
    }
  }, [settings])

  const generate = async () => {
    if (!text.trim() || text.trim().length < 10) {
      toast.error('أضف معلوماتك المهنية في المربع')
      return
    }
    setGenerating(true)
    try {
      const tpl = CV_TEMPLATES.find((t) => t.id === template)
      const res = await fetch('/api/cv/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          provider,
          model,
          template,
          font,
          accentColor: tpl?.accentColor || '#1a1a1a',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'فشل توليد السيرة الذاتية', {
          duration: 6000,
        })
        return
      }
      // If we fell back to Z.ai, inform the user
      if (data.fellBack) {
        toast.success(`تم التوليد باستخدام Z.ai GLM-4.5 (احتياطي)`, {
          description: `المزود الأصلي (${data.usedProvider}) فشل — تم التحويل تلقائياً`,
          duration: 5000,
        })
      } else {
        toast.success('تم توليد السيرة الذاتية!')
      }
      setCurrentResume(data.resume.id, data.cvData)
      setAccentColor(data.resume.accentColor)
      setPreviewOpen(true)
      // Refresh resumes list
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
      setText('')
    } catch (e: any) {
      toast.error(e?.message || 'فشل الاتصال')
    } finally {
      setGenerating(false)
    }
  }

  const previewSample = () => {
    setCvData(SAMPLE_CV)
    setCurrentResume(null, SAMPLE_CV)
    setPreviewOpen(true)
    toast.info('معاينة سيرة ذاتية تجريبية')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 glow-violet mb-5">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <h1 className="text-4xl sm:text-6xl font-bold gradient-text">Azzam</h1>
          <span className="text-2xl sm:text-3xl text-violet-300/60 font-light">عزّام</span>
        </div>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
          منشئ السير الذاتية بالذكاء الاصطناعي — الصق بياناتك المهنية، يحوّلها AI إلى سيرة احترافية ثنائية اللغة
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <span className="glass px-3 py-1.5 rounded-full text-xs">✨ 8 قوالب احترافية</span>
          <span className="glass px-3 py-1.5 rounded-full text-xs">✓ متوافق ATS</span>
          <span className="glass px-3 py-1.5 rounded-full text-xs">🎨 ألوان قابلة للتخصيص</span>
          <span className="glass px-3 py-1.5 rounded-full text-xs">🌐 عربي + إنجليزي</span>
          <span className="glass px-3 py-1.5 rounded-full text-xs">📥 PDF + Word</span>
          <span className="glass px-3 py-1.5 rounded-full text-xs">🔤 19 خطاً عربياً</span>
        </div>
      </div>

      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6 glass rounded-2xl p-3">
        <div className="flex items-center gap-2 px-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
          <span className="text-sm text-muted-foreground">الذكاء الاصطناعي مفعّل</span>
        </div>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHistoryOpen(true)}
          className="text-sm"
        >
          <History className="w-4 h-4 ml-2" />
          سيري المحفوظة
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTrashOpen(true)}
          className="text-sm"
        >
          <Trash2 className="w-4 h-4 ml-2" />
          السلة
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          className="text-sm"
        >
          <Settings className="w-4 h-4 ml-2" />
          إعدادات API
        </Button>
      </div>

      {/* Input card */}
      <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-2xl">
        <label className="block mb-3">
          <span className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400" />
            بياناتك المهنية
          </span>
        </label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'اكتب أو الصق معلوماتك هنا...\n\nمثال:\nأسامة غرامة، 28 سنة\nبكالوريوس نظم معلومات من جامعة الملك سعود 2019\nخبرة 5 سنوات في تطوير الويب\nشركة التقنية المتقدمة - مطور Full Stack (2022-الآن)\nTechStart - مطور واجهات (2019-2021)\nمهارات: JavaScript, TypeScript, React, Node.js, Python, SQL, Docker\nلغات: العربية (أم)، الإنجليزية (متقدم)\nشهادات: AWS Certified Developer 2023\nالهاتف: 0501234567\nالبريد: osama@example.com\nالموقع: الرياض، السعودية'}
          className="min-h-[200px] sm:min-h-[240px] bg-background/50 border-border/50 text-sm leading-relaxed resize-y"
          disabled={generating}
        />

        {/* Sample button */}
        <button
          onClick={previewSample}
          className="text-xs text-violet-400 hover:text-violet-300 mt-2 underline-offset-2 hover:underline"
        >
          أو جرّب سيرة ذاتية تجريبية →
        </button>

        {/* Options grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Template picker */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium">القالب</label>
            <button
              onClick={() => setGalleryOpen(true)}
              className="w-full glass rounded-xl p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors text-right"
            >
              <div
                className="w-8 h-8 rounded-lg flex-shrink-0"
                style={{ background: CV_TEMPLATES.find((t) => t.id === template)?.preview }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {CV_TEMPLATES.find((t) => t.id === template)?.name.ar}
                </div>
                <div className="text-xs text-muted-foreground">تصفّح 8 قوالب</div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Font picker */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium">الخط</label>
            <Select value={font} onValueChange={setFont}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CV_FONTS.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.arabicName} · {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Provider */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span>المزوّد المفضّل</span>
              {provider === 'zai' && (
                <span className="text-emerald-400 text-[10px]">● مجاني وغير محدود</span>
              )}
              {provider !== 'zai' && (
                <span className="text-amber-400 text-[10px]">⚠ يحتاج مفتاح API</span>
              )}
            </label>
            <Select value={provider} onValueChange={(v) => {
              setProvider(v as Provider)
              // Auto-set first matching model
              const m = AVAILABLE_MODELS.find((m) => m.provider === v)
              if (m) setModel(m.id)
            }}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PROVIDER_LABELS) as Provider[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {PROVIDER_ICONS[p]} {PROVIDER_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Recommendation banner for non-Z.ai providers */}
        {provider !== 'zai' && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
            <span>💡</span>
            <div>
              <strong>نصيحة:</strong> Z.ai GLM-4.5 مجاني وغير محدود ويعمل دائماً. الأنظمة الأخرى تحتاج مفاتيح API وقد تنفد حصتها. إذا فشل المزود المختار، سنحاول تلقائياً استخدام Z.ai.
            </div>
          </div>
        )}

        {/* Model picker (collapses on mobile) */}
        <div className="mt-3">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="bg-background/50 border-border/50 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_MODELS.filter((m) => m.provider === provider).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} {m.badge && `· ${m.badge}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Generate button */}
        <Button
          onClick={generate}
          disabled={generating || !text.trim()}
          className="w-full mt-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium h-12 rounded-xl glow-violet-sm text-base"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              جاري توليد السيرة الذاتية...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 ml-2" />
              توليد ومعاينة السيرة الذاتية
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          💡 يقوم الذكاء الاصطناعي بترتيب البيانات وترجمتها وصياغة ملخص مهني — دون تزييف أي معلومة
        </p>
      </div>
    </div>
  )
}
