'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  Download,
  Plus,
  Search,
  Mail,
  Phone,
  UserPlus,
  Users,
  X,
  CheckCircle2,
  HeartHandshake,
  GraduationCap,
} from 'lucide-react'
import { Drawer } from '../../../../../components/ui/drawer'
import { EmptyState } from '../../../../../components/ui/empty-state'
import { useShellStore } from '../../../../../stores/shell-store'

/* ──────────────────────────────────────────────────────────────────────────
 * Types & Interfaces
 * ────────────────────────────────────────────────────────────────────────── */

export type ContactType = 'Primary' | 'Secondary' | 'Guardian'

export interface LinkedChild {
  id: string
  name: string
  relation: string
  gradeClass: string
  color: 'primary' | 'secondary' | 'tertiary' | 'emerald'
}

export interface ParentItem {
  id: string
  nameEn: string
  nameAr: string
  initials: string
  contactType: ContactType
  email: string
  phone: string
  address?: string
  children: LinkedChild[]
}

/* ──────────────────────────────────────────────────────────────────────────
 * Initial Mock Data (cloned from Stitch screen fb96dcd3)
 * ────────────────────────────────────────────────────────────────────────── */

const INITIAL_PARENTS: ParentItem[] = [
  {
    id: 'prnt-1',
    nameEn: 'Ahmed Hatem',
    nameAr: 'أحمد حاتم',
    initials: 'AH',
    contactType: 'Primary',
    email: 'ahmed.hatem@example.com',
    phone: '+971 50 123 4567',
    address: 'Villa 14, Al-Wasl, Dubai',
    children: [
      { id: 'ch-1', name: 'Omar Hatem', relation: 'Son', gradeClass: 'Grade 10A', color: 'primary' },
      { id: 'ch-2', name: 'Sara Hatem', relation: 'Daughter', gradeClass: 'Grade 7B', color: 'secondary' },
    ],
  },
  {
    id: 'prnt-2',
    nameEn: 'Fatima Mahmoud',
    nameAr: 'فاطمة محمود',
    initials: 'FM',
    contactType: 'Secondary',
    email: 'f.mahmoud@example.com',
    phone: '+971 55 987 6543',
    address: 'Apt 402, Marina Heights, Dubai',
    children: [
      { id: 'ch-3', name: 'Youssef Mahmoud', relation: 'Son', gradeClass: 'Grade 11B', color: 'tertiary' },
    ],
  },
  {
    id: 'prnt-3',
    nameEn: 'Mariam Al-Sayed',
    nameAr: 'مريم السيد',
    initials: 'MS',
    contactType: 'Primary',
    email: 'mariam.sayed@example.com',
    phone: '+971 52 443 8901',
    address: 'Street 9, Jumeirah 3, Dubai',
    children: [
      { id: 'ch-4', name: 'Nour Al-Sayed', relation: 'Daughter', gradeClass: 'Grade 9C', color: 'primary' },
      { id: 'ch-5', name: 'Ziad Al-Sayed', relation: 'Son', gradeClass: 'Grade 6A', color: 'emerald' },
    ],
  },
  {
    id: 'prnt-4',
    nameEn: 'Tariq Al-Fayed',
    nameAr: 'طارق الفايد',
    initials: 'TF',
    contactType: 'Primary',
    email: 't.alfayed@example.com',
    phone: '+971 50 882 1199',
    address: 'Al-Barsha South, Dubai',
    children: [
      { id: 'ch-6', name: 'Sarah Al-Fayed', relation: 'Daughter', gradeClass: 'Grade 10A', color: 'secondary' },
    ],
  },
  {
    id: 'prnt-5',
    nameEn: 'Khaled Mansour',
    nameAr: 'خالد منصور',
    initials: 'KM',
    contactType: 'Guardian',
    email: 'khaled.m@example.com',
    phone: '+971 56 312 7788',
    address: 'Dubai Hills Estate',
    children: [
      { id: 'ch-7', name: 'Karim Mansour', relation: 'Ward', gradeClass: 'Grade 12A', color: 'tertiary' },
      { id: 'ch-8', name: 'Lina Mansour', relation: 'Daughter', gradeClass: 'Grade 8C', color: 'emerald' },
    ],
  },
]

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component: ParentsPage
 * ────────────────────────────────────────────────────────────────────────── */

