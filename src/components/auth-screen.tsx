'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'

export function AuthScreen() {
  const setUser = useAppStore((s) => s.setUser)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body =
        mode === 'login'
          ? { email, password }
          : { email, password, name }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'حدث خطأ')
        return
      }

      setUser(data)
      toast.success(mode === 'login' ? 'مرحباً بعودتك!' : 'تم إنشاء الحساب بنجاح!')
    } catch {
      toast.error('فشل الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-fuchsia-600/15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl glass glow-violet mb-4">
            <Sparkles className="w-10 h-10 text-violet-400" />
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-2">Azzam</h1>
          <p className="text-sm text-violet-300/70 mb-1">عزّام</p>
          <p className="text-muted-foreground">
            سيرتك الذاتية الاحترافية بالذكاء الاصطناعي — عربي + إنجليزي
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-2xl">
          <div className="flex gap-2 p-1 rounded-2xl bg-background/40 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <div className="relative">
                  <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اكتب اسمك"
                    className="pr-10 bg-background/50 border-border/50"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pr-10 bg-background/50 border-border/50"
                  required
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10 bg-background/50 border-border/50"
                  required
                  dir="ltr"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium py-2.5 h-11 rounded-xl glow-violet-sm transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري المعالجة...
                </>
              ) : mode === 'login' ? (
                'دخول'
              ) : (
                'إنشاء الحساب'
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            {mode === 'login' ? 'ليس لديك حساب؟ ' : 'لديك حساب؟ '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-violet-400 hover:text-violet-300 font-medium"
            >
              {mode === 'login' ? 'أنشئ حساباً' : 'سجّل دخول'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          بدعم GLM-4.5 من Z.ai · GPT-4o · Claude 3.5
        </p>
      </div>
    </div>
  )
}