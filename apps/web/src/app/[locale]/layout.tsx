import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales, type AppLocale } from '../../../i18n/request'
import '../../styles/globals.css'

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
  const dir = RTL_LOCALES.includes(locale as AppLocale) ? 'rtl' : 'ltr'
  const messages = await getMessages()

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
