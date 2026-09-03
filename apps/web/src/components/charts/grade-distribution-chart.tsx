'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts'

export interface GradeDistributionDataPoint {
  grade: string
  percentage: number
  studentsCount: number
}

const DEFAULT_GRADE_DATA: GradeDistributionDataPoint[] = [
  { grade: 'F', percentage: 4, studentsCount: 50 },
  { grade: 'D', percentage: 8, studentsCount: 100 },
  { grade: 'C-', percentage: 12, studentsCount: 150 },
  { grade: 'C', percentage: 18, studentsCount: 224 },
  { grade: 'C+', percentage: 22, studentsCount: 275 },
  { grade: 'B', percentage: 28, studentsCount: 349 },
  { grade: 'B+', percentage: 20, studentsCount: 250 },
  { grade: 'A-', percentage: 14, studentsCount: 175 },
  { grade: 'A', percentage: 9, studentsCount: 112 },
  { grade: 'A+', percentage: 4, studentsCount: 50 },
]

interface GradeDistributionChartProps {
  data?: GradeDistributionDataPoint[]
  height?: number
}

export function GradeDistributionChart({
  data = DEFAULT_GRADE_DATA,
  height = 240,
}: GradeDistributionChartProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div
        className="w-full flex items-center justify-center bg-surface-container-low/30 rounded-lg text-xs text-on-surface-variant animate-pulse"
        style={{ height }}
      >
        Loading grade distribution...
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height }} data-testid="grade-distribution-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, left: -16, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
            opacity={0.8}
          />
          <XAxis
            dataKey="grade"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}%`}
            domain={[0, 32]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as GradeDistributionDataPoint
                return (
                  <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant shadow-md text-xs">
                    <p className="font-bold text-on-surface">Grade {item.grade}</p>
                    <p className="text-primary font-semibold mt-0.5">
                      {item.percentage}% of cohort
                    </p>
                    <p className="text-on-surface-variant text-[11px]">
                      {item.studentsCount} students
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar
            dataKey="percentage"
            radius={[4, 4, 0, 0]}
            fill="#004ac6"
            animationDuration={800}
          >
            {data.map((entry, index) => {
              const isPeak = entry.grade === 'B' || entry.grade === 'C+'
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={isPeak ? '#004ac6' : '#2563eb'}
                  opacity={isPeak ? 1 : 0.75}
                  className="hover:opacity-100 transition-opacity cursor-pointer"
                />
              )
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
