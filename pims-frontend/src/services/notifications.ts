import dayjs from 'dayjs'
import type { Snack } from '../types'

export function computeExpiring(snacks: Snack[], leadTimes: number[]) {
  const today = dayjs()
  const results = new Map<number, Snack[]>()
  for (const lead of leadTimes) results.set(lead, [])
  for (const snack of snacks) {
    const days = dayjs(snack.dateOfExpiry).diff(today, 'day')
    for (const lead of leadTimes) {
      if (days <= lead) {
        results.get(lead)!.push(snack)
      }
    }
  }
  return results
}

export function composeEmailBody(map: Map<number, Snack[]>) {
  const lines: string[] = []
  for (const [lead, items] of map.entries()) {
    if (items.length === 0) continue
    lines.push(`Within ${lead} days:`)
    for (const s of items) {
      lines.push(`- ${s.name} (expires ${dayjs(s.dateOfExpiry).format('YYYY-MM-DD')})`)
    }
    lines.push('')
  }
  return lines.join('\n')
}


