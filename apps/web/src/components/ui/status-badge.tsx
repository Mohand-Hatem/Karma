'use client'

export type StatusVariant =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'draft'
  | 'published'
  | 'late'
  | 'graded'
  | 'excused'

export interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
  className?: string
  withDot?: boolean
}

const VARIANT_STYLES: Record<StatusVariant, { badge: string; dot: string }> = {
  active: {
    badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  published: {
    badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  graded: {
    badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  pending: {
    badge: 'bg-amber-500/10 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  late: {
    badge: 'bg-amber-500/10 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  draft: {
    badge: 'bg-surface-container text-on-surface-variant border-outline-variant',
    dot: 'bg-on-surface-variant',
  },
  inactive: {
    badge: 'bg-surface-container text-on-surface-variant border-outline-variant',
    dot: 'bg-on-surface-variant',
  },
  excused: {
    badge: 'bg-error/10 text-error border-error/20',
    dot: 'bg-error',
  },
}

export function StatusBadge({
  status,
  variant,
  className = '',
  withDot = true,
}: StatusBadgeProps) {
  // Infer variant from status text if not explicitly provided
  const inferredKey = (
    variant ||
    (status.toLowerCase().includes('pub')
      ? 'published'
      : status.toLowerCase().includes('act')
        ? 'active'
        : status.toLowerCase().includes('grad')
          ? 'graded'
          : status.toLowerCase().includes('late')
            ? 'late'
            : status.toLowerCase().includes('pend')
              ? 'pending'
              : status.toLowerCase().includes('excu')
                ? 'excused'
                : status.toLowerCase().includes('draft')
                  ? 'draft'
                  : 'inactive')
  ) as StatusVariant

  const config = VARIANT_STYLES[inferredKey] || VARIANT_STYLES.inactive

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badge} ${className}`}
    >
      {withDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} aria-hidden="true" />
      )}
      <span>{status}</span>
    </span>
  )
}
