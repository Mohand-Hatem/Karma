'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  Megaphone,
  Bell,
  Search,
  Plus,
  FileText,
  Download,
  Trash2,
  Edit,
  CheckCircle2,
  CheckCheck,
  Award,
  AlertCircle,
  MessageSquare,
  Receipt,
  X,
  Globe,
  GraduationCap,
  Users,
  HeartHandshake,
} from 'lucide-react'
import { Drawer } from '../../../../../components/ui/drawer'
import { EmptyState } from '../../../../../components/ui/empty-state'
import { useShellStore } from '../../../../../stores/shell-store'

/* ──────────────────────────────────────────────────────────────────────────
 * Types & Interfaces
 * ────────────────────────────────────────────────────────────────────────── */

export type AudienceFilter = 'ALL' | 'STUDENTS' | 'STAFF' | 'PARENTS'

export interface AnnouncementItem {
  id: string
  authorName: string
  authorRole: string
  authorInitials: string
  timestamp: string
  audience: 'All School' | 'Students' | 'Staff' | 'Parents'
  title: string
  body: string
  attachmentName?: string
  attachmentSize?: string
}

export type NotificationCategory = 'academic' | 'alert' | 'message' | 'finance'

export interface NotificationItem {
  id: string
  title: string
  description: string
  timestamp: string
  category: NotificationCategory
  isUnread: boolean
  actionLabel?: string
}

/* ──────────────────────────────────────────────────────────────────────────
 * Initial Mock Data (cloned from Stitch screens 29 and 30)
 * ────────────────────────────────────────────────────────────────────────── */

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    authorName: 'Dr. Sarah Jenkins',
    authorRole: 'Principal',
    authorInitials: 'SJ',
    timestamp: 'Oct 24, 9:00 AM',
    audience: 'All School',
    title: 'Updated Term 1 Examination Schedule',
    body: 'Please be advised that the Term 1 examination schedule has been slightly revised to accommodate the upcoming regional sports meet. The math and science finals have been shifted back by two days. Please review the attached PDF for the complete timetable.',
    attachmentName: 'Term1_Revised_Schedule.pdf',
    attachmentSize: '1.2 MB',
  },
  {
    id: 'ann-2',
    authorName: 'Marcus Thorne',
    authorRole: 'Head of Athletics',
    authorInitials: 'MT',
    timestamp: 'Oct 23, 2:30 PM',
    audience: 'Students',
    title: 'Varsity Soccer Tryouts Registration Open',
    body: 'Registration for the Winter Varsity Soccer tryouts is officially open. All interested students in grades 9-12 must submit their medical clearance forms prior to stepping on the field. Tryouts will be held on the main turf next Monday at 3:45 PM sharp.',
  },
  {
    id: 'ann-3',
    authorName: 'Noura Al-Sayed',
    authorRole: 'Parent Council Liaison',
    authorInitials: 'NA',
    timestamp: 'Oct 20, 11:15 AM',
    audience: 'Parents',
    title: 'Annual Charity Gala & Book Fair Volunteer Call',
    body: 'We are seeking parent volunteers to assist with the upcoming Annual Charity Book Fair. Booth coordinators, book sorting helpers, and refreshment hosts are needed. Please sign up through the parent portal link.',
    attachmentName: 'BookFair_Volunteer_Guide.pdf',
    attachmentSize: '840 KB',
  },
]

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Physics Lab Report #3 has been graded',
    description: "Your submission for Dr. Smith's Advanced Physics has been evaluated. Score: 92/100.",
    timestamp: '10m ago',
    category: 'academic',
    isUnread: true,
    actionLabel: 'View Grade',
  },
  {
    id: 'notif-2',
    title: 'Schedule Change Alert',
    description: "Tomorrow's morning assembly has been moved to the Indoor Stadium due to weather conditions.",
    timestamp: '1h ago',
    category: 'alert',
    isUnread: true,
  },
  {
    id: 'notif-3',
    title: 'New message from Academic Advisor',
    description: 'Please remember to submit your elective choices for the upcoming semester by Friday.',
    timestamp: 'Yesterday',
    category: 'message',
    isUnread: false,
  },
  {
    id: 'notif-4',
    title: 'Tuition Payment Successful',
    description: 'Receipt #TRX-8921 for Fall Semester 2026 has been generated and sent to your email.',
    timestamp: 'Oct 12',
    category: 'finance',
    isUnread: false,
  },
]

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component: AnnouncementsPage
 * ────────────────────────────────────────────────────────────────────────── */

