import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  useStudentsQuery,
  useTeachersQuery,
  useClassesQuery,
  useAssignmentsQuery,
} from './use-domain-queries'

function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return function TestWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('Domain Queries Hooks (TanStack React Query)', () => {
  it('useStudentsQuery fetches student list with data', async () => {
    const { result } = renderHook(() => useStudentsQuery(), {
      wrapper: createTestWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.length).toBeGreaterThan(0)
    expect(result.current.data?.data[0].name).toBe('Omar Hatem')
  })

  it('useTeachersQuery fetches teacher list with data', async () => {
    const { result } = renderHook(() => useTeachersQuery(), {
      wrapper: createTestWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.length).toBeGreaterThan(0)
    expect(result.current.data?.data[0].name).toBe('Mr. Ahmed Hassan')
  })

  it('useClassesQuery fetches class list with data', async () => {
    const { result } = renderHook(() => useClassesQuery(), {
      wrapper: createTestWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.length).toBeGreaterThan(0)
    expect(result.current.data?.[0].name).toBe('Class 10A')
  })

  it('useAssignmentsQuery fetches assignments with data', async () => {
    const { result } = renderHook(() => useAssignmentsQuery(), {
      wrapper: createTestWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.length).toBeGreaterThan(0)
    expect(result.current.data?.[0].title).toContain('Kinematics')
  })
})