export default function ParentsPage() {
  const t = useTranslations('features.parents')
  const { activeRole } = useShellStore()
  const canManage = activeRole === 'ADMIN'

  // State
  const [parents, setParents] = useState<ParentItem[]>(INITIAL_PARENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')

  // Drawers
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [linkingParent, setLinkingParent] = useState<ParentItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Add Parent Form State
  const [formNameEn, setFormNameEn] = useState('')
  const [formNameAr, setFormNameAr] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formContactType, setFormContactType] = useState<ContactType>('Primary')
  const [formInitialChild, setFormInitialChild] = useState('')
  const [formChildClass, setFormChildClass] = useState('10A')
  const [formChildRelation, setFormChildRelation] = useState('Son')

  // Link Child Form State
  const [linkStudentName, setLinkStudentName] = useState('')
  const [linkStudentClass, setLinkStudentClass] = useState('10A')
  const [linkStudentRelation, setLinkStudentRelation] = useState('Son')

  // Filtered Parents
  const filteredParents = useMemo(() => {
    return parents.filter((p) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        p.nameEn.toLowerCase().includes(q) ||
        p.nameAr.includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.children.some((c) => c.name.toLowerCase().includes(q) || c.gradeClass.toLowerCase().includes(q))

      const matchesType = filterType === 'ALL' || p.contactType === filterType

      return matchesQuery && matchesType
    })
  }, [parents, searchQuery, filterType])

  // Handlers
  const handleExportCsv = () => {
    const headers = ['Parent Name En,Parent Name Ar,Contact Type,Email,Phone,Linked Children']
    const rows = filteredParents.map(
      (p) =>
        `"${p.nameEn}","${p.nameAr}","${p.contactType}","${p.email}","${p.phone}","${p.children
          .map((c) => `${c.name} (${c.relation} - ${c.gradeClass})`)
          .join('; ')}"`
    )
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'parents_directory.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAddParentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formNameEn.trim() || !formEmail.trim()) return

    const newChildren: LinkedChild[] = formInitialChild.trim()
      ? [
          {
            id: `ch-new-${Date.now()}`,
            name: formInitialChild.trim(),
            relation: formChildRelation,
            gradeClass: `Grade ${formChildClass.trim() || '10A'}`,
            color: 'primary',
          },
        ]
      : []

    const newParent: ParentItem = {
      id: `prnt-${Date.now()}`,
      nameEn: formNameEn.trim(),
      nameAr: formNameAr.trim() || formNameEn.trim(),
      initials: formNameEn
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      contactType: formContactType,
      email: formEmail.trim(),
      phone: formPhone.trim() || '+971 50 000 0000',
      children: newChildren,
    }

    setParents([newParent, ...parents])
    setIsAddOpen(false)
    setFormNameEn('')
    setFormNameAr('')
    setFormEmail('')
    setFormPhone('')
    setFormInitialChild('')
    setToastMessage(t('parentRegistered'))
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleLinkChildSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkingParent || !linkStudentName.trim()) return

    const newChild: LinkedChild = {
      id: `ch-linked-${Date.now()}`,
      name: linkStudentName.trim(),
      relation: linkStudentRelation,
      gradeClass: `Grade ${linkStudentClass.trim() || '10A'}`,
      color: 'emerald',
    }

    setParents((prev) =>
      prev.map((p) => (p.id === linkingParent.id ? { ...p, children: [...p.children, newChild] } : p))
    )

    setLinkingParent(null)
    setLinkStudentName('')
    setToastMessage(t('linkSuccess'))
    setTimeout(() => setToastMessage(null), 4000)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header (Stitch Screen 20_parents_directory fb96dcd3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <HeartHandshake className="w-7 h-7 text-primary" />
            {t('title')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-on-surface-variant" />
            {t('exportCsv')}
          </button>

          {canManage && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {t('addParent')}
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-3 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        {/* Search Input */}
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-8 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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

        <div className="h-6 w-px bg-outline-variant hidden md:block" />

        {/* Contact Type Filter */}
        <div className="w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-48 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-medium"
          >
            <option value="ALL">All Contacts</option>
            <option value="Primary">{t('primaryContact')}</option>
            <option value="Secondary">{t('secondaryContact')}</option>
            <option value="Guardian">{t('guardian')}</option>
          </select>
        </div>
      </div>

      {/* Data Table Card (Stitch Screen 20_parents_directory fb96dcd3) */}
      {filteredParents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No parents found"
          description="Try adjusting your search query or clear the active filters to see all family accounts."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('')
            setFilterType('ALL')
          }}
        />
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    {t('colParentName')}
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    {t('colContactInfo')}
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    {t('colLinkedChildren')}
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                    {t('colActions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredParents.map((parent) => (
                  <tr
                    key={parent.id}
                    className="hover:bg-surface-container-low transition-colors group"
                  >
                    {/* Parent Name & Type */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold shrink-0">
                          {parent.initials}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-on-surface">
                            {parent.nameEn}
                          </div>
                          <div className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                            <span dir="rtl" className="font-medium">{parent.nameAr}</span>
                            <span>•</span>
                            <span className="font-medium text-primary">
                              {parent.contactType === 'Primary'
                                ? t('primaryContact')
                                : parent.contactType === 'Secondary'
                                  ? t('secondaryContact')
                                  : t('guardian')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-4">
                      <div className="text-sm text-on-surface flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-outline shrink-0" />
                        <a href={`mailto:${parent.email}`} className="hover:text-primary transition-colors">
                          {parent.email}
                        </a>
                      </div>
                      <div className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-1">
                        <Phone className="w-3.5 h-3.5 text-outline shrink-0" />
                        <a href={`tel:${parent.phone}`} className="hover:text-primary transition-colors">
                          {parent.phone}
                        </a>
                      </div>
                    </td>

                    {/* Linked Children Pills (Stitch exact design) */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {parent.children.map((child) => (
                          <span
                            key={child.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-xs font-medium border border-outline-variant/60"
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                child.color === 'primary'
                                  ? 'bg-primary'
                                  : child.color === 'secondary'
                                    ? 'bg-secondary'
                                    : child.color === 'emerald'
                                      ? 'bg-emerald-500'
                                      : 'bg-amber-500'
                              }`}
                            />
                            <span>{child.name}</span>
                            <span className="text-[11px] text-on-surface-variant">
                              [{child.relation} - {child.gradeClass}]
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setLinkingParent(parent)}
                        className="text-primary hover:text-primary/80 text-xs font-semibold py-1 px-2.5 rounded hover:bg-surface-container transition-colors inline-flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        {t('linkChild')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * Add Parent Drawer
       * ────────────────────────────────────────────────────────────────────────── */}
      <Drawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={t('addParentTitle')}
        maxWidth="md"
      >
        <form onSubmit={handleAddParentSubmit} className="space-y-4">
          <p className="text-xs text-on-surface-variant">
            {t('addParentSubtitle')}
          </p>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('fullNameEn')} *
            </label>
            <input
              type="text"
              required
              value={formNameEn}
              onChange={(e) => setFormNameEn(e.target.value)}
              placeholder="e.g. Tariq Mansour"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('fullNameAr')}
            </label>
            <input
              type="text"
              dir="rtl"
              value={formNameAr}
              onChange={(e) => setFormNameAr(e.target.value)}
              placeholder="مثال: طارق منصور"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                {t('email')} *
              </label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                {t('phone')}
              </label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+971 50 123 4567"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('relationship')}
            </label>
            <select
              value={formContactType}
              onChange={(e) => setFormContactType(e.target.value as ContactType)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Primary">{t('primaryContact')}</option>
              <option value="Secondary">{t('secondaryContact')}</option>
              <option value="Guardian">{t('guardian')}</option>
            </select>
          </div>

          <div className="pt-2 border-t border-outline-variant">
            <h4 className="text-xs font-semibold text-on-surface mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-primary" />
              Initial Child Association
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <input
                  type="text"
                  value={formInitialChild}
                  onChange={(e) => setFormInitialChild(e.target.value)}
                  placeholder="Child name"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={formChildClass}
                  onChange={(e) => setFormChildClass(e.target.value)}
                  placeholder="Class (10A)"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <select
                  value={formChildRelation}
                  onChange={(e) => setFormChildRelation(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Ward">Ward</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              {t('saveParent')}
            </button>
          </div>
        </form>
      </Drawer>

      {/* ──────────────────────────────────────────────────────────────────────────
       * Link Child Drawer
       * ────────────────────────────────────────────────────────────────────────── */}
      <Drawer
        isOpen={!!linkingParent}
        onClose={() => setLinkingParent(null)}
        title={t('linkChildTitle')}
        maxWidth="md"
      >
        {linkingParent && (
          <form onSubmit={handleLinkChildSubmit} className="space-y-4">
            <p className="text-xs text-on-surface-variant">
              {t('linkChildSubtitle', { parentName: linkingParent.nameEn })}
            </p>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={linkStudentName}
                onChange={(e) => setLinkStudentName(e.target.value)}
                placeholder="e.g. Omar Hatem"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Class & Section *
                </label>
                <input
                  type="text"
                  required
                  value={linkStudentClass}
                  onChange={(e) => setLinkStudentClass(e.target.value)}
                  placeholder="e.g. 10A"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  {t('relationWithStudent')}
                </label>
                <select
                  value={linkStudentRelation}
                  onChange={(e) => setLinkStudentRelation(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Son">{t('son')}</option>
                  <option value="Daughter">{t('daughter')}</option>
                  <option value="Ward">{t('ward')}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setLinkingParent(null)}
                className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                {t('confirmLink')}
              </button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  )
}
