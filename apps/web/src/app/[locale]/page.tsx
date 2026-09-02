import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('home')
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <h1 className="text-4xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{t('title')}</h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t('tagline')}</p>
    </main>
  )
}
