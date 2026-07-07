// Shared types for the CV generator app

export type Provider = 'zai' | 'openai' | 'anthropic' | 'ollama' | 'gemini'

export interface CvSection {
  id: string
  title: { ar: string; en: string }
  items: any[]
}

export interface CvData {
  // Personal info
  name: { ar: string; en: string }
  title: { ar: string; en: string }
  email: string
  phone: string
  location: { ar: string; en: string }
  website?: string
  linkedin?: string
  github?: string
  photo?: string // base64 data URL

  // Summary / objective
  summary: { ar: string; en: string }

  // Sections
  experience: Array<{
    company: { ar: string; en: string }
    position: { ar: string; en: string }
    startDate: string
    endDate: string
    location?: { ar: string; en: string }
    description: { ar: string; en: string }
    achievements?: string[]
  }>

  education: Array<{
    institution: { ar: string; en: string }
    degree: { ar: string; en: string }
    field: { ar: string; en: string }
    startDate: string
    endDate: string
    gpa?: string
    description?: { ar: string; en: string }
  }>

  skills: Array<{
    name: { ar: string; en: string }
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }>

  languages: Array<{
    name: { ar: string; en: string }
    level: { ar: string; en: string }
  }>

  certifications: Array<{
    name: { ar: string; en: string }
    issuer: { ar: string; en: string }
    date: string
  }>

  projects?: Array<{
    name: { ar: string; en: string }
    description: { ar: string; en: string }
    url?: string
  }>

  courses?: Array<{
    name: { ar: string; en: string }
    issuer: { ar: string; en: string }
    date: string
  }>
}

export interface CvTemplate {
  id: string
  name: { ar: string; en: string }
  category: 'ats' | 'creative'
  description: string
  accentColor: string
  preview: string // gradient for swatch
}

export const CV_TEMPLATES: CvTemplate[] = [
  {
    id: 'classic_noir',
    name: { ar: 'كلاسيكي أسود', en: 'Classic Noir' },
    category: 'ats',
    description: 'أناقة بسيطة بالأبيض والأسود — متوافق ATS',
    accentColor: '#1a1a1a',
    preview: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
  },
  {
    id: 'modern_blue',
    name: { ar: 'أزرق عصري', en: 'Modern Blue' },
    category: 'ats',
    description: 'لمسة أزرق احترافي مع تخطيط نظيف — متوافق ATS',
    accentColor: '#2563eb',
    preview: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  },
  {
    id: 'minimal_lines',
    name: { ar: 'خطوط بسيطة', en: 'Minimal Lines' },
    category: 'ats',
    description: 'خطوط رفيعة ومسافات واسعة — بساطة يابانية',
    accentColor: '#0f766e',
    preview: 'linear-gradient(135deg, #14b8a6, #0d9488)',
  },
  {
    id: 'executive',
    name: { ar: 'تنفيذي', en: 'Executive' },
    category: 'ats',
    description: 'تصميم تنفيذي فخم بألوان داكنة — للمناصب القيادية',
    accentColor: '#7c2d12',
    preview: 'linear-gradient(135deg, #92400e, #7c2d12)',
  },
  {
    id: 'sidebar_color',
    name: { ar: 'عمود جانبي ملوّن', en: 'Color Sidebar' },
    category: 'creative',
    description: 'عمود جانبي ملوّن مع صورة — يبرز المهارات',
    accentColor: '#7c3aed',
    preview: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  },
  {
    id: 'elegant_serif',
    name: { ar: 'أناقة سيرف', en: 'Elegant Serif' },
    category: 'creative',
    description: 'خطوط سيرف كلاسيكية بطابع أكاديمي',
    accentColor: '#991b1b',
    preview: 'linear-gradient(135deg, #dc2626, #991b1b)',
  },
  {
    id: 'two_column_compact',
    name: { ar: 'عمودان مدمج', en: 'Compact Two-Column' },
    category: 'ats',
    description: 'عمودان مدمجان لسير غنية بالمعلومات',
    accentColor: '#4338ca',
    preview: 'linear-gradient(135deg, #6366f1, #4338ca)',
  },
  {
    id: 'vibrant_modern',
    name: { ar: 'ملوّن عصري', en: 'Vibrant Modern' },
    category: 'creative',
    description: 'ألوان جرئية مع تخطيط غير تقليدي',
    accentColor: '#db2777',
    preview: 'linear-gradient(135deg, #ec4899, #be185d)',
  },
]

export interface CvFont {
  id: string
  name: string
  arabicName: string
  family: string
  url: string
}

