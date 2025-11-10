import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { snackRows } from '../data/snacks'
import { getAnnouncementDays } from '../utils/config'

type Ann = { id: string; at: string; body: string; posted?: boolean }

export default function Announcements() {
  const THRESHOLD = getAnnouncementDays()
  const [feed, setFeed] = useState<Ann[]>([{
    id: crypto.randomUUID(),
    at: dayjs('2025-10-01 09:00').toISOString(),
    posted: true,
    body: `These snacks are expiring within 14 days:\n• Milo 3-in-1 Activgo — expiry 2025-10-10 (current: 12)\n• Lay's Nori Seaweed — expiry 2025-10-12 (current: 6)\n\nPlease help consume them soon. Thanks!`,
  }])

  const expiring = useMemo(() => {
    const now = dayjs()
    return snackRows.filter(s => dayjs(s.expiry).diff(now, 'day') <= THRESHOLD)
  }, [])

  useEffect(() => {
    // Auto-generate one draft on mount if there are items expiring soon
    if (expiring.length === 0) return
    const body = compose(expiring, THRESHOLD)
    setFeed(curr => [{ id: crypto.randomUUID(), at: new Date().toISOString(), body }, ...curr])
  }, [expiring])

  const post = (id: string) => setFeed(prev => prev.map(a => a.id === id ? { ...a, posted: true } : a))

  return (
    <>
      <h1 className="title" style={{ marginBottom: 12 }}>Announcements</h1>

      {feed.map(a => (
        <div key={a.id} className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ color:'#6b6b6b' }}>{dayjs(a.at).format('YYYY-MM-DD HH:mm')}</div>
            <div>
              {!a.posted && (
                <button onClick={() => post(a.id)} style={{ border:'1px solid #e1e1e1', background:'#fff', borderRadius:8, padding:'10px 14px', color:'#6b6b6b' }}>Post</button>
              )}
            </div>
          </div>
          <div style={{ whiteSpace:'pre-wrap', marginTop: 12, color:'#555' }}>{a.body || ''}</div>
        </div>
      ))}
    </>
  )
}

function compose(rows: typeof snackRows, days: number) {
  if (rows.length === 0) return ''
  const lines = [`These snacks are expiring within ${days} days:`]
  for (const r of rows) {
    lines.push(`• ${r.name} — expiry ${dayjs(r.expiry).format('YYYY-MM-DD')} (current: ${r.current})`)
  }
  lines.push('\nPlease help consume them soon. Thanks!')
  return lines.join('\n')
}


