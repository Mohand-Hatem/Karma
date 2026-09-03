'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts'

export interface SubjectRadarDataPoint {
  subject: string
  score: number
  benchmark: number
  fullMark: number
}

const DEFAULT_RADAR_DATA: SubjectRadarDataPoint[] = [
  { subject: 'Sciences', score: 88, benchmark: 75, fullMark: 100 },
  { subject: 'Mathematics', score: 82, benchmark: 70, fullMark: 100 },
  { subject: 'Humanities', score: 90, benchmark: 80, fullMark: 100 },
  { subject: 'Arts & Music', score: 92, benchmark: 85, fullMark: 100 },
  { subject: 'Languages', score: 85, benchmark: 78, fullMark: 100 },
  { subject: 'Physical Ed', score: 95, benchmark: 80, fullMark: 100 },
]

interface SubjectRadarChartProps {
  data?: SubjectRadarDataPoint[]
  height?: number
}

export function SubjectRadarChart({
  data = DEFAULT_RADAR_DATA,
  height = 240,
}: SubjectRadarChartProps) {
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
        Loading faculty radar...
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height }} data-testid="subject-radar-chart">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 9 }}
            axisLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as SubjectRadarDataPoint
                return (
                  <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant shadow-md text-xs">
                    <p className="font-bold text-on-surface">{item.subject}</p>
                    <p className="text-primary font-semibold mt-0.5">
                      Cohort Score: {item.score}%
                    </p>
                    <p className="text-on-surface-variant text-[11px]">
                      District Benchmark: {item.benchmark}%
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Radar
            name="Cohort Performance"
            dataKey="score"
            stroke="#004ac6"
            fill="#004ac6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
