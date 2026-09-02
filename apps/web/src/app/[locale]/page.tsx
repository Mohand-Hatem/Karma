'use client'

import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { HealthResponseSchema } from '@karma/shared'
import { apiClient } from '../../lib/api-client'

export default function HomePage() {
  const t = useTranslations('home')
  const { data, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: async () => HealthResponseSchema.parse((await apiClient.get('/healthz')).data),
  })

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <h1 className="text-4xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{t('title')}</h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t('tagline')}</p>
      <p data-testid="api-status" className="mt-4 px-3 py-1 text-sm rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
        {isLoading ? '…' : data?.status}
      </p>
    </main>
  )
}
