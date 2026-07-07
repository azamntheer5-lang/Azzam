'use client'

import { useAppStore } from '@/lib/store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { CV_TEMPLATES } from '@/lib/cv-types'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export function TemplateGallery() {
  const { galleryOpen, setGalleryOpen, template, setTemplate } = useAppStore()
  const [filter, setFilter] = useState<'all' | 'ats' | 'creative'>('all')

  const filtered = CV_TEMPLATES.filter((t) => filter === 'all' || t.category === filter)

  return (
    <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-strong border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">معرض القوالب</DialogTitle>
          <DialogDescription>
            8 قوالب احترافية — ATS آمنة للفرز وإبداعية ملوّنة. كلها تدعم العربية والإنجليزية.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'ats', label: '✓ ATS آمنة للفرز' },
            { id: 'creative', label: 'إبداعية' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                filter === f.id
                  ? 'bg-violet-600 text-white'
                  : 'glass text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTemplate(t.id)
                setGalleryOpen(false)
              }}
              className={cn(
                'group text-right rounded-2xl overflow-hidden transition-all border-2',
                template === t.id
                  ? 'border-violet-500 glow-violet-sm'
                  : 'border-transparent hover:border-violet-500/50'
              )}
            >
              {/* Mini preview */}
              <div
                className="aspect-[3/4] p-3 relative overflow-hidden"
                style={{ background: t.preview }}
              >
                {/* Mini CV mockup */}
                <div className="bg-white/95 rounded-md h-full p-2 flex flex-col gap-1">
                  <div className="h-2 bg-gray-800 rounded w-2/3" />
                  <div className="h-1 bg-gray-400 rounded w-1/2" />
                  <div className="h-px bg-gray-200 my-1" />
                  <div className="space-y-1">
                    <div className="h-1 bg-gray-700 rounded w-1/3" />
                    <div className="h-1 bg-gray-300 rounded w-full" />
                    <div className="h-1 bg-gray-300 rounded w-5/6" />
                    <div className="h-1 bg-gray-300 rounded w-4/5" />
                  </div>
                  <div className="mt-1 space-y-1">
                    <div className="h-1 bg-gray-700 rounded w-1/4" />
                    <div className="h-1 bg-gray-300 rounded w-full" />
                    <div className="h-1 bg-gray-300 rounded w-3/4" />
                  </div>
                </div>

                {/* Selected badge */}
                {template === t.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Category badge */}
                <div
                  className={cn(
                    'absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium',
                    t.category === 'ats' ? 'bg-emerald-500/90 text-white' : 'bg-fuchsia-500/90 text-white'
                  )}
                >
                  {t.category === 'ats' ? 'ATS' : 'إبداعي'}
                </div>
              </div>

              {/* Name */}
              <div className="p-3 glass">
                <div className="text-sm font-medium">{t.name.ar}</div>
                <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{t.description}</div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
