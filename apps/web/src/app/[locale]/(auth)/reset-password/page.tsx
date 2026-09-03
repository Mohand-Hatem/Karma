'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from 'lucide-react'

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const [locale, setLocale] = useState('en')
  params.then((p) => setLocale(p.locale))

  const t = useTranslations('auth')
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Real-time password criteria validation
  const validations = useMemo(() => {
    return {
      hasLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasNumberOrSymbol: /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password),
    }
  }, [password])

  const isValid =
    validations.hasLength &&
    validations.hasUpper &&
    validations.hasNumberOrSymbol &&
    password === confirmPassword

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
      } else {
        setError('Please meet all password requirements.')
      }
      return
    }

    setError(null)
    setIsSuccess(true)
    setTimeout(() => {
      router.push(`/${locale}/login`)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-[440px]">
        {/* Brand / Logo Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Karma Logo"
            width={160}
            height={48}
            className="h-10 w-auto object-contain mb-2"
            priority
          />
        </div>

        {/* Card Container (Stitch Screen 10 exact clone) */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 shadow-xs">
          {/* Lock Reset Icon */}
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <RotateCcw className="w-6 h-6" />
          </div>

          {!isSuccess ? (
            <>
              {/* Header Section */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-on-surface mb-2">
                  {t('resetPasswordTitle')}
                </h1>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {t('resetPasswordSubtitle')}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Form Section */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="new-password"
                    className="block text-xs font-semibold text-on-surface"
                  >
                    {t('newPassword')}
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all pe-10"
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

                {/* Confirm Password Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-semibold text-on-surface"
                  >
                    {t('confirmPassword')}
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all pe-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Security Checklist (Stitch Screen 10 live requirements) */}
                <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-3.5 space-y-2 mt-2">
                  <p className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                    {t('passwordRequirements')}
                  </p>
                  <ul className="space-y-1.5 text-xs">
                    <li className="flex items-center gap-2">
                      {validations.hasLength ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-outline" />
                      )}
                      <span
                        className={
                          validations.hasLength
                            ? 'text-on-surface font-medium'
                            : 'text-on-surface-variant'
                        }
                      >
                        {t('reqLength')}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {validations.hasUpper ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-outline" />
                      )}
                      <span
                        className={
                          validations.hasUpper
                            ? 'text-on-surface font-medium'
                            : 'text-on-surface-variant'
                        }
                      >
                        {t('reqUpper')}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {validations.hasNumberOrSymbol ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-outline" />
                      )}
                      <span
                        className={
                          validations.hasNumberOrSymbol
                            ? 'text-on-surface font-medium'
                            : 'text-on-surface-variant'
                        }
                      >
                        {t('reqNumber')} or symbol
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={!isValid}
                  className="w-full flex items-center justify-center py-2.5 px-4 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed mt-4"
                >
                  {t('resetPasswordBtn')}
                </button>
              </form>
            </>
          ) : (
            /* Success confirmation */
            <div className="text-center space-y-3 py-4">
              <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-2">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-on-surface">
                Password Reset Successfully!
              </h2>
              <p className="text-xs text-on-surface-variant">
                Redirecting you to login...
              </p>
            </div>
          )}

          {/* Back link */}
          <div className="mt-6 text-center pt-4 border-t border-outline-variant/60">
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('backToLogin')}</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
