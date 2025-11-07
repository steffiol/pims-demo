import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InAppNotification } from '../types'
import { nanoid } from '../utils/nanoid'

type NotificationsState = {
  notifications: InAppNotification[]
  add: (n: Omit<InAppNotification, 'id' | 'at' | 'read'> & { read?: boolean }) => void
  markRead: (id: string) => void
  clear: () => void
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: [],
      add: (n) => set(state => ({
        notifications: [
          { id: nanoid(), at: new Date().toISOString(), ...n },
          ...state.notifications,
        ],
      })),
      markRead: (id) => set(state => ({
        notifications: state.notifications.map(x => x.id === id ? { ...x, read: true } : x),
      })),
      clear: () => set({ notifications: [] }),
    }),
    { name: 'notifications-store' },
  ),
)