export default function AnnouncementsPage() {
  const t = useTranslations('features.announcements')
  const { activeRole } = useShellStore()
  const canPost = activeRole === 'ADMIN' || activeRole === 'TEACHER'

  // View tabs: 'board' | 'notifications'
  const [activeTab, setActiveTab] = useState<'board' | 'notifications'>('board')

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Tab 1: Board State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>('ALL')
  const [isPostDrawerOpen, setIsPostDrawerOpen] = useState(false)

  // Drawer Form State
  const [postTitle, setPostTitle] = useState('')
  const [postAudience, setPostAudience] = useState<'All School' | 'Students' | 'Staff' | 'Parents'>('All School')
  const [postBody, setPostBody] = useState('')
  const [postAttachment, setPostAttachment] = useState('')

  // Tab 2: Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'academic' | 'alert'>('all')

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        item.authorName.toLowerCase().includes(q)

      const matchesAudience =
        audienceFilter === 'ALL' ||
        (audienceFilter === 'STUDENTS' && (item.audience === 'Students' || item.audience === 'All School')) ||
        (audienceFilter === 'STAFF' && (item.audience === 'Staff' || item.audience === 'All School')) ||
        (audienceFilter === 'PARENTS' && (item.audience === 'Parents' || item.audience === 'All School'))

      return matchesSearch && matchesAudience
    })
  }, [announcements, searchQuery, audienceFilter])

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (notifFilter === 'unread') return item.isUnread
      if (notifFilter === 'academic') return item.category === 'academic'
      if (notifFilter === 'alert') return item.category === 'alert'
      return true
    })
  }, [notifications, notifFilter])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.isUnread).length
  }, [notifications])

  // Handlers
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!postTitle.trim() || !postBody.trim()) return

    const newAnn: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      authorName: activeRole === 'ADMIN' ? 'School Administration' : 'Instructor Office',
      authorRole: activeRole === 'ADMIN' ? 'Administration' : 'Faculty Member',
      authorInitials: activeRole === 'ADMIN' ? 'SA' : 'FM',
      timestamp: 'Just now',
      audience: postAudience,
      title: postTitle.trim(),
      body: postBody.trim(),
      attachmentName: postAttachment ? 'Announcement_Document.pdf' : undefined,
      attachmentSize: postAttachment ? '1.4 MB' : undefined,
    }

    setAnnouncements([newAnn, ...announcements])
    setIsPostDrawerOpen(false)
    setPostTitle('')
    setPostBody('')
    setPostAttachment('')
    setToastMessage(t('announcementPublished'))
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    setToastMessage('Announcement removed.')
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })))
    setToastMessage('All notifications marked as read.')
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleToggleNotifRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: !n.isUnread } : n))
    )
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-primary" />
            {activeTab === 'board' ? t('title') : t('notificationsTitle')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {activeTab === 'board' ? t('subtitle') : t('notificationsSubtitle')}
          </p>
        </div>

        {/* 2 Tabs Switcher */}
        <div className="bg-surface-container-high rounded-xl p-1 flex border border-outline-variant/60 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'board'
                ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>{t('boardTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all relative ${
              activeTab === 'notifications'
                ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{t('notificationsTab')}</span>
            {unreadCount > 0 && (
              <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
       * TAB 1: ANNOUNCEMENTS BOARD (Stitch Screen 29 exact clone)
       * ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'board' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant shadow-xs">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-8 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Audience Filters & Post Button */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/60 text-xs font-semibold">
                <button
                  onClick={() => setAudienceFilter('ALL')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    audienceFilter === 'ALL'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {t('filterAll')}
                </button>
                <button
                  onClick={() => setAudienceFilter('STUDENTS')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    audienceFilter === 'STUDENTS'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {t('filterStudents')}
                </button>
                <button
                  onClick={() => setAudienceFilter('STAFF')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    audienceFilter === 'STAFF'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {t('filterStaff')}
                </button>
                <button
                  onClick={() => setAudienceFilter('PARENTS')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    audienceFilter === 'PARENTS'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {t('filterParents')}
                </button>
              </div>

              {canPost && (
                <button
                  onClick={() => setIsPostDrawerOpen(true)}
                  className="px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('postAnnouncement')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Announcement Feed Cards */}
          {filteredAnnouncements.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No announcements match your search"
              description="Try adjusting your audience filter or search keywords."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery('')
                setAudienceFilter('ALL')
              }}
            />
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((item) => (
                <article
                  key={item.id}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs overflow-hidden hover:border-primary/40 transition-colors"
                >
                  {/* Card Header (Stitch Screen 29 exact header) */}
                  <div className="p-5 pb-3 flex justify-between items-start border-b border-outline-variant/40">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs border border-outline-variant">
                        {item.authorInitials}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-on-surface">
                          {item.authorName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                          <span>{item.authorRole}</span>
                          <span className="w-1 h-1 rounded-full bg-outline-variant" />
                          <time>{item.timestamp}</time>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.audience === 'All School'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : item.audience === 'Students'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : item.audience === 'Parents'
                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {item.audience === 'All School' && <Globe className="w-3.5 h-3.5" />}
                        {item.audience === 'Students' && <GraduationCap className="w-3.5 h-3.5" />}
                        {item.audience === 'Staff' && <Users className="w-3.5 h-3.5" />}
                        {item.audience === 'Parents' && <HeartHandshake className="w-3.5 h-3.5" />}
                        {item.audience}
                      </span>

                      {canPost && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setToastMessage(`Editing ${item.title}`)
                              setTimeout(() => setToastMessage(null), 3000)
                            }}
                            className="p-1.5 text-outline hover:text-on-surface rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(item.id)}
                            className="p-1.5 text-outline hover:text-red-600 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-2">
                    <h4 className="text-base font-bold text-on-surface">
                      {item.title}
                    </h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                      {item.body}
                    </p>
                  </div>

                  {/* Card Attachments (Stitch Screen 29 exact chip) */}
                  {item.attachmentName && (
                    <div className="p-5 pt-0">
                      <div className="inline-flex items-center gap-2.5 p-2 pr-4 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container transition-colors group cursor-pointer">
                        <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors">
                            {item.attachmentName}
                          </span>
                          <span className="text-[10px] text-outline">
                            {item.attachmentSize}
                          </span>
                        </div>
                        <Download className="w-4 h-4 text-outline group-hover:text-primary ml-2 transition-colors" />
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * TAB 2: NOTIFICATION CENTER (Stitch Screen 30 exact clone)
       * ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-xs">
            {/* Filter Tabs */}
            <div className="flex border-b border-outline-variant/60 w-full sm:w-auto gap-2">
              <button
                onClick={() => setNotifFilter('all')}
                className={`pb-2 px-3 text-xs font-semibold transition-colors ${
                  notifFilter === 'all'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t('tabAll')}
              </button>
              <button
                onClick={() => setNotifFilter('unread')}
                className={`pb-2 px-3 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  notifFilter === 'unread'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{t('tabUnread')}</span>
                {unreadCount > 0 && (
                  <span className="bg-primary/10 text-primary text-[10px] px-1.5 rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setNotifFilter('academic')}
                className={`pb-2 px-3 text-xs font-semibold transition-colors ${
                  notifFilter === 'academic'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t('tabAcademic')}
              </button>
              <button
                onClick={() => setNotifFilter('alert')}
                className={`pb-2 px-3 text-xs font-semibold transition-colors ${
                  notifFilter === 'alert'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t('tabAlerts')}
              </button>
            </div>

            {/* Mark All Read */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-end sm:self-auto"
              >
                <CheckCheck className="w-4 h-4" />
                {t('markAllRead')}
              </button>
            )}
          </div>

          {/* Notification List (Stitch Screen 30 exact cards) */}
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleToggleNotifRead(notif.id)}
                className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex gap-4 items-start hover:bg-surface-container-low/60 transition-colors cursor-pointer group relative shadow-xs ${
                  !notif.isUnread ? 'opacity-75' : ''
                }`}
              >
                {/* Active left border highlight for unread */}
                {notif.isUnread && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary rounded-r-full" />
                )}

                {/* Category Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    notif.category === 'academic'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : notif.category === 'alert'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : notif.category === 'finance'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {notif.category === 'academic' && <Award className="w-5 h-5" />}
                  {notif.category === 'alert' && <AlertCircle className="w-5 h-5" />}
                  {notif.category === 'finance' && <Receipt className="w-5 h-5" />}
                  {notif.category === 'message' && <MessageSquare className="w-5 h-5" />}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3
                      className={`text-sm leading-snug ${
                        notif.isUnread
                          ? 'font-bold text-on-surface'
                          : 'font-medium text-on-surface'
                      }`}
                    >
                      {notif.title}
                    </h3>
                    <span className="text-xs text-on-surface-variant whitespace-nowrap ml-4">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant mb-3">
                    {notif.description}
                  </p>

                  {notif.actionLabel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setToastMessage('Navigating to student grade report...')
                        setTimeout(() => setToastMessage(null), 3000)
                      }}
                      className="px-3 py-1 rounded bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
                    >
                      {notif.actionLabel}
                    </button>
                  )}
                </div>

                {/* Unread Ring Indicator */}
                {notif.isUnread && (
                  <div className="shrink-0 mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * Post Announcement Drawer
       * ────────────────────────────────────────────────────────────────────────── */}
      <Drawer
        isOpen={isPostDrawerOpen}
        onClose={() => setIsPostDrawerOpen(false)}
        title={t('postTitle')}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <p className="text-xs text-on-surface-variant">
            {t('postSubtitle')}
          </p>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('announcementTitle')} *
            </label>
            <input
              type="text"
              required
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="e.g. Winter Term Schedule Update"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('targetAudience')}
            </label>
            <select
              value={postAudience}
              onChange={(e) =>
                setPostAudience(
                  e.target.value as 'All School' | 'Students' | 'Staff' | 'Parents'
                )
              }
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All School">All School (Students, Staff, Parents)</option>
              <option value="Students">Students Only</option>
              <option value="Staff">Staff Only</option>
              <option value="Parents">Parents Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('contentBody')} *
            </label>
            <textarea
              rows={4}
              required
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              placeholder="Type your official announcement or circular here..."
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('attachment')}
            </label>
            <input
              type="text"
              value={postAttachment}
              onChange={(e) => setPostAttachment(e.target.value)}
              placeholder="Document filename (e.g. Schedule_2026.pdf)"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-[11px] text-on-surface-variant mt-1">
              {t('attachmentHelp')}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setIsPostDrawerOpen(false)}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              {t('publishAnnouncement')}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
