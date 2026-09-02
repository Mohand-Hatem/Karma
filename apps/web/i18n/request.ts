import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'ar'] as const
export type AppLocale = (typeof locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  const resolved = locales.includes(locale as AppLocale) ? (locale as AppLocale) : 'en'
  return {
    locale: resolved,
    messages: (await import(`./messages/${resolved}.json`)).default,
  }
})
