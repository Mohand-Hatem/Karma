'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Globe,
  MoreHorizontal,
  Eye,
  EyeOff,
  ShieldAlert,
  GraduationCap,
  BookOpen,
  Users,
} from 'lucide-react'
import { useShellStore, type UserRole } from '../../../../stores/shell-store'

export default function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const [locale, setLocale] = useState('en')
  params.then((p) => setLocale(p.locale))

  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { setActiveRole } = useShellStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const targetLocale = locale === 'en' ? 'ar' : 'en'

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.push(`/${locale}/dashboard`)
    }, 600)
  }

  const fillDemoRole = (role: UserRole) => {
    setActiveRole(role)
    switch (role) {
      case 'ADMIN':
        setEmail('admin@karma.dev')
        setPassword('KarmaAdmin2026!')
        break
      case 'TEACHER':
        setEmail('teacher@karma.dev')
        setPassword('KarmaTeacher2026!')
        break
      case 'STUDENT':
        setEmail('student@karma.dev')
        setPassword('KarmaStudent2026!')
        break
      case 'PARENT':
        setEmail('parent@karma.dev')
        setPassword('KarmaParent2026!')
        break
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row antialiased bg-app text-on-surface">
      {/* Left Side: Branding & Value Proposition (Hidden on mobile) */}
      <div className="hidden md:flex flex-col w-[55%] bg-surface-container-low border-e border-outline-variant p-12 relative overflow-hidden">
        {/* Subtle Geometric Dot Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Karma Logo"
              width={200}
              height={60}
              className="h-12 w-auto object-contain"
              priority
            />
          </div>

          {/* Value Prop Headline */}
          <div className="max-w-lg my-auto py-12">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-on-surface mb-4 leading-tight">
              {t('valuePropTitle')}
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t('valuePropSubtitle')}
            </p>
          </div>

          {/* Abstract KPI Chart Preview (Faithful to Stitch) */}
          <div className="max-w-md w-full bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <span className="text-sm font-semibold text-on-surface">
                {t('attendanceOverview')}
              </span>
              <MoreHorizontal className="w-4 h-4 text-on-surface-variant" />
            </div>

            {/* Attendance Bar Chart */}
            <div className="flex items-end justify-between gap-3 h-32 pt-6">
              <div className="w-1/6 bg-primary/15 rounded-t h-[60%] transition-all" />
              <div className="w-1/6 bg-primary/15 rounded-t h-[75%] transition-all" />
              <div className="w-1/6 bg-primary/15 rounded-t h-[65%] transition-all" />
              <div className="w-1/6 bg-primary rounded-t h-[90%] shadow-xs relative transition-all">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-primary">
                  98%
                </div>
              </div>
              <div className="w-1/6 bg-primary/15 rounded-t h-[80%] transition-all" />
              <div className="w-1/6 bg-primary/15 rounded-t h-[70%] transition-all" />
            </div>

            {/* Days of Week */}
            <div className="flex justify-between text-xs text-on-surface-variant mt-1 text-center font-medium">
              <span className="w-1/6">{t('mon')}</span>
              <span className="w-1/6">{t('tue')}</span>
              <span className="w-1/6">{t('wed')}</span>
              <span className="w-1/6 text-primary font-bold">{t('thu')}</span>
              <span className="w-1/6">{t('fri')}</span>
              <span className="w-1/6">{t('sat')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Interactive Login Flow (Faithful to Stitch) */}
      <div className="flex flex-col w-full md:w-[45%] min-h-screen bg-surface-container-lowest items-center justify-center relative p-6 md:p-12">
        {/* Top Utility Bar (Language Toggle) */}
        <div className="absolute top-6 end-6 flex items-center gap-3">
          <Link
            href={`/${targetLocale}/login`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-medium text-on-surface-variant hover:text-primary hover:border-primary active:scale-95 transition-all shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span>{tCommon('switchLang')}</span>
          </Link>
        </div>

        <div className="w-full max-w-sm flex flex-col mt-8 md:mt-0">
          {/* Mobile-Only Logo */}
          <div className="flex md:hidden items-center mb-8 justify-center">
            <Image
              src="/logo.png"
              alt="Karma Logo"
              width={180}
              height={54}
              className="h-11 w-auto object-contain"
              priority
            />
          </div>

          {/* Login Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-on-surface mb-2 tracking-tight">
              {t('welcomeBack')}
            </h2>
            <p className="text-sm text-on-surface-variant">
              {t('loginSubtitle')}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface" htmlFor="email">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@karma.dev"
                className="w-full border border-outline-variant bg-surface-container-lowest rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface" htmlFor="password">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-outline-variant bg-surface-container-lowest rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">
                  {t('rememberMe')}
                </span>
              </label>
              <Link
                href={`/${locale}/forgot-password`}
                className="text-xs font-medium text-primary hover:underline transition-colors"
              >
                {t('forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-container text-on-primary font-semibold rounded-lg py-2.5 mt-2 text-sm shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          {/* Stitch Section Divider */}
          <div className="relative flex items-center py-2 mb-4">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="flex-shrink-0 px-3 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant bg-surface-container-lowest">
              {t('orExploreDemo')}
            </span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          {/* Stitch 2x2 Demo Accounts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillDemoRole('ADMIN')}
              className="flex flex-col items-start p-3 border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-container transition-all text-start group active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 mb-1 w-full">
                <ShieldAlert className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                <span className="text-xs font-medium text-on-surface truncate">
                  {t('adminName')}
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant ps-6">
                {t('adminTitle')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoRole('TEACHER')}
              className="flex flex-col items-start p-3 border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-container transition-all text-start group active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 mb-1 w-full">
                <GraduationCap className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                <span className="text-xs font-medium text-on-surface truncate">
                  {t('teacherName')}
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant ps-6">
                {t('teacherTitle')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoRole('STUDENT')}
              className="flex flex-col items-start p-3 border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-container transition-all text-start group active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 mb-1 w-full">
                <BookOpen className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                <span className="text-xs font-medium text-on-surface truncate">
                  {t('studentName')}
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant ps-6">
                {t('studentTitle')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoRole('PARENT')}
              className="flex flex-col items-start p-3 border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-container transition-all text-start group active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 mb-1 w-full">
                <Users className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                <span className="text-xs font-medium text-on-surface truncate">
                  {t('parentName')}
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant ps-6">
                {t('parentTitle')}
              </span>
            </button>
          </div>

          {/* Stitch Footer Links */}
          <div className="mt-8 pt-4 text-center flex gap-6 justify-center text-xs text-on-surface-variant">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-on-surface transition-colors">
              {t('help')}
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-on-surface transition-colors">
              {t('privacy')}
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-on-surface transition-colors">
              {t('terms')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
