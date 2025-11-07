import { useEffect, useState } from 'react'
import { getExpiryDays, setExpiryDays } from '../utils/config'

export default function AdminSettings() {
  const [days, setDays] = useState<number>(30)
  useEffect(() => { setDays(getExpiryDays()) }, [])
  return (
    <div>
      <h1 className="title" style={{ marginBottom: 12 }}>Admin Settings</h1>
      <div className="card" style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ color:'#6b6b6b' }}>Email trigger days before expiry</span>
        <input type="number" min={1} value={days} onChange={e => setDays(parseInt(e.target.value || '1',10))} style={{ width:120, border:'1px solid #d8d8d8', borderRadius:8, padding:'10px 12px' }} />
        <button onClick={() => setExpiryDays(days)} style={{ border:'1px solid #e1e1e1', background:'#fff', borderRadius:8, padding:'10px 14px', color:'#6b6b6b' }}>Save</button>
      </div>
    </div>
  )
}