// Arabic fonts loaded from Google Fonts
export const CV_FONTS: CvFont[] = [
  { id: 'cairo', name: 'Cairo', arabicName: 'القاهرة', family: 'Cairo', url: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap' },
  { id: 'tajawal', name: 'Tajawal', arabicName: 'تجوّل', family: 'Tajawal', url: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap' },
  { id: 'ibm_plex', name: 'IBM Plex Sans Arabic', arabicName: 'IBM Plex عربي', family: 'IBM Plex Sans Arabic', url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap' },
  { id: 'almarai', name: 'Almarai', arabicName: 'المراعي', family: 'Almarai', url: 'https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap' },
  { id: 'readex', name: 'Readex Pro', arabicName: 'Readex Pro', family: 'Readex Pro', url: 'https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;600;700&display=swap' },
  { id: 'alexandria', name: 'Alexandria', arabicName: 'الإسكندرية', family: 'Alexandria', url: 'https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700&display=swap' },
  { id: 'el_messiri', name: 'El Messiri', arabicName: 'المسيري', family: 'El Messiri', url: 'https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;600;700&display=swap' },
  { id: 'changa', name: 'Changa', arabicName: 'تشانغا', family: 'Changa', url: 'https://fonts.googleapis.com/css2?family=Changa:wght@400;600;700&display=swap' },
  { id: 'vazirmatn', name: 'Vazirmatn', arabicName: 'Vazirmatn', family: 'Vazirmatn', url: 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&display=swap' },
  { id: 'mada', name: 'Mada', arabicName: 'مدى', family: 'Mada', url: 'https://fonts.googleapis.com/css2?family=Mada:wght@400;600;700&display=swap' },
  { id: 'noto_sans_arabic', name: 'Noto Sans Arabic', arabicName: 'Noto Sans Arabic', family: 'Noto Sans Arabic', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap' },
  { id: 'noto_kufi', name: 'Noto Kufi Arabic', arabicName: 'نوتو كوفي', family: 'Noto Kufi Arabic', url: 'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700&display=swap' },
  { id: 'reem_kufi', name: 'Reem Kufi', arabicName: 'ريم كوفي', family: 'Reem Kufi', url: 'https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;600;700&display=swap' },
  { id: 'kufam', name: 'Kufam', arabicName: 'Kufam', family: 'Kufam', url: 'https://fonts.googleapis.com/css2?family=Kufam:wght@400;600;700&display=swap' },
  { id: 'harmattan', name: 'Harmattan', arabicName: 'هرمتان', family: 'Harmattan', url: 'https://fonts.googleapis.com/css2?family=Harmattan:wght@400;600;700&display=swap' },
  { id: 'amiri', name: 'Amiri', arabicName: 'أميري', family: 'Amiri', url: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap' },
  { id: 'markazi', name: 'Markazi Text', arabicName: 'مركزي', family: 'Markazi Text', url: 'https://fonts.googleapis.com/css2?family=Markazi+Text:wght@400;600;700&display=swap' },
  { id: 'baloo', name: 'Baloo Bhaijaan 2', arabicName: 'بالو', family: 'Baloo Bhaijaan 2', url: 'https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;600;700&display=swap' },
  { id: 'lemonada', name: 'Lemonada', arabicName: 'ليمونادة', family: 'Lemonada', url: 'https://fonts.googleapis.com/css2?family=Lemonada:wght@400;600;700&display=swap' },
]

// Get template by id
export function getTemplate(id: string): CvTemplate | undefined {
  return CV_TEMPLATES.find((t) => t.id === id)
}

// Get font by id
export function getFont(id: string): CvFont | undefined {
  return CV_FONTS.find((f) => f.id === id)
}

// AI provider config
export const PROVIDER_LABELS: Record<Provider, string> = {
  zai: 'Z.ai GLM (مجاني)',
  openai: 'OpenAI GPT',
  anthropic: 'Anthropic Claude',
  ollama: 'Ollama (محلي)',
  gemini: 'Google Gemini',
}

export const PROVIDER_ICONS: Record<Provider, string> = {
  zai: '✨',
  openai: '🟢',
  anthropic: '🟣',
  ollama: '🦙',
  gemini: '🔵',
}

export interface AvailableModel {
  id: string
  name: string
  provider: Provider
  badge?: string
}

export const AVAILABLE_MODELS: AvailableModel[] = [
  { id: 'glm-4.5', name: 'GLM-4.5', provider: 'zai', badge: 'مجاني' },
  { id: 'glm-4.5-air', name: 'GLM-4.5 Air', provider: 'zai', badge: 'سريع' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', badge: 'اقتصادي' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic', badge: 'سريع' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', badge: 'سريع' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', badge: 'قوي' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'gemini', badge: 'تجريبي' },
  { id: 'qwen2.5', name: 'Qwen 2.5', provider: 'ollama', badge: 'محلي' },
  { id: 'llama3.2', name: 'Llama 3.2', provider: 'ollama', badge: 'محلي' },
]

// Sample CV for testing
export const SAMPLE_CV: CvData = {
  name: { ar: 'أسامة غرامة', en: 'Osama Gharamah' },
  title: { ar: 'مطوّر تطبيقات الويب', en: 'Web Application Developer' },
  email: 'osama@example.com',
  phone: '+966 50 123 4567',
  location: { ar: 'الرياض، السعودية', en: 'Riyadh, Saudi Arabia' },
  linkedin: 'linkedin.com/in/osamagh',
  github: 'github.com/osamagh',
  summary: {
    ar: 'مطوّر برمجيات بخبرة 5 سنوات في تطوير تطبيقات الويب باستخدام React و Node.js. شغوف بكتابة كود نظيف وقابل للصيانة، وحل المشكلات المعقدة. أعمل بشكل جيد ضمن الفرق وأتمتع بمهارات تواصل ممتازة.',
    en: 'Software developer with 5 years of experience building web applications using React and Node.js. Passionate about writing clean, maintainable code and solving complex problems. Strong team player with excellent communication skills.'
  },
  experience: [
    {
      company: { ar: 'شركة التقنية المتقدمة', en: 'Advanced Tech Co.' },
      position: { ar: 'مطوّر Full Stack', en: 'Full Stack Developer' },
      startDate: '2022-01',
      endDate: 'حتى الآن',
      location: { ar: 'الرياض', en: 'Riyadh' },
      description: {
        ar: 'تطوير وصيانة منصة e-commerce رئيسية تخدم 100K+ مستخدم نشط. قيادة فريق من 4 مطورين.',
        en: 'Developed and maintained a major e-commerce platform serving 100K+ active users. Led a team of 4 developers.'
      },
      achievements: ['زيادة سرعة الموقع 60%', 'تقليل معدل الأخطاء 40%']
    },
    {
      company: { ar: 'استارت آب تك ستارت', en: 'TechStart Inc.' },
      position: { ar: 'مطوّر واجهات أمامية', en: 'Frontend Developer' },
      startDate: '2019-06',
      endDate: '2021-12',
      location: { ar: 'جدة', en: 'Jeddah' },
      description: {
        ar: 'تطوير واجهات تفاعلية باستخدام React و TypeScript. تحسين تجربة المستخدم في 3 منتجات.',
        en: 'Built interactive interfaces using React and TypeScript. Improved UX across 3 products.'
      },
      achievements: []
    }
  ],
  education: [
    {
      institution: { ar: 'جامعة الملك سعود', en: 'King Saud University' },
      degree: { ar: 'بكالوريوس', en: 'Bachelor' },
      field: { ar: 'نظم المعلومات', en: 'Information Systems' },
      startDate: '2015-09',
      endDate: '2019-05',
      gpa: '4.7/5',
      description: { ar: 'تخرجت بامتياز مع مرتبة الشرف', en: 'Graduated with honors' }
    }
  ],
  skills: [
    { name: { ar: 'JavaScript', en: 'JavaScript' }, level: 'expert' },
    { name: { ar: 'TypeScript', en: 'TypeScript' }, level: 'expert' },
    { name: { ar: 'React', en: 'React' }, level: 'expert' },
    { name: { ar: 'Node.js', en: 'Node.js' }, level: 'advanced' },
    { name: { ar: 'Python', en: 'Python' }, level: 'advanced' },
    { name: { ar: 'SQL', en: 'SQL' }, level: 'advanced' },
    { name: { ar: 'Docker', en: 'Docker' }, level: 'intermediate' },
    { name: { ar: 'AWS', en: 'AWS' }, level: 'intermediate' }
  ],
  languages: [
    { name: { ar: 'العربية', en: 'Arabic' }, level: { ar: 'اللغة الأم', en: 'Native' } },
    { name: { ar: 'الإنجليزية', en: 'English' }, level: { ar: 'متقدم', en: 'Advanced' } }
  ],
  certifications: [
    {
      name: { ar: 'AWS Certified Developer', en: 'AWS Certified Developer' },
      issuer: { ar: 'Amazon', en: 'Amazon' },
      date: '2023-08'
    }
  ],
  projects: [
    {
      name: { ar: 'منصة تعليمية', en: 'Edu Platform' },
      description: { ar: 'منصة تعليمية تفاعلية تخدم 50K+ طالب', en: 'Interactive education platform serving 50K+ students' },
      url: 'https://example.com'
    }
  ]
}
