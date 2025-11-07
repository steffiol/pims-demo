import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NotificationSettings, Role } from '../types'

type SettingsState = {
  settings: NotificationSettings
  role: Role
  setSettings: (s: Partial<NotificationSettings>) => void
  setRole: (r: Role) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        leadTimes: [7, 30],
        recipients: [],
        frequency: 'daily',
        lowStockAbsolute: 5,
        enableAnnouncements: false,
        announcementWebhookUrl: '',
      },
      role: 'admin',
      setSettings: (s) => set(state => ({ settings: { ...state.settings, ...s } })),
      setRole: (r) => set({ role: r }),
    }),
    { name: 'settings-store' },
  ),
)


