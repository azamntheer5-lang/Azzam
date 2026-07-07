'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { AuthScreen } from '@/components/auth-screen'
import { Generator } from '@/components/generator'
import { TemplateGallery } from '@/components/template-gallery'
import { SettingsSheet } from '@/components/settings-sheet'
import { CvPreview } from '@/components/cv-preview'
import { HistoryDrawer, TrashDrawer } from '@/components/history-drawer'
import { Toaster } from 'sonner'

export default function Home() {
  const { user, loading, setLoading, setUser, setSettings } = useAppStore()

  useEffect(() => {
    // Check session
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user)
        // Load settings if logged in
        if (data.user) {
          return fetch('/api/settings').then((r) => r.json())
        }
      })
      .then((data) => {
        if (data) setSettings(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [setUser, setSettings, setLoading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <>
      <Generator />
      <TemplateGallery />
      <SettingsSheet />
      <CvPreview />
      <HistoryDrawer />
      <TrashDrawer />
    </>
  )
}
