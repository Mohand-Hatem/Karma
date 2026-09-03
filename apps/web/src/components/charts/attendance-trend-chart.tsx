'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

export interface AttendanceTrendDataPoint {
  week: string
  currentTerm: number
  previousTerm: number
}

const DEFAULT_ATTENDANCE_TREND: AttendanceTrendDataPoint[] = [
  { week: 'Wk 1', currentTerm: 96.5, previousTerm: 94.0 },
  { week: 'Wk 2', currentTerm: 95.8, previousTerm: 93.5 },
  { week: 'Wk 3', currentTerm: 94.2, previousTerm: 92.8 },
  { week: 'Wk 4', currentTerm: 95.1, previousTerm: 91.9 },
  { week: 'Wk 5', currentTerm: 93.8, previousTerm: 92.4 },
  { week: 'Wk 6', currentTerm: 94.5, previousTerm: 93.0 },
  { week: 'Wk 7', currentTerm: 95.2, previousTerm: 91.5 },
  { week: 'Wk 8', currentTerm: 96.0, previousTerm: 92.2 },
  { week: 'Wk 9', currentTerm: 94.9, previousTerm: 93.1 },
  { week: 'Wk 10', currentTerm: 95.5, previousTerm: 92.7 },
]

interface AttendanceTrendChartProps {
  data?: AttendanceTrendDataPoint[]
  height?: number
}

export function AttendanceTrendChart({
  data = DEFAULT_ATTENDANCE_TREND,
  height = 240,
}: AttendanceTrendChartProps) {
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
        Loading attendance trend...
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height }} data-testid="attendance-trend-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 12, left: -16, bottom: 4 }}
        >
          <defs>
            <linearGradient id="currentTermGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#004ac6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#004ac6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="previousTermGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
            opacity={0.8}
          />
          <XAxis
            dataKey="week"
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
            domain={[88, 100]}
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant shadow-md text-xs">
                    <p className="font-bold text-on-surface mb-1">{label}</p>
                    <div className="flex items-center justify-between gap-4 text-primary font-semibold">
                      <span>Current Term:</span>
                      <span>{payload[0].value}%</span>
                    </div>
                    {payload[1] && (
                      <div className="flex items-center justify-between gap-4 text-on-surface-variant font-medium mt-0.5">
                        <span>Previous Term:</span>
                        <span>{payload[1].value}%</span>
                      </div>
                    )}
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
          />
          <Area
            type="monotone"
            dataKey="currentTerm"
            name="Current Term"
            stroke="#004ac6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#currentTermGrad)"
            activeDot={{ r: 5, fill: '#004ac6', stroke: '#fff', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="previousTerm"
            name="Previous Term"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            fillOpacity={1}
            fill="url(#previousTermGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
