'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Building2,
  User,
  ShieldAlert,
  Edit,
  ExternalLink,
  Users,
  BadgeCheck,
  HardDrive,
  Cpu,
  Clock,
  Globe,
  Camera,
  CheckCircle2,
  Lock,
  Download,
  Filter,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Info,
  Calendar,
  Activity,
} from 'lucide-react'
import { Drawer } from '../../../../../components/ui/drawer'
import { useShellStore } from '../../../../../stores/shell-store'

/* ──────────────────────────────────────────────────────────────────────────
 * Types & Interfaces
 * ────────────────────────────────────────────────────────────────────────── */

export interface OrgProfile {
  name: string
  slug: string
  timezone: string
  defaultLocale: string
  contactEmail: string
}

export interface AuditEvent {
  id: string
  timestamp: string
  actorName: string
  actorRole: string
  actorInitials: string
  action: string
  actionVariant: 'primary' | 'secondary' | 'warning' | 'emerald'
  resourceType: string
  resourceId: string
  reason: string
  ipAddress: string
  userAgent: string
  detailsJson: string
}

/* ──────────────────────────────────────────────────────────────────────────
 * Initial Mock Data (cloned from Stitch 35, 33, and 34)
 * ────────────────────────────────────────────────────────────────────────── */

const INITIAL_ORG: OrgProfile = {
  name: 'Cairo International Academy',
  slug: 'cia-main',
  timezone: 'Africa/Cairo',
  defaultLocale: 'EN',
  contactEmail: 'admin@cia.edu.eg',
}

