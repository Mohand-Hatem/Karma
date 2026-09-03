'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Globe,
  Building2,
} from 'lucide-react'

export default function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const t = useTranslations('auth')
  const router = useRouter()

  const [fullName, setFullName] = useState('Ahmed Hassan')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [timezone, setTimezone] = useState('UTC+2')
  const [prefLang, setPrefLang] = useState<'en' | 'ar'>('en')
  const [error, setError] = useState<string | null>(null)

  params.then((p) => {
    if (p.locale === 'ar' || p.locale === 'en') {
      setPrefLang(p.locale)
    }
  })

  // Password criteria checklist
  const validations = useMemo(() => {
    return {
      hasLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[^A-Za-z0-9]/.test(password),
    }
  }, [password])

  const isValid =
    fullName.trim().length > 0 &&
    validations.hasLength &&
    validations.hasUpper &&
    validations.hasNumber &&
    validations.hasSymbol &&
    password === confirmPassword

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
      } else {
        setError('Please fulfill all profile and password requirements.')
      }
      return
    }

    setError(null)
    // Redirect to Dashboard with the chosen language
    router.push(`/${prefLang}/dashboard`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      <main className="w-full max-w-[500px]">
        {/* Brand Anchor */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Karma Logo"
            width={160}
            height={48}
            className="h-10 w-auto object-contain mb-1"
            priority
          />
        </div>

        {/* Main Setup Card (Stitch Screen 06 exact clone) */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs p-6 sm:p-8">
          {/* Header Section */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto bg-primary/10 text-primary rounded-xl border border-outline-variant flex items-center justify-center mb-3">
              <Building2 className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface mb-1.5">
              {t('welcomeInstitution')}
            </h1>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {t('invitationRoleNotice')}{' '}
              <strong className="text-primary font-bold">Teacher</strong>.{' '}
              {t('completeProfileNotice')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Read-only Invited Email */}
            <div className="space-y-1">
              <label
                htmlFor="onboarding-email"
                className="block text-xs font-semibold text-on-surface"
              >
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="onboarding-email"
                  type="email"
                  readOnly
                  disabled
                  value="ahmed.hassan@alamal.edu"
                  className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface-variant cursor-not-allowed font-medium"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label
                htmlFor="fullname"
                className="block text-xs font-semibold text-on-surface"
              >
                {t('fullName')} *
              </label>
              <input
                id="fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ahmed Hassan"
                className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Password Fields */}
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-on-surface"
                >
                  {t('password')} *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Requirements checklist */}
              <div className="bg-surface-container-low py-2.5 px-3.5 rounded-lg border border-outline-variant/60 space-y-1.5">
                <p className="text-[10px] font-bold text-on-surface uppercase tracking-wider">
                  {t('passwordRequirements')}
                </p>
                <ul className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <li className="flex items-center gap-1.5">
                    {validations.hasLength ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-outline" />
                    )}
                    <span>8+ characters</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    {validations.hasUpper ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-outline" />
                    )}
                    <span>Uppercase letter</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    {validations.hasNumber ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-outline" />
                    )}
                    <span>Number</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    {validations.hasSymbol ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-outline" />
                    )}
                    <span>Special symbol</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="confirm_password"
                  className="block text-xs font-semibold text-on-surface"
                >
                  {t('confirmPassword')} *
                </label>
                <input
                  id="confirm_password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <hr className="border-t border-outline-variant my-4" />

            {/* System Preferences (Stitch Screen 06) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                {t('systemPreferences')}
              </h3>

              <div className="space-y-1">
                <label
                  htmlFor="timezone"
                  className="block text-xs text-on-surface-variant font-medium"
                >
                  {t('timezone')}
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:border-outline"
                >
                  <option value="UTC+2">Africa/Cairo (UTC+2)</option>
                  <option value="UTC+3">Asia/Riyadh (UTC+3)</option>
                  <option value="UTC+4">Asia/Dubai (UTC+4)</option>
                  <option value="UTC">Europe/London (UTC)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="block text-xs text-on-surface-variant font-medium">
                  {t('preferredLanguage')}
                </span>
                <div className="flex rounded-lg border border-outline-variant overflow-hidden p-1 bg-surface-container-low">
                  <button
                    type="button"
                    onClick={() => setPrefLang('en')}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      prefLang === 'en'
                        ? 'bg-surface-container-lowest text-primary shadow-2xs border border-outline-variant/40'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>English</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrefLang('ar')}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      prefLang === 'ar'
                        ? 'bg-surface-container-lowest text-primary shadow-2xs border border-outline-variant/40'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>العربية</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isValid}
                className="w-full bg-primary hover:bg-primary/90 text-on-primary text-xs sm:text-sm font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>{t('completeSetupBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
