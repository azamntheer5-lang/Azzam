# Azzam — منشئ السير الذاتية بالذكاء الاصطناعي

<p align="center">
  <strong>Azzam</strong> · منصّة عربية لإنشاء سير ذاتية احترافية ثنائية اللغة بالذكاء الاصطناعي
</p>

<p align="center">
  <a href="#المميزات">المميزات</a> ·
  <a href="#التقنيات">التقنيات</a> ·
  <a href="#التشغيل">التشغيل</a> ·
  <a href="#النشر">النشر</a> ·
  <a href="#الرخصة">الرخصة</a>
</p>

---

## نبذة

**Azzam** تطبيق ويب عربي يحوّل بياناتك المهنية الخام (مرتّبة أو غير مرتّبة) إلى سيرة ذاتية احترافية جاهزة للطباعة بتنسيق PDF و Word. يدعم التطبيق 4 مزودين للذكاء الاصطناعي مع تبديل احتياطي تلقائي، و8 قوالب احترافية متوافقة مع أنظمة الفرز الآلي (ATS)، و19 خطاً عربياً، وتخصيص ألوان كامل.

## المميزات

### 🤖 محرك ذكاء اصطناعي متعدد المزودين
- **Z.ai GLM-4.5** — مجاني ومتاح فوراً بدون مفتاح API
- **OpenAI** — GPT-4o, GPT-4o Mini
- **Anthropic** — Claude 3.5 Sonnet, Claude 3 Haiku
- **Ollama** — Qwen 2.5, Llama 3.2 (نماذج محلية مفتوحة)
- **تبديل احتياطي**: عند فشل المزود الأساسي ينتقل تلقائياً لـ Z.ai

### 📄 توليد السير الذاتية
- إدخال نص خام غير مرتّب → AI يستخرج ويهيكل البيانات
- **ثنائي اللغة تلقائياً**: عربي + إنجليزي لكل حقل
- صياغة ملخص مهني تلقائي
- تنظيم المهارات بمستوياتها (beginner → expert)
- لا يبتكر معلومات غير موجودة في الإدخال

### 🎨 القوالب والتصميم
- **8 قوالب احترافية**:
  - ATS: Classic Noir, Modern Blue, Minimal Lines, Executive
  - إبداعية: Color Sidebar, Elegant Serif, Compact Two-Column, Vibrant Modern
- معرض بصري مع فلترة حسب النوع
- معاينة مصغّرة لكل قالب

### ✏️ المعاينة والتعديل
- iframe مع معاينة حية A4
- تبديل عربي/إنجليزي فوري
- **تعديل المحتوى مباشرة** (contenteditable)
- **12 لون جاهز** + منتقي ألوان مخصص
- وضع A4 دقيق لمحاكاة الطباعة

### 📥 التصدير
- **PDF**: عبر نافذة الطباعة (Save as PDF)
- **Word (.docx)**: مكتبة docx مع دعم RTL كامل

### 💾 المحفوظات
- قائمة بكل السير المحفوظة مع نسخها
- رقم النسخة + تاريخ آخر تحديث
- نقل للسلة (Soft delete) + استرجاع

### 🔐 المصادقة
- تسجيل حساب جديد / دخول / خروج (JWT + bcrypt)
- جلسات محفوظة 30 يوماً
- كل مستخدم له سيره الخاصة

### 🌐 واجهة عربية كاملة
- تصميم RTL فخم داكن (Premium Dark)
- خط Cairo الافتراضي + 18 خط عربي اختياري
- Glassmorphism + Glow effects
- متجاوب بالكامل (mobile + desktop)

## التقنيات

| الفئة | التقنية |
|------|---------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma ORM + SQLite |
| Auth | JWT + bcrypt |
| AI Providers | Z.AI SDK, OpenAI, Anthropic, Ollama |
| DOCX export | docx + file-saver |
| Notifications | sonner |
| State | Zustand |

## التشغيل

### المتطلبات
- Node.js 18+ أو Bun
- npm / bun / pnpm

### الخطوات

1. **استنساخ المستودع**:
```bash
git clone https://github.com/azamntheer5-lang/azzam.git
cd azzam
```