const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'evt-001',
    timestamp: '2026-10-27 14:32:01',
    actorName: 'Jane Doe',
    actorRole: 'System Admin',
    actorInitials: 'JD',
    action: 'RESULT_PUBLISHED',
    actionVariant: 'secondary',
    resourceType: 'Gradebook',
    resourceId: 'GB-2026-TERM1',
    reason: 'End of term finalization and official publication.',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    detailsJson: JSON.stringify({ cohort: 'Grade 10A', publishedCount: 28, status: 'PUBLISHED' }, null, 2),
  },
  {
    id: 'evt-002',
    timestamp: '2026-10-27 13:15:44',
    actorName: 'Ahmed Hassan',
    actorRole: 'Physics Teacher',
    actorInitials: 'AH',
    action: 'ATTENDANCE_OVERRIDDEN',
    actionVariant: 'warning',
    resourceType: 'AttendanceRecord',
    resourceId: 'AR-9942-PHYS',
    reason: 'Student provided approved medical leave certificate late.',
    ipAddress: '10.0.4.18',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    detailsJson: JSON.stringify({ studentId: 'STD-10087', oldStatus: 'A', newStatus: 'E', authorizedBy: 'Clinic' }, null, 2),
  },
  {
    id: 'evt-003',
    timestamp: '2026-10-27 11:08:29',
    actorName: 'Mohand Hatem',
    actorRole: 'Platform Superadmin',
    actorInitials: 'MH',
    action: 'USER_ROLE_UPDATED',
    actionVariant: 'primary',
    resourceType: 'AccountPermission',
    resourceId: 'USR-8821-STAFF',
    reason: 'Promoted instructor to Head of Department (Science).',
    ipAddress: '192.168.1.12',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/128.0.0.0',
    detailsJson: JSON.stringify({ userId: 'TCH-0412', previousRole: 'TEACHER', newRole: 'ADMIN_ACADEMIC' }, null, 2),
  },
  {
    id: 'evt-004',
    timestamp: '2026-10-27 09:44:12',
    actorName: 'System Service',
    actorRole: 'Automated Worker',
    actorInitials: 'SS',
    action: 'INVITATION_DISPATCHED',
    actionVariant: 'emerald',
    resourceType: 'FamilyOnboarding',
    resourceId: 'INV-4019-PARENT',
    reason: 'Automatic invitation token dispatched for new enrollment.',
    ipAddress: '127.0.0.1',
    userAgent: 'KarmaWorker/2.0 (Internal Notification Pipeline)',
    detailsJson: JSON.stringify({ parentEmail: 'k.almansoor@domain.ae', childId: 'STD-10331', expiresAt: '2026-11-03' }, null, 2),
  },
]

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component: SettingsPage
 * ────────────────────────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const t = useTranslations('features.settings')
  const { activeRole } = useShellStore()

  // Tabs: 'org' | 'profile' | 'audit'
  const [activeTab, setActiveTab] = useState<'org' | 'profile' | 'audit'>('org')

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Tab 1: Org Profile State
  const [org, setOrg] = useState<OrgProfile>(INITIAL_ORG)
  const [isEditOrgOpen, setIsEditOrgOpen] = useState(false)
  const [editOrgName, setEditOrgName] = useState(INITIAL_ORG.name)
  const [editOrgSlug, setEditOrgSlug] = useState(INITIAL_ORG.slug)
  const [editOrgTimezone, setEditOrgTimezone] = useState(INITIAL_ORG.timezone)

  // Tab 2: Profile Info State
  const [firstName, setFirstName] = useState('Admin')
  const [lastName, setLastName] = useState('User')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)

  // Tab 3: Audit Log State
  const [auditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS)
  const [selectedAudit, setSelectedAudit] = useState<AuditEvent | null>(null)
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false)

  // Handlers
  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault()
    setOrg({
      ...org,
      name: editOrgName.trim(),
      slug: editOrgSlug.trim(),
      timezone: editOrgTimezone,
    })
    setIsEditOrgOpen(false)
    setToastMessage(t('saveOrgSuccess'))
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setToastMessage(t('personalUpdated'))
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword !== confirmPassword) {
      setToastMessage('Passwords do not match.')
      setTimeout(() => setToastMessage(null), 3500)
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setToastMessage(t('passwordUpdated'))
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleExportAudit = () => {
    setToastMessage('Downloading audit_log_20261027.csv...')
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleInspectAudit = (evt: AuditEvent) => {
    setSelectedAudit(evt)
    setIsAuditDrawerOpen(true)
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            {t('title')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* 3 View Tabs */}
        <div className="bg-surface-container-high rounded-xl p-1 flex border border-outline-variant/60 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('org')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'org'
                ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{t('orgTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('profileTab')}</span>
          </button>
          {activeRole === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'audit'
                  ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/40'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t('auditTab')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
       * TAB 1: ORGANIZATION & PLAN SETTINGS (Stitch Screen 35 exact clone)
       * ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'org' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Organization Profile */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-outline-variant">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-on-surface">
                        {t('orgProfile')}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {t('orgProfileDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/60 pb-3.5">
                    <div className="text-xs font-medium text-on-surface-variant">{t('orgName')}</div>
                    <div className="col-span-2 font-semibold text-on-surface">{org.name}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/60 pb-3.5">
                    <div className="text-xs font-medium text-on-surface-variant">{t('slug')}</div>
                    <div className="col-span-2 font-mono text-xs bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/80 text-primary font-bold w-fit">
                      {org.slug}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/60 pb-3.5">
                    <div className="text-xs font-medium text-on-surface-variant">{t('timezone')}</div>
                    <div className="col-span-2 text-on-surface flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-outline" />
                      {org.timezone}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pb-2">
                    <div className="text-xs font-medium text-on-surface-variant">{t('defaultLocale')}</div>
                    <div className="col-span-2 text-on-surface flex items-center gap-1.5 font-medium">
                      <Globe className="w-4 h-4 text-outline" />
                      {org.defaultLocale} (English / Standard)
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-6 border-t border-outline-variant">
                <button
                  onClick={() => setIsEditOrgOpen(true)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                >
                  <Edit className="w-4 h-4" />
                  {t('editProfile')}
                </button>
              </div>
            </section>

            {/* Card 2: Subscription & Plan Tier (Stitch Screen 35 exact meters) */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-outline-variant">
                  <div>
                    <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                      {t('subPlan')}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t('planActive')}
                      </span>
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5 font-medium">
                      {t('planTier')}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center" title={t('verified')}>
                    <BadgeCheck className="w-5 h-5" />
                  </div>
                </div>

                {/* 4 Usage Meters */}
                <div className="space-y-4">
                  {/* Meter 1: Students */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-on-surface flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-outline" />
                        {t('studentsMeter')}
                      </span>
                      <span className="text-on-surface-variant font-mono">120 / 500 (24%)</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '24%' }} />
                    </div>
                  </div>

                  {/* Meter 2: Teachers */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-on-surface flex items-center gap-1.5">
                        <User className="w-4 h-4 text-outline" />
                        {t('teachersMeter')}
                      </span>
                      <span className="text-on-surface-variant font-mono">18 / 50 (36%)</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '36%' }} />
                    </div>
                  </div>

                  {/* Meter 3: Storage */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-on-surface flex items-center gap-1.5">
                        <HardDrive className="w-4 h-4 text-outline" />
                        {t('storageMeter')}
                      </span>
                      <span className="text-on-surface-variant font-mono">1.2 GB / 5.0 GB (24%)</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '24%' }} />
                    </div>
                  </div>

                  {/* Meter 4: AI Requests */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-on-surface flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-outline" />
                        {t('aiMeter')}
                      </span>
                      <span className="text-on-surface-variant font-mono">140 / 1,000 (14%)</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '14%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-6 border-t border-outline-variant">
                <button
                  onClick={() => {
                    setToastMessage('Redirecting to secure billing portal...')
                    setTimeout(() => setToastMessage(null), 3500)
                  }}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t('manageBilling')}
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * TAB 2: PROFILE & ACCOUNT PREFERENCES (Stitch Screen 33 exact clone)
       * ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Personal Info & Password (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Personal Information Card */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs">
              <div className="border-b border-outline-variant pb-4 mb-6">
                <h2 className="text-base font-bold text-on-surface">
                  {t('personalInfo')}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {t('personalInfoDesc')}
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Avatar with hover overlay */}
                <div className="flex items-center gap-5">
                  <div className="relative group cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-primary-fixed text-on-primary-fixed border-2 border-outline-variant flex items-center justify-center font-bold text-lg">
                      {firstName[0]}
                      {lastName[0]}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setToastMessage('Upload file dialog activated.')
                        setTimeout(() => setToastMessage(null), 3000)
                      }}
                      className="text-xs font-bold text-primary hover:underline block"
                    >
                      {t('changeAvatar')}
                    </button>
                    <span className="text-[11px] text-on-surface-variant mt-0.5 block">
                      {t('avatarHelp')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      {t('firstName')}
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      {t('lastName')}
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    disabled
                    value="admin@karmasaas.com"
                    className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-sm text-on-surface-variant cursor-not-allowed"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-outline" />
                    {t('emailNotice')}
                  </p>
                </div>

                <div className="pt-4 border-t border-outline-variant flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    {t('savePersonal')}
                  </button>
                </div>
              </form>
            </section>

            {/* Change Password Card */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs">
              <div className="border-b border-outline-variant pb-4 mb-4">
                <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  {t('changePassword')}
                </h2>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-xs font-semibold text-on-surface mb-1">
                    {t('currentPassword')}
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-xs font-semibold text-on-surface mb-1">
                      {t('newPassword')}
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-semibold text-on-surface mb-1">
                      {t('confirmPassword')}
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-surface-container-high hover:bg-surface-container text-on-surface border border-outline-variant rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  >
                    {t('updatePassword')}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right Column: Preferences & Notifications (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs">
              <div className="border-b border-outline-variant pb-4 mb-4">
                <h3 className="text-base font-bold text-on-surface">
                  {t('preferences')}
                </h3>
              </div>

              <div className="space-y-5">
                {/* Email notifications */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-on-surface">
                      {t('emailNotifs')}
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {t('emailNotifsDesc')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                </div>

                {/* SMS alerts */}
                <div className="flex items-start justify-between gap-3 border-t border-outline-variant/60 pt-4">
                  <div>
                    <div className="text-xs font-semibold text-on-surface">
                      {t('smsNotifs')}
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {t('smsNotifsDesc')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsNotifs}
                    onChange={(e) => setSmsNotifs(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * TAB 3: AUDIT LOG EXPLORER (Stitch Screen 34 exact clone)
       * ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                {t('auditTitle')}
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {t('auditSubtitle')}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-outline-variant/60 text-xs font-semibold text-on-surface">
                <Calendar className="w-4 h-4 text-outline" />
                <select className="bg-transparent outline-none cursor-pointer">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>All Time</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setToastMessage('Filter parameters applied.')
                  setTimeout(() => setToastMessage(null), 3000)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors shadow-xs"
              >
                <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
                Filter
              </button>

              <button
                onClick={handleExportAudit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-on-surface-variant" />
                {t('exportLog')}
              </button>
            </div>
          </div>

          {/* 3 Summary KPI Cards (Stitch Screen 34 exact cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  {t('totalEvents')}
                </span>
                <Activity className="w-4 h-4 text-outline" />
              </div>
              <div className="text-2xl font-bold text-on-surface">12,458</div>
              <div className="text-xs text-emerald-700 font-semibold mt-1">
                +2.4% vs last week
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  {t('criticalActions')}
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-on-surface">342</div>
              <div className="text-xs text-on-surface-variant font-medium mt-1">
                Requires review
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  {t('systemHealth')}
                </span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-on-surface">Normal</div>
              <div className="text-xs text-on-surface-variant font-medium mt-1">
                {t('healthNormal')}
              </div>
            </div>
          </div>

          {/* Audit Log Table (Stitch Screen 34 exact layout) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">{t('colTimestamp')}</th>
                    <th className="py-3 px-4">{t('colActor')}</th>
                    <th className="py-3 px-4">{t('colAction')}</th>
                    <th className="py-3 px-4">{t('colResource')}</th>
                    <th className="py-3 px-4 hidden md:table-cell">{t('colReason')}</th>
                    <th className="py-3 px-4 text-right">{t('colDetails')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-sm">
                  {auditLogs.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleInspectAudit(item)}
                      className="hover:bg-surface-container-low/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs text-on-surface whitespace-nowrap">
                        {item.timestamp}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-xs font-bold shrink-0">
                            {item.actorInitials}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-on-surface">
                              {item.actorName}
                            </div>
                            <div className="text-[11px] text-on-surface-variant">
                              {item.actorRole}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.actionVariant === 'primary'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : item.actionVariant === 'secondary'
                                ? 'bg-secondary-container text-on-secondary-container'
                                : item.actionVariant === 'warning'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {item.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-on-surface">
                          {item.resourceType}
                        </div>
                        <div className="text-[11px] font-mono text-on-surface-variant">
                          {item.resourceId}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 hidden md:table-cell text-xs text-on-surface-variant max-w-[220px] truncate">
                        {item.reason}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleInspectAudit(item)
                          }}
                          className="p-1 rounded-md hover:bg-surface-container-high text-outline group-hover:text-primary transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * Edit Organization Profile Drawer
       * ────────────────────────────────────────────────────────────────────────── */}
      <Drawer
        isOpen={isEditOrgOpen}
        onClose={() => setIsEditOrgOpen(false)}
        title={t('editOrgTitle')}
        maxWidth="md"
      >
        <form onSubmit={handleSaveOrg} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('orgName')} *
            </label>
            <input
              type="text"
              required
              value={editOrgName}
              onChange={(e) => setEditOrgName(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('slug')} *
            </label>
            <input
              type="text"
              required
              value={editOrgSlug}
              onChange={(e) => setEditOrgSlug(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('timezone')}
            </label>
            <select
              value={editOrgTimezone}
              onChange={(e) => setEditOrgTimezone(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Africa/Cairo">Africa/Cairo (UTC+2)</option>
              <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
              <option value="Asia/Riyadh">Asia/Riyadh (UTC+3)</option>
              <option value="UTC">Universal Coordinated Time (UTC)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setIsEditOrgOpen(false)}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Drawer>

      {/* ──────────────────────────────────────────────────────────────────────────
       * Audit Event Details Drawer
       * ────────────────────────────────────────────────────────────────────────── */}
      <Drawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        title={t('eventDetails')}
        maxWidth="lg"
      >
        {selectedAudit && (
          <div className="space-y-4 text-xs">
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/60 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-on-surface-variant">Event ID:</span>
                <span className="font-mono text-on-surface font-bold">{selectedAudit.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-on-surface-variant">{t('colTimestamp')}:</span>
                <span className="font-mono text-on-surface">{selectedAudit.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-on-surface-variant">{t('colActor')}:</span>
                <span className="text-on-surface font-bold">{selectedAudit.actorName} ({selectedAudit.actorRole})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-on-surface-variant">{t('actorIp')}:</span>
                <span className="font-mono text-on-surface">{selectedAudit.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-on-surface-variant">{t('userAgent')}:</span>
                <span className="text-on-surface truncate max-w-[280px]" title={selectedAudit.userAgent}>
                  {selectedAudit.userAgent}
                </span>
              </div>
            </div>

            <div>
              <span className="font-semibold text-on-surface block mb-1">
                {t('colReason')}
              </span>
              <p className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/60 text-on-surface font-medium">
                {selectedAudit.reason}
              </p>
            </div>

            <div>
              <span className="font-semibold text-on-surface block mb-1">
                {t('metadataPayload')}
              </span>
              <pre className="p-3 bg-surface-container-low rounded-lg border border-outline-variant font-mono text-[11px] text-on-surface overflow-x-auto">
                {selectedAudit.detailsJson}
              </pre>
            </div>

            <div className="pt-3 border-t border-outline-variant flex justify-end">
              <button
                onClick={() => setIsAuditDrawerOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
