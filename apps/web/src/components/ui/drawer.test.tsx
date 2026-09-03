import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { Drawer } from './drawer'

describe('Drawer Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Drawer isOpen={false} onClose={vi.fn()} title="Test Drawer">
        <div>Drawer Content</div>
      </Drawer>
    )

    expect(screen.queryByText('Test Drawer')).not.toBeInTheDocument()
    expect(screen.queryByText('Drawer Content')).not.toBeInTheDocument()
  })

  it('renders title and children when isOpen is true', () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()} title="Enroll Student" description="Class cohort assignment">
        <div>Enrollment Form</div>
      </Drawer>
    )

    expect(screen.getByText('Enroll Student')).toBeInTheDocument()
    expect(screen.getByText('Class cohort assignment')).toBeInTheDocument()
    expect(screen.getByText('Enrollment Form')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn()
    render(
      <Drawer isOpen={true} onClose={onCloseMock} title="Action Drawer">
        <div>Content</div>
      </Drawer>
    )

    const closeBtn = screen.getByLabelText('Close drawer')
    fireEvent.click(closeBtn)

    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    const onCloseMock = vi.fn()
    render(
      <Drawer isOpen={true} onClose={onCloseMock} title="Escape Test">
        <div>Content</div>
      </Drawer>
    )

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })
})
