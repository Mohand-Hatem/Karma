import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import messages from '../../../i18n/messages/ar.json'
import HomePage from './page'

vi.mock('../../lib/api-client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({
      data: { status: 'ok', timestamp: new Date().toISOString() },
    }),
  },
}))

describe('HomePage (ar locale)', () => {
  it('renders the Arabic title', () => {
    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <NextIntlClientProvider locale="ar" messages={messages}>
          <HomePage />
        </NextIntlClientProvider>
      </QueryClientProvider>
    )
    expect(screen.getByText('كارما')).toBeInTheDocument()
  })

  it('renders the API health status once loaded', async () => {
    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <NextIntlClientProvider locale="ar" messages={messages}>
          <HomePage />
        </NextIntlClientProvider>
      </QueryClientProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('api-status')).toHaveTextContent('ok')
    })
  })
})
