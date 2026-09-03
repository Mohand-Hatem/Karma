'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { KeyRound, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const [locale, setLocale] = useState('en')
  params.then((p) => setLocale(p.locale))

  const t = useTranslations('auth')

  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 600)
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

        {/* Card Container (Stitch Screen 08 exact clone) */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 shadow-xs">
          {/* Key Icon Badge */}
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <KeyRound className="w-6 h-6" />
          </div>

          {!isSubmitted ? (
            <>
              {/* Title & Description */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-on-surface mb-2">
                  {t('forgotPasswordTitle')}
                </h1>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {t('forgotPasswordSubtitle')}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-on-surface"
                  >
                    {t('email')}
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. teacher@school.edu"
                      className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-2.5 px-4 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-xs disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : t('sendResetLink')}
                </button>
              </form>
            </>
          ) : (
            /* Sent Confirmation State */
            <div className="text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-1">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-on-surface">
                {t('resetLinkSent')}
              </h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t('checkYourEmail')}
              </p>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/60 flex items-center justify-center gap-2 text-xs font-semibold text-on-surface">
                <Mail className="w-4 h-4 text-primary" />
                <span>{email}</span>
              </div>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-xs font-semibold text-primary hover:underline block mx-auto"
              >
                {t('resendEmail')}
              </button>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="mt-8 text-center pt-4 border-t border-outline-variant/60">
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('backToLogin')}</span>
            </Link>
          </div>
        </div>

        {/* Support Link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-on-surface-variant">
            {t('needHelp')}{' '}
            <a
              href="mailto:support@school.edu"
              className="text-primary hover:underline font-semibold"
            >
              {t('contactSupport')}
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
