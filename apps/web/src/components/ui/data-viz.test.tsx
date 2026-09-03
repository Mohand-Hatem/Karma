import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import {
  MiniSparkline,
  MiniAttendanceBars,
  MiniSegmentedBar,
  MiniProgressRing,
} from './data-viz'

describe('Micro-visualization UI components (data-viz)', () => {
  describe('MiniSparkline', () => {
    it('renders accessible SVG with path and dot', () => {
      render(
        <MiniSparkline
          data={[10, 15, 12, 20, 25]}
          ariaLabel="Test sparkline 10 to 25"
        />
      )

      const svg = screen.getByRole('img', { name: 'Test sparkline 10 to 25' })
      expect(svg).toBeInTheDocument()
      expect(svg.querySelector('circle')).toBeInTheDocument()
    })

    it('returns null if data has fewer than 2 points', () => {
      const { container } = render(<MiniSparkline data={[10]} />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('MiniAttendanceBars', () => {
    it('renders 5 daily bars with accessible summary', () => {
      render(
        <MiniAttendanceBars
          days={[96, 94, 98, 95, 97]}
          ariaLabel="Weekly attendance 96%"
        />
      )

      const group = screen.getByRole('img', { name: 'Weekly attendance 96%' })
      expect(group).toBeInTheDocument()
      expect(group.children.length).toBe(5)
    })
  })

  describe('MiniSegmentedBar', () => {
    it('renders proportional segments with accessible text', () => {
      render(
        <MiniSegmentedBar
          segments={[
            { label: 'Graded', value: 20, colorClass: 'bg-primary' },
            { label: 'Pending', value: 5, colorClass: 'bg-amber-500' },
          ]}
          ariaLabel="20 Graded, 5 Pending"
        />
      )

      const bar = screen.getByRole('img', { name: '20 Graded, 5 Pending' })
      expect(bar).toBeInTheDocument()
      expect(bar.children.length).toBe(2)
    })
  })

  describe('MiniProgressRing', () => {
    it('renders circular SVG progress gauge with percentage text', () => {
      render(
        <MiniProgressRing
          percentage={96}
          ariaLabel="Attendance ring 96%"
        />
      )

      const ring = screen.getByRole('img', { name: 'Attendance ring 96%' })
      expect(ring).toBeInTheDocument()
      expect(screen.getByText('96%')).toBeInTheDocument()
    })
  })
})