2. **تثبيت التبعيات**:
```bash
bun install
# أو
npm install
```

3. **إعداد متغيرات البيئة**:
```bash
cp .env.example .env
# عدّل قيم JWT_SECRET و DATABASE_URL
```

4. **تهيئة قاعدة البيانات**:
```bash
bun run db:push
```

5. **تشغيل خادم التطوير**:
```bash
bun run dev
```

افتح المتصفح على `http://localhost:3000`

### إعداد مفاتيح AI الاختيارية

- **Z.ai**: مفعّل افتراضياً، لا يحتاج مفتاح
- **OpenAI**: احصل على مفتاح من https://platform.openai.com/api-keys
- **Anthropic**: احصل على مفتاح من https://console.anthropic.com/settings/keys
- **Ollama**: ثبّته من https://ollama.com ثم شغّل `ollama serve`

أضف المفاتيح من صفحة "إعدادات API" داخل التطبيق بعد تسجيل الدخول.

## النشر

### على Vercel (موصى به)

> ⚠️ **مهم**: Vercel لا يدعم SQLite (نظام ملفات read-only). يجب استخدام PostgreSQL.

1. ارفع المستودع إلى GitHub (تم ✓)
2. أنشئ قاعدة بيانات PostgreSQL مجانية على أحد هذه الخيارات:
   - **Neon** (موصى به، مجاني تماماً): https://neon.tech
   - **Supabase**: https://supabase.com
   - **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
3. اذهب إلى https://vercel.com/new واختر المستودع
4. أضف متغيرات البيئة (انظر القسم التالي)
5. انشر ✨

#### متغيرات البيئة المطلوبة على Vercel

| المتغير | الوصف | مثال |
|---------|------|------|
| `DATABASE_URL` | رابط PostgreSQL | `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require` |
| `JWT_SECRET` | سلسلة عشوائية طويلة (32+ حرف) لتوقيع جلسات المستخدمين | `a8f2c9d4e1b7...` (استخدم `openssl rand -hex 32`) |

> 💡 **مفاتيح الذكاء الاصطناعي** (OpenAI, Anthropic) لا تُضاف في متغيرات البيئة — تُضاف من داخل التطبيق بعد تسجيل الدخول (صفحة "إعدادات API") وتُحفظ في قاعدة البيانات لكل مستخدم على حدة.
> Z.ai GLM-4.5 يعمل فوراً بدون أي مفتاح.

6. بعد أول نشر، شغّل أمر تهيئة قاعدة البيانات:
```bash
npx prisma db push
```
(يمكنك تشغيله محلياً مع `DATABASE_URL` الخاص بـ Vercel، أو من Vercel CLI)

### على خادم خاص

```bash
bun run build
bun run start
```

## بنية المشروع

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/               # مصادقة (login, register, logout, me)
│   │   ├── cv/                 # توليد، معاينة، تصدير السير
│   │   ├── resumes/            # إدارة المحفوظات
│   │   └── settings/           # إعدادات المستخدم
│   ├── layout.tsx              # التخطيط الرئيسي + RTL
│   ├── page.tsx                # الصفحة الرئيسية
│   └── globals.css             # نظام التصميم الفخم الداكن
├── components/
│   ├── auth-screen.tsx         # شاشة تسجيل الدخول
│   ├── generator.tsx           # واجهة الإدخال الرئيسية
│   ├── cv-preview.tsx          # معاينة + شريط أدوات
│   ├── template-gallery.tsx    # معرض القوالب
│   ├── history-drawer.tsx      # المحفوظات + السلة
│   ├── settings-sheet.tsx      # إعدادات API
│   └── ui/                     # مكونات shadcn/ui
└── lib/
    ├── ai.ts                   # عملاء مزودي AI
    ├── auth.ts                 # JWT + bcrypt
    ├── cv-renderer.ts          # محرك تحويل البيانات → HTML
    ├── cv-types.ts             # الأنواع + القوالب + الخطوط
    ├── db.ts                   # Prisma client
    └── store.ts                # Zustand state
```

## الترخيص

MIT License — حر للاستخدام والتعديل والنشر.

---

<p align="center">
  صُنع بشغف ✨ — <strong>Azzam</strong> · عزّام
</p>
