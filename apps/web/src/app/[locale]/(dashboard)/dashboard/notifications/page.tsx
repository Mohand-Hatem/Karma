'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
} from 'lucide-react'

interface NotificationItem {
  id: string
  title: string
  description: string
  timeAgo: string
  category: 'academic' | 'alert' | 'general'
  isUnread: boolean
  actionLabel?: string
  actionHref?: string
}

export default function NotificationCenterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'academic' | 'alerts'>('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Physics Lab Report #3 has been graded',
      description: 'Your submission for Dr. Smith\'s Advanced Physics has been evaluated. Score: 92/100.',
      timeAgo: '10m ago',
      category: 'academic',
      isUnread: true,
      actionLabel: 'View Grade',
      actionHref: '/dashboard/assignments/asg-1',
    },
    {
      id: 'notif-2',
      title: 'Science Fair Project Proposal Approved',
      description: 'Department Head Mr. Jenkins approved your group\'s electromagnetism experiment proposal.',
      timeAgo: '1h ago',
      category: 'academic',
      isUnread: true,
      actionLabel: 'View Proposal',
      actionHref: '/dashboard/lessons/les-1',
    },
    {
      id: 'notif-3',
      title: 'Campus Weather Advisory - Tomorrow Morning',
      description: 'Due to forecasted sandstorms, school gates will open 30 minutes later at 08:00 AM.',
      timeAgo: '3h ago',
      category: 'alert',
      isUnread: true,
    },
    {
      id: 'notif-4',
      title: 'Parent-Teacher Meeting Confirmation',
      description: 'Your slot with Ms. Patel has been scheduled for Friday at 02:30 PM.',
      timeAgo: 'Yesterday',
      category: 'general',
      isUnread: false,
      actionLabel: 'View Schedule',
      actionHref: '/dashboard/calendar',
    },
  ])

  const unreadCount = notifications.filter((n) => n.isUnread).length

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })))
    setToastMessage('All notifications marked as read.')
    setTimeout(() => setToastMessage(null), 3000)
  }

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return n.isUnread
    if (activeTab === 'academic') return n.category === 'academic'
    if (activeTab === 'alerts') return n.category === 'alert'
    return true
  })

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header (Stitch Screen 30 exact header) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notification Center
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Manage your updates, academic evaluations, and urgent alerts.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-primary hover:text-primary/80 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Tabs (Stitch Screen 30 exact tabs) */}
      <div className="flex border-b border-outline-variant overflow-x-auto no-scrollbar gap-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2.5 border-b-2 font-semibold text-xs transition-colors whitespace-nowrap ${
            activeTab === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`pb-2.5 border-b-2 font-semibold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'unread'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`pb-2.5 border-b-2 font-semibold text-xs transition-colors whitespace-nowrap ${
            activeTab === 'academic'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Academic
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-2.5 border-b-2 font-semibold text-xs transition-colors whitespace-nowrap ${
            activeTab === 'alerts'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Alerts
        </button>
      </div>

      {/* Notification Cards List (Stitch Screen 30) */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-4 sm:p-5 flex gap-4 items-start hover:bg-surface-container-low/40 transition-colors relative shadow-2xs ${
              notif.isUnread ? 'border-l-4 border-l-primary' : ''
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                notif.category === 'academic'
                  ? 'bg-secondary-container text-on-secondary-container'
                  : notif.category === 'alert'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-surface-container-high text-on-surface'
              }`}
            >
              {notif.category === 'academic' ? (
                <FileCheck className="w-5 h-5" />
              ) : notif.category === 'alert' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-1">
                <h2 className="text-sm font-bold text-on-surface">
                  {notif.title}
                </h2>
                <span className="text-[11px] text-on-surface-variant shrink-0">
                  {notif.timeAgo}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                {notif.description}
              </p>

              {notif.actionLabel && notif.actionHref && (
                <Link
                  href={`/${locale}${notif.actionHref}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <span>{notif.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant text-xs text-on-surface-variant">
            No notifications in this category.
          </div>
        )}
      </div>
    </div>
  )
}
