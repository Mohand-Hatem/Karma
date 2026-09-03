import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Inter, IBM_Plex_Sans_Arabic } from 'next/font/google'
import { locales, type AppLocale } from '../../../i18n/request'
import { QueryProvider } from '../../lib/query-provider'
import '../../styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-ibm-plex-arabic',
})

const RTL_LOCALES: AppLocale[] = ['ar']

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isRtl = RTL_LOCALES.includes(locale as AppLocale)
  const dir = isRtl ? 'rtl' : 'ltr'
  const messages = await getMessages()

  const fontClass = isRtl ? ibmPlexSansArabic.className : inter.className

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${ibmPlexSansArabic.variable}`}>
      <body className={`${fontClass} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>{children}</QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
