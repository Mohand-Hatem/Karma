'use client'

import React from 'react'

/* ──────────────────────────────────────────────────────────────────────────
 * 1. MiniSparkline
 * A lightweight, accessible SVG sparkline for trend visualization (e.g. GPA, enrollment).
 * ────────────────────────────────────────────────────────────────────────── */
interface MiniSparklineProps {
  data: number[]
  width?: number
  height?: number
  strokeColor?: string
  fillColor?: string
  className?: string
  ariaLabel?: string
}

export function MiniSparkline({
  data,
  width = 80,
  height = 24,
  strokeColor = '#4a55a2', // Stitch primary
  fillColor = 'rgba(74, 85, 162, 0.12)',
  className = '',
  ariaLabel,
}: MiniSparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 2

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((val - min) / range) * (height - padding * 2)
    return { x, y }
  })

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`
  }, '')

  const areaD = `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`

  const defaultAria = `Trend sparkline showing ${data.length} data points from ${data[0]} to ${data[data.length - 1]}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`shrink-0 overflow-visible ${className}`}
      role="img"
      aria-label={ariaLabel || defaultAria}
    >
      <path d={areaD} fill={fillColor} />
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End point dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2"
        fill={strokeColor}
      />
    </svg>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 * 2. MiniAttendanceBars
 * 5-day compact bar pattern (Mon–Fri daily rate) for attendance cards.
 * ────────────────────────────────────────────────────────────────────────── */
interface MiniAttendanceBarsProps {
  days: number[] // percentage values, e.g. [96, 94, 98, 95, 96.2]
  height?: number
  className?: string
  ariaLabel?: string
}

export function MiniAttendanceBars({
  days = [95, 96, 94, 97, 96.2],
  height = 20,
  className = '',
  ariaLabel,
}: MiniAttendanceBarsProps) {
  const dayNames = ['M', 'T', 'W', 'T', 'F']
  const avg = (days.reduce((a, b) => a + b, 0) / days.length).toFixed(1)
  const defaultAria = `Weekly attendance rates: ${days.map((d, i) => `${dayNames[i]}: ${d}%`).join(', ')}. Average: ${avg}%`

  return (
    <div
      className={`flex items-end gap-1 shrink-0 ${className}`}
      style={{ height: `${height}px` }}
      role="img"
      aria-label={ariaLabel || defaultAria}
      title={`Weekly Average: ${avg}%`}
    >
      {days.slice(0, 5).map((pct, idx) => {
        const barHeight = Math.max(6, Math.min(height, (pct / 100) * height))
        const isHigh = pct >= 95
        return (
          <div
            key={idx}
            className="flex flex-col items-center gap-0.5 group relative"
          >
            <div
              className={`w-1.5 rounded-full transition-all duration-300 ${
                isHigh ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
              style={{ height: `${barHeight}px` }}
            />
          </div>
        )
      })}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 * 3. MiniSegmentedBar
 * Proportional segmented progress bar (e.g. Graded / Submitted / Missing).
 * ────────────────────────────────────────────────────────────────────────── */
export interface SegmentItem {
  label: string
  value: number
  colorClass: string
}

interface MiniSegmentedBarProps {
  segments: SegmentItem[]
  height?: number
  className?: string
  ariaLabel?: string
}

export function MiniSegmentedBar({
  segments,
  height = 6,
  className = '',
  ariaLabel,
}: MiniSegmentedBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  if (total === 0) return null

  const defaultAria = segments
    .map((s) => `${s.label}: ${s.value} (${Math.round((s.value / total) * 100)}%)`)
    .join(', ')

  return (
    <div
      className={`w-full flex rounded-full overflow-hidden bg-surface-container gap-0.5 ${className}`}
      style={{ height: `${height}px` }}
      role="img"
      aria-label={ariaLabel || defaultAria}
    >
      {segments.map((seg, idx) => {
        const pct = (seg.value / total) * 100
        if (pct === 0) return null
        return (
          <div
            key={idx}
            className={`h-full transition-all duration-300 first:rounded-s-full last:rounded-e-full ${seg.colorClass}`}
            style={{ width: `${pct}%` }}
            title={`${seg.label}: ${seg.value}`}
          />
        )
      })}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 * 4. MiniProgressRing
 * Compact SVG circular gauge with Stitch brand stroke for single-rate metrics.
 * ────────────────────────────────────────────────────────────────────────── */
interface MiniProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  strokeColor?: string
  trackColor?: string
  className?: string
  ariaLabel?: string
}

export function MiniProgressRing({
  percentage,
  size = 32,
  strokeWidth = 3.5,
  strokeColor = 'stroke-primary',
  trackColor = 'stroke-surface-container',
  className = '',
  ariaLabel,
}: MiniProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedPct = Math.max(0, Math.min(100, percentage))
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel || `Progress: ${clampedPct}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 overflow-visible"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={`${strokeColor} transition-all duration-500 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[9px] font-bold text-on-surface">
        {Math.round(clampedPct)}%
      </span>
    </div>
  )
}
