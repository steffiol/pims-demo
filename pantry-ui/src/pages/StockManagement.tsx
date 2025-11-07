import { FaSearch } from 'react-icons/fa'
import { useMemo, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import { snackRows } from '../data/snacks'

type Row = { name: string; expiry: string; purchaseDate: string; type: string; purchased: number; current: number; by: string; trial?: boolean }

const initialData: Row[] = snackRows

export default function StockManagement() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<Row[]>(initialData)
  const [tab, setTab] = useState<'all' | 'low' | 'expiring' | 'recent' | 'trial'>('all')
  return (
    <>
      <div className="kpis" style={{ marginTop: 8 }}>
        <div className="kpi"><div className="label" style={{ fontSize: 18, marginBottom: 8 }}>Low stock</div><div className="num">0</div></div>
        <div className="kpi"><div className="label" style={{ fontSize: 18, marginBottom: 8 }}>Soon to expire</div><div className="num">0</div></div>
        <div className="kpi"><div className="label" style={{ fontSize: 18, marginBottom: 8 }}>Recently added</div><div className="num">0</div></div>
      </div>

      <section className="card" style={{ paddingTop: 12 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', gap:24, color:'#6b6b6b' }}>
            {(['all','low','expiring','recent','trial'] as const).map(key => (
              <span
                key={key}
                onClick={() => setTab(key)}
                style={{ cursor:'pointer', fontWeight: tab===key ? 700 : 400, textDecoration: tab===key ? 'underline' : 'none' }}
              >
                {key === 'all' ? 'All' : key === 'low' ? 'Low stock' : key === 'expiring' ? 'Soon to expire' : key === 'recent' ? 'Recently added' : 'New Trial Snack'}
              </span>
            ))}
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <div className="search"><span>Search snacks</span> <FaSearch className="icon" /></div>
            <div className="field">
              <label>Sort by</label>
              <select className="select" defaultValue="default">
                <option value="default">None</option>
              <option value="expiry">Expiry date</option>
              <option value="purchase">Date of purchase</option>
              <option value="name">Snack name</option>
                <option value="quantity">Quantity</option>
              </select>
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display:'none' }} onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              try {
                const buf = await f.arrayBuffer()
                const wb = XLSX.read(buf)
                const ws = wb.Sheets[wb.SheetNames[0]]
                const rows = XLSX.utils.sheet_to_json(ws)
                alert(`Imported ${rows.length} rows from ${f.name}`)
              } catch (err) {
                alert('Failed to parse Excel')
              } finally {
                e.currentTarget.value = ''
              }
            }} />
            <button onClick={() => fileRef.current?.click()} style={{ border:'1px solid #e1e1e1', background:'#fff', borderRadius:8, padding:'10px 14px', color:'#6b6b6b' }}>Import Excel</button>
          </div>
        </div>

        <div style={{ marginTop:16 }} className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Snack name</th>
                <th>Expiry date</th>
                <th>Date of purchase</th>
                <th>Stock type</th>
                <th>Purchase quantity</th>
                <th>Current remaining</th>
                <th>Purchased by</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {useMemo(() => {
                const now = dayjs()
                return rows.filter(r => {
                  if (tab === 'all') return true
                  if (tab === 'low') {
                    const threshold = Math.max(10, Math.ceil(r.purchased * 0.2))
                    return r.current <= threshold
                  }
                  if (tab === 'expiring') return dayjs(r.expiry).diff(now, 'day') <= 30
                  if (tab === 'recent') return now.diff(dayjs(r.purchaseDate), 'day') <= 30
                  if (tab === 'trial') return !!r.trial
                  return true
                })
              }, [rows, tab]).map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td>
                  <td>{new Date(r.expiry).toLocaleDateString('en-GB')}</td>
                  <td>{new Date(r.purchaseDate).toLocaleDateString('en-GB')}</td>
                  <td>{r.type}</td>
                  <td>{r.purchased}</td>
                  <td>{r.current}</td>
                  <td>{r.by}</td>
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => setRows(prev => prev.map(x => x === r ? { ...x, current: x.current + 1 } : x))} style={{ border:'1px solid #e1e1e1', background:'#fff', borderRadius:6, padding:'4px 10px', color:'#6b6b6b' }}>+</button>
                      <button onClick={() => setRows(prev => prev.map(x => x === r ? { ...x, current: Math.max(0, x.current - 1) } : x))} style={{ border:'1px solid #e1e1e1', background:'#fff', borderRadius:6, padding:'4px 10px', color:'#6b6b6b' }}>-</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}


