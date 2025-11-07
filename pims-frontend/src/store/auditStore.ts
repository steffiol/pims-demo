import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuditEvent } from '../types'
import { nanoid } from '../utils/nanoid'

type AuditState = {
  events: AuditEvent[]
  log: (action: string, actor: string, details?: string) => void
  clear: () => void
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      events: [],
      log: (action, actor, details) => set(state => ({
        events: [
          { id: nanoid(), at: new Date().toISOString(), actor, action, details },
          ...state.events,
        ],
      })),
      clear: () => set({ events: [] }),
    }),
    { name: 'audit-store' },
  ),
)


