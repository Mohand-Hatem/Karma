import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { GradeDistributionChart } from './grade-distribution-chart'
import { SubjectRadarChart } from './subject-radar-chart'
import { AttendanceTrendChart } from './attendance-trend-chart'

describe('Interactive Recharts Components', () => {
  it('renders GradeDistributionChart with container', () => {
    render(<GradeDistributionChart />)
    expect(screen.getByTestId('grade-distribution-chart')).toBeInTheDocument()
  })

  it('renders SubjectRadarChart with container', () => {
    render(<SubjectRadarChart />)
    expect(screen.getByTestId('subject-radar-chart')).toBeInTheDocument()
  })

  it('renders AttendanceTrendChart with container', () => {
    render(<AttendanceTrendChart />)
    expect(screen.getByTestId('attendance-trend-chart')).toBeInTheDocument()
  })
})
