'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionIcon?: LucideIcon
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  children?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`py-12 px-6 flex flex-col items-center justify-center text-center max-w-md mx-auto ${className}`}
    >
      {/* Icon Pill */}
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-xs border border-primary/15 transition-transform hover:scale-105">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>

      {/* Heading */}
      <h3 className="text-base font-bold text-on-surface tracking-tight mb-1.5">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-xs text-on-surface-variant leading-relaxed mb-6 max-w-sm">
          {description}
        </p>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel || children) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container active:scale-[0.98] transition-all shadow-xs"
            >
              {ActionIcon && <ActionIcon className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>{actionLabel}</span>
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container border border-outline-variant text-on-surface text-xs font-medium hover:bg-surface-container-high active:scale-[0.98] transition-all"
            >
              <span>{secondaryActionLabel}</span>
            </button>
          )}

          {children}
        </div>
      )}
    </div>
  )
}
