import { describe, expect, it, beforeEach } from 'vitest'
import { useShellStore } from './shell-store'

describe('useShellStore', () => {
  beforeEach(() => {
    useShellStore.setState({ sidebarCollapsed: false, theme: 'system' })
  })

  it('starts with the sidebar expanded', () => {
    expect(useShellStore.getState().sidebarCollapsed).toBe(false)
  })

  it('toggles the sidebar', () => {
    useShellStore.getState().toggleSidebar()
    expect(useShellStore.getState().sidebarCollapsed).toBe(true)
  })

  it('sets the theme', () => {
    useShellStore.getState().setTheme('dark')
    expect(useShellStore.getState().theme).toBe('dark')
  })
})
