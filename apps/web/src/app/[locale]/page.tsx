'use client'

import Image from 'next/image'
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
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center">
      <Image
        src="/logo.png"
        alt="Karma Logo"
        width={260}
        height={80}
        className="h-20 w-auto object-contain mb-6"
        priority
      />
      <h1 className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{t('title')}</h1>
      <p className="mt-2 text-base text-slate-600 dark:text-slate-300 max-w-md">{t('tagline')}</p>
      <p data-testid="api-status" className="mt-6 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
        {isLoading ? '…' : data?.status}
      </p>
    </main>
  )
}
