import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { EmptyState } from './empty-state'
import { StatusBadge } from './status-badge'

describe('Shared UI Enhancements', () => {
  it('renders EmptyState with title, description, and action button', () => {
    let clicked = false
    render(
      <EmptyState
        title="No items found"
        description="Try adjusting your filters"
        actionLabel="Reset filters"
        onAction={() => {
          clicked = true
        }}
      />
    )

    expect(screen.getByText('No items found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument()

    const btn = screen.getByText('Reset filters')
    fireEvent.click(btn)
    expect(clicked).toBe(true)
  })

  it('renders StatusBadge with inferred and explicit variants', () => {
    const { rerender } = render(<StatusBadge status="Active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()

    rerender(<StatusBadge status="Late Submission" variant="late" />)
    expect(screen.getByText('Late Submission')).toBeInTheDocument()
  })
})
