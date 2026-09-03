'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  locale?: string
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl'
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  locale = 'en',
  maxWidth = 'md',
}: DrawerProps) {
  const isRtl = locale === 'ar'

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxWidthClassMap = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop with smooth fade & blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container with slide-in animation */}
      <div
        className={`fixed inset-y-0 flex max-w-full ${
          isRtl ? 'left-0 pe-0' : 'right-0 ps-0'
        }`}
      >
        <div
          className={`w-screen ${maxWidthClassMap[maxWidth]} bg-surface-container-lowest shadow-2xl flex flex-col border-s border-outline-variant transition-transform duration-250 ease-out`}
        >
          {/* Header */}
          <div className="p-6 border-b border-outline-variant flex items-start justify-between bg-surface-container">
            <div>
              <h2 className="text-lg font-bold text-on-surface tracking-tight">
                {title}
              </h2>
              {description && (
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors active:scale-95"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest">{children}</div>
        </div>
      </div>
    </div>
  )
}
