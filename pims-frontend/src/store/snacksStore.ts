import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Snack, StockAdjustment, Consumption } from '../types'
import { nanoid } from '../utils/nanoid'

type SnacksState = {
  snacks: Snack[]
  adjustments: StockAdjustment[]
  consumptions: Consumption[]
  addOrUpdateSnack: (snack: Snack) => void
  adjustStock: (snackId: string, delta: number, reason: StockAdjustment['reason'], actor: string) => void
  consume: (snackId: string, quantity: number, by: string) => void
  importUpsert: (rows: Snack[]) => { created: number; updated: number; skipped: number }
}

export const useSnacksStore = create<SnacksState>()(
  persist(
    (set, get) => ({
      snacks: [],
      adjustments: [],
      consumptions: [],
      addOrUpdateSnack: (snack) => set(state => {
        const idx = state.snacks.findIndex(s => s.id === snack.id)
        if (idx >= 0) {
          const copy = state.snacks.slice()
          copy[idx] = snack
          return { snacks: copy }
        }
        return { snacks: [...state.snacks, snack] }
      }),
      adjustStock: (snackId, delta, reason, actor) => set(state => {
        const snack = state.snacks.find(s => s.id === snackId)
        if (!snack) return {}
        const updated: Snack = { ...snack, currentStock: Math.max(0, snack.currentStock + delta) }
        const adjustments = [
          ...state.adjustments,
          { id: nanoid(), snackId, delta, reason, at: new Date().toISOString(), actor },
        ]
        return { snacks: state.snacks.map(s => s.id === snackId ? updated : s), adjustments }
      }),
      consume: (snackId, quantity, by) => set(state => {
        const snack = state.snacks.find(s => s.id === snackId)
        if (!snack) return {}
        const updated: Snack = { ...snack, currentStock: Math.max(0, snack.currentStock - quantity) }
        const consumptions = [
          ...state.consumptions,
          { id: nanoid(), snackId, quantity, by, at: new Date().toISOString() },
        ]
        return { snacks: state.snacks.map(s => s.id === snackId ? updated : s), consumptions }
      }),
      importUpsert: (rows) => {
        const existing = get().snacks
        let created = 0, updated = 0, skipped = 0
        const byId = new Map(existing.map(s => [s.id, s]))
        const next = [...existing]
        for (const row of rows) {
          if (!row.name || !row.dateOfExpiry) { skipped++; continue }
          if (row.id && byId.has(row.id)) {
            const idx = next.findIndex(s => s.id === row.id)
            next[idx] = { ...byId.get(row.id)!, ...row }
            updated++
          } else {
            next.push({ ...row, id: row.id || nanoid() })
            created++
          }
        }
        set({ snacks: next })
        return { created, updated, skipped }
      },
    }),
    { name: 'snacks-store' },
  ),
)


