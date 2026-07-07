'use client'

import { useState, useEffect } from 'react'
import { useAppStore, type Settings as SettingsType } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Key, Eye, EyeOff, Server, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AVAILABLE_MODELS, PROVIDER_LABELS, PROVIDER_ICONS, type Provider } from '@/lib/cv-types'

export function SettingsSheet() {
  const { settingsOpen, setSettingsOpen, setSettings } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showOpenaiKey, setShowOpenaiKey] = useState(false)
  const [showAnthropicKey, setShowAnthropicKey] = useState(false)
  const [showGeminiKey, setShowGeminiKey] = useState(false)

  const [form, setForm] = useState<SettingsType>({
    openaiKey: '',
    anthropicKey: '',
    geminiKey: '',
    ollamaUrl: 'http://localhost:11434',
    defaultProvider: 'zai',
    defaultModel: 'glm-4.5',
    temperature: 0.4,
  })

  useEffect(() => {
    if (settingsOpen) loadSettings()
  }, [settingsOpen])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (res.ok) {
        setForm(data)
        setSettings(data)
      }
    } catch {
      toast.error('فشل تحميل الإعدادات')
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'فشل الحفظ')
        return
      }
      toast.success('تم حفظ الإعدادات')
      setSettings(form)
      setSettingsOpen(false)
    } catch {
      toast.error('فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const update = (key: keyof SettingsType, value: any) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
      <SheetContent side="left" className="w-full sm:max-w-lg overflow-y-auto glass-strong border-l border-border/50">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl gradient-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            إعدادات الذكاء الاصطناعي
          </SheetTitle>
          <SheetDescription>
            أدر مفاتيح API والمزود الافتراضي. Z.ai GLM مجاني ومتاح فوراً.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Default provider */}
            <section className="glass rounded-2xl p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                المزود الافتراضي
              </h3>

              <div className="space-y-2">
                <Label>المزود</Label>
                <Select value={form.defaultProvider} onValueChange={(v) => {
                  update('defaultProvider', v)
                  const m = AVAILABLE_MODELS.find((m) => m.provider === v)
                  if (m) update('defaultModel', m.id)
                }}>
                  <SelectTrigger className="bg-background/50">
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

              <div className="space-y-2">
                <Label>النموذج الافتراضي</Label>
                <Select value={form.defaultModel} onValueChange={(v) => update('defaultModel', v)}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_MODELS.filter((m) => m.provider === form.defaultProvider).map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} {m.badge && `· ${m.badge}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  💡 Z.ai GLM-4.5 مجاني ومتاح فوراً بدون مفتاح API
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>درجة الإبداع (Temperature)</Label>
                  <span className="text-sm text-violet-400 font-mono">{form.temperature.toFixed(1)}</span>
                </div>
                <Slider
                  value={[form.temperature]}
                  onValueChange={(v) => update('temperature', v[0])}
                  min={0}
                  max={1.5}
                  step={0.1}
                  className="py-2"
                />
                <p className="text-xs text-muted-foreground">
                  قيمة منخفضة (0.2) = إجابات دقيقة | قيمة عالية (0.8) = إجابات إبداعية
                </p>
              </div>
            </section>

            {/* OpenAI */}
            <section className="glass rounded-2xl p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                مفتاح OpenAI
              </h3>
              <p className="text-xs text-muted-foreground">مطلوب لاستخدام GPT-4o, GPT-4o Mini</p>
              <div className="relative">
                <Input
                  type={showOpenaiKey ? 'text' : 'password'}
                  value={form.openaiKey.startsWith('set:') ? '' : form.openaiKey}
                  onChange={(e) => update('openaiKey', e.target.value)}
                  placeholder={form.openaiKey.startsWith('set:') ? `مُهيأ ••••${form.openaiKey.slice(-3)}` : 'sk-...'}
                  className="bg-background/50 pl-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-400 hover:underline"
              >
                احصل على مفتاح API من OpenAI ←
              </a>
            </section>

            {/* Anthropic */}
            <section className="glass rounded-2xl p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Key className="w-4 h-4 text-fuchsia-400" />
                مفتاح Anthropic
              </h3>
              <p className="text-xs text-muted-foreground">مطلوب لاستخدام Claude 3.5 Sonnet, Claude 3 Haiku</p>
              <div className="relative">
                <Input
                  type={showAnthropicKey ? 'text' : 'password'}
                  value={form.anthropicKey.startsWith('set:') ? '' : form.anthropicKey}
                  onChange={(e) => update('anthropicKey', e.target.value)}
                  placeholder={form.anthropicKey.startsWith('set:') ? `مُهيأ ••••${form.anthropicKey.slice(-3)}` : 'sk-ant-...'}
                  className="bg-background/50 pl-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showAnthropicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-400 hover:underline"
              >
                احصل على مفتاح API من Anthropic ←
              </a>
            </section>

            {/* Gemini */}
            <section className="glass rounded-2xl p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Key className="w-4 h-4 text-sky-400" />
                مفتاح Google Gemini
              </h3>
              <p className="text-xs text-muted-foreground">مطلوب لاستخدام Gemini 1.5 Flash, Gemini 1.5 Pro, Gemini 2.0 Flash</p>
              <div className="relative">
                <Input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={form.geminiKey.startsWith('set:') ? '' : form.geminiKey}
                  onChange={(e) => update('geminiKey', e.target.value)}
                  placeholder={form.geminiKey.startsWith('set:') ? `مُهيأ ••••${form.geminiKey.slice(-3)}` : 'AIza...'}
                  className="bg-background/50 pl-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-400 hover:underline"
              >
                احصل على مفتاح API من Google AI Studio ←
              </a>
            </section>

            {/* Ollama */}
            <section className="glass rounded-2xl p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                خادم Ollama
              </h3>
              <p className="text-xs text-muted-foreground">للنماذج المفتوحة محلياً (Qwen, Llama)</p>
              <Input
                type="url"
                value={form.ollamaUrl}
                onChange={(e) => update('ollamaUrl', e.target.value)}
                placeholder="http://localhost:11434"
                className="bg-background/50"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                ثبّت Ollama من ollama.com ثم شغّل <code className="text-violet-300">ollama serve</code>
              </p>
            </section>
          </div>
        )}

        <SheetFooter className="mt-8 flex-row gap-2">
          <Button onClick={() => setSettingsOpen(false)} variant="ghost" className="flex-1">
            إلغاء
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white glow-violet-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
            حفظ الإعدادات
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
