import { create } from 'zustand'

// Charter (blueprint §10): sidebar, locale/direction, theme, command palette,
// notification drawer, multi-step form drafts. Nothing fetchable or linkable —
// server state lives in TanStack Query, filters and selection live in the URL.
type ShellState = {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: ShellState['theme']) => void
}

export const useShellStore = create<ShellState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}))
