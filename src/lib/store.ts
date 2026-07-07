'use client'

import { create } from 'zustand'
import type { CvData, Provider } from './cv-types'

export interface User {
  id: string
  email: string
  name: string
  role?: string
}

export interface ResumeMeta {
  id: string
  candidateName: string
  template: string
  font: string
  accentColor: string
  version: number
  createdAt: string
  updatedAt: string
}

export interface Settings {
  openaiKey: string
  anthropicKey: string
  ollamaUrl: string
  defaultProvider: string
  defaultModel: string
  temperature: number
}

interface AppState {
  user: User | null
  loading: boolean

  resumes: ResumeMeta[]
  currentResumeId: string | null
  cvData: CvData | null
  template: string
  font: string
  accentColor: string
  previewLang: 'ar' | 'en'
  editMode: boolean
  a4Mode: boolean

  settings: Settings | null
  settingsOpen: boolean
  galleryOpen: boolean
  historyOpen: boolean
  previewOpen: boolean
  trashOpen: boolean

  setUser: (u: User | null) => void
  setLoading: (b: boolean) => void
  setResumes: (r: ResumeMeta[]) => void
  setCurrentResume: (id: string | null, data: CvData | null) => void
  setCvData: (d: CvData | null) => void
  setTemplate: (t: string) => void
  setFont: (f: string) => void
  setAccentColor: (c: string) => void
  setPreviewLang: (l: 'ar' | 'en') => void
  setEditMode: (b: boolean) => void
  setA4Mode: (b: boolean) => void
  setSettings: (s: Settings | null) => void
  setSettingsOpen: (b: boolean) => void
  setGalleryOpen: (b: boolean) => void
  setHistoryOpen: (b: boolean) => void
  setPreviewOpen: (b: boolean) => void
  setTrashOpen: (b: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  loading: true,
  resumes: [],
  currentResumeId: null,
  cvData: null,
  template: 'classic_noir',
  font: 'cairo',
  accentColor: '#1a1a1a',
  previewLang: 'ar',
  editMode: false,
  a4Mode: false,
  settings: null,
  settingsOpen: false,
  galleryOpen: false,
  historyOpen: false,
  previewOpen: false,
  trashOpen: false,

  setUser: (u) => set({ user: u }),
  setLoading: (b) => set({ loading: b }),
  setResumes: (r) => set({ resumes: r }),
  setCurrentResume: (id, data) =>
    set({ currentResumeId: id, cvData: data }),
  setCvData: (d) => set({ cvData: d }),
  setTemplate: (t) => set({ template: t }),
  setFont: (f) => set({ font: f }),
  setAccentColor: (c) => set({ accentColor: c }),
  setPreviewLang: (l) => set({ previewLang: l }),
  setEditMode: (b) => set({ editMode: b }),
  setA4Mode: (b) => set({ a4Mode: b }),
  setSettings: (s) => set({ settings: s }),
  setSettingsOpen: (b) => set({ settingsOpen: b }),
  setGalleryOpen: (b) => set({ galleryOpen: b }),
  setHistoryOpen: (b) => set({ historyOpen: b }),
  setPreviewOpen: (b) => set({ previewOpen: b }),
  setTrashOpen: (b) => set({ trashOpen: b }),
}))
