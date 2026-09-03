import { create } from 'zustand'

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

type ShellState = {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: ShellState['theme']) => void
  activeRole: UserRole
  setActiveRole: (role: UserRole) => void
  activeOrganization: { id: string; name: string } | null
  setActiveOrganization: (org: { id: string; name: string } | null) => void
}

export const useShellStore = create<ShellState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  theme: 'system',
  setTheme: (theme) => set({ theme }),
  activeRole: 'ADMIN',
  setActiveRole: (activeRole) => set({ activeRole }),
  activeOrganization: { id: 'default-org', name: 'Karma International School' },
  setActiveOrganization: (activeOrganization) => set({ activeOrganization }),
}))
