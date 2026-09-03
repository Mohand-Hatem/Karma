import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ locale: 'en', id: '1' }),
  usePathname: () => '/en/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  const fallbackClient = new actual.QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return {
    ...actual,
    useQueryClient: (customClient?: unknown) => {
      try {
        return actual.useQueryClient(customClient as never)
      } catch {
        return fallbackClient
      }
    },
    useQuery: (options: unknown, queryClient?: unknown) => {
      return actual.useQuery(options as never, (queryClient || fallbackClient) as never)
    },
  }
})

