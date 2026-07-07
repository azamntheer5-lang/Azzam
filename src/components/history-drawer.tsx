'use client'

import { useAppStore } from '@/lib/store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, Trash2, Clock, Eye, X } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { CV_TEMPLATES } from '@/lib/cv-types'

export function HistoryDrawer() {
  const {
    historyOpen,
    setHistoryOpen,
    setTrashOpen,
    resumes,
    setResumes,
    setCurrentResume,
    setCvData,
    setTemplate,
    setFont,
    setAccentColor,
    setPreviewOpen,
  } = useAppStore()

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (historyOpen) load()
  }, [historyOpen])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/resumes')
      const data = await res.json()
      if (res.ok) setResumes(data.resumes)
    } catch {
      toast.error('فشل التحميل')
    } finally {
      setLoading(false)
    }
  }

  const open = async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}`)
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'فشل التحميل')
        return
      }
      const r = data.resume
      setCurrentResume(r.id, r.data)
      setTemplate(r.template)
      setFont(r.font)
      setAccentColor(r.accentColor)
      setHistoryOpen(false)
      setPreviewOpen(true)
      toast.success('تم تحميل السيرة الذاتية')
    } catch {
      toast.error('فشل التحميل')
    }
  }

  const trash = async (id: string) => {
    try {
      await fetch(`/api/resumes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTrash: true }),
      })
      setResumes(resumes.filter((r) => r.id !== id))
      toast.success('تم النقل إلى السلة')
    } catch {
      toast.error('فشل الحذف')
    }
  }

  const fmtDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col glass-strong border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">سيري الذاتية المحفوظة</DialogTitle>
          <DialogDescription>
            {resumes.length} سيرة ذاتية محفوظة. كل تعديل ينشئ نسخة جديدة.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">لا توجد سير محفوظة بعد</p>
              <p className="text-xs text-muted-foreground mt-1">أنشئ سيرتك الأولى من الصفحة الرئيسية</p>
            </div>
          ) : (
            <div className="space-y-2">
              {resumes.map((r) => {
                const tpl = CV_TEMPLATES.find((t) => t.id === r.template)
                return (
                  <div
                    key={r.id}
                    className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-accent/30 transition-colors group"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white"
                      style={{ background: tpl?.preview || '#333' }}
                    >
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{r.candidateName || 'سيرة ذاتية'}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {fmtDate(r.updatedAt)}
                        </span>
                        <span>·</span>
                        <span>نسخة {r.version}</span>
                        <span>·</span>
                        <span>{tpl?.name.ar || r.template}</span>
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => open(r.id)}
                        className="w-9 h-9 hover:bg-violet-500/20 hover:text-violet-300"
                        title="فتح"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => trash(r.id)}
                        className="w-9 h-9 hover:bg-destructive/20 hover:text-destructive"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-4 pt-4 border-t border-border/50">
          <Button variant="ghost" onClick={() => {
            setHistoryOpen(false)
            setTrashOpen(true)
          }}>
            <Trash2 className="w-4 h-4 ml-2" />
            سلة المهملات
          </Button>
          <Button variant="ghost" onClick={() => setHistoryOpen(false)}>
            <X className="w-4 h-4 ml-2" />
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TrashDrawer() {
  const { trashOpen, setTrashOpen, setResumes } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (trashOpen) load()
  }, [trashOpen])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/resumes?trash=1')
      const data = await res.json()
      if (res.ok) setItems(data.resumes)
    } catch {
      toast.error('فشل التحميل')
    } finally {
      setLoading(false)
    }
  }

  const restore = async (id: string) => {
    try {
      await fetch(`/api/resumes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTrash: false }),
      })
      setItems(items.filter((i) => i.id !== id))
      toast.success('تم الاسترجاع')
      // Refresh main list
      const res = await fetch('/api/resumes')
      const data = await res.json()
      if (res.ok) setResumes(data.resumes)
    } catch {
      toast.error('فشل الاسترجاع')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('حذف نهائي؟ لا يمكن التراجع.')) return
    try {
      await fetch(`/api/resumes/${id}`, { method: 'DELETE' })
      setItems(items.filter((i) => i.id !== id))
      toast.success('تم الحذف نهائياً')
    } catch {
      toast.error('فشل الحذف')
    }
  }

  return (
    <Dialog open={trashOpen} onOpenChange={setTrashOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col glass-strong border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">سلة المهملات</DialogTitle>
          <DialogDescription>يمكنك استرجاع السير المحذوفة.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">السلة فارغة</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((r) => (
                <div
                  key={r.id}
                  className="glass rounded-2xl p-4 flex items-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-destructive/20 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{r.candidateName || 'سيرة ذاتية'}</div>
                    <div className="text-xs text-muted-foreground">
                      آخر تحديث: {new Date(r.updatedAt).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => restore(r.id)}
                    className="hover:bg-emerald-500/20 hover:text-emerald-300"
                  >
                    استرجاع
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(r.id)}
                    className="hover:bg-destructive/20 hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-border/50">
          <Button variant="ghost" onClick={() => setTrashOpen(false)}>إغلاق</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
