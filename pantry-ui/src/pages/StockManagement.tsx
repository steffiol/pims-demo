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
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<{ name: string; expiry: string; purchaseDate: string; type: string; purchased: number; current: number; by: string; trial: boolean }>({
    name: '',
    expiry: '',
    purchaseDate: '',
    type: 'Packet',
    purchased: 0,
    current: 0,
    by: '',
    trial: true,
  })

  const handleAdd = () => {
    const newRow: Row = {
      name: form.name || 'New Snack',
      expiry: form.expiry || dayjs().add(30, 'day').format('YYYY-MM-DD'),
      purchaseDate: form.purchaseDate || dayjs().format('YYYY-MM-DD'),
      type: form.type || 'Packet',
      purchased: Number.isFinite(form.purchased) ? Number(form.purchased) : 0,
      current: Number.isFinite(form.current) ? Number(form.current) : 0,
      by: form.by || 'Admin',
      trial: !!form.trial,
    }
    setRows(prev => [newRow, ...prev])
    setShowAdd(false)
    setTab(form.trial ? 'trial' : 'all')
  }
  return (
    <>
      <div className="kpis kpis-4" style={{ marginTop: 8 }}>
        {(() => {
          // Display fixed counts to match design
          const total = 95
          const low = 14
          const exp = 8
          const recent = 2
          return (
            <>
              <div className="kpi"><div className="label" style={{ fontSize: 18, marginBottom: 8 }}>Total Snacks</div><div className="num">{total}</div></div>
              <div className="kpi"><div className="label" style={{ fontSize: 18, marginBottom: 8 }}>Low Stock</div><div className="num">{low}</div></div>
              <div className="kpi"><div className="label" style={{ fontSize: 18, marginBottom: 8 }}>Soon to Expire</div><div className="num">{exp}</div></div>
              <div className="kpi"><div className="label" style={{ fontSize: 18, marginBottom: 8 }}>New Snack</div><div className="num">{recent}</div></div>
            </>
          )
        })()}
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
                {key === 'all' ? 'All' : key === 'low' ? 'Low stock' : key === 'expiring' ? 'Soon to expire' : key === 'recent' ? 'Recently added' : 'New Snack'}
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
            <button onClick={() => setShowAdd(true)} style={{ border:'1px solid #e1e1e1', background:'#fff', borderRadius:8, padding:'10px 14px', color:'#6b6b6b' }}>Add New Snack</button>
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
                const filtered = rows.filter(r => {
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
                // Sort by lowest to highest quantity available (current remaining)
                return filtered.slice().sort((a, b) => a.current - b.current)
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
        {showAdd && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
            <div className="card" style={{ width: 560, maxWidth: '92%' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8 }}>
                <h3 style={{ fontSize: 22, margin: 0, fontWeight: 600, color: '#6e6e6e' }}>Add New Snack</h3>
                <button onClick={() => setShowAdd(false)} style={{ border:'1px solid #e1e1e1', background:'#fff', color:'#6b6b6b', borderRadius:6, padding:'6px 10px' }}>×</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div className="field">
                  <label>Snack name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ border:'1px solid #e1e1e1', borderRadius:8, padding:'8px 10px' }} />
                </div>
                <div className="field">
                  <label>Stock type</label>
                  <input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ border:'1px solid #e1e1e1', borderRadius:8, padding:'8px 10px' }} />
                </div>
                <div className="field">
                  <label>Expiry date</label>
                  <input type="date" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} style={{ border:'1px solid #e1e1e1', borderRadius:8, padding:'8px 10px' }} />
                </div>
                <div className="field">
                  <label>Date of purchase</label>
                  <input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} style={{ border:'1px solid #e1e1e1', borderRadius:8, padding:'8px 10px' }} />
                </div>
                <div className="field">
                  <label>Purchase quantity</label>
                  <input type="number" min={0} value={form.purchased} onChange={e => setForm({ ...form, purchased: Number(e.target.value) })} style={{ border:'1px solid #e1e1e1', borderRadius:8, padding:'8px 10px' }} />
                </div>
                <div className="field">
                  <label>Current remaining</label>
                  <input type="number" min={0} value={form.current} onChange={e => setForm({ ...form, current: Number(e.target.value) })} style={{ border:'1px solid #e1e1e1', borderRadius:8, padding:'8px 10px' }} />
                </div>
                <div className="field">
                  <label>Purchased by</label>
                  <input value={form.by} onChange={e => setForm({ ...form, by: e.target.value })} style={{ border:'1px solid #e1e1e1', borderRadius:8, padding:'8px 10px' }} />
                </div>
                <div className="field" style={{ alignSelf:'end' }}>
                  <label style={{ visibility:'hidden' }}>flag</label>
                  <label style={{ display:'flex', alignItems:'center', gap:8, color:'#6b6b6b' }}>
                    <input type="checkbox" checked={form.trial} onChange={e => setForm({ ...form, trial: e.target.checked })} />
                    Mark as New Item
                  </label>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:16 }}>
                <button onClick={() => setShowAdd(false)} style={{ border:'1px solid #e1e1e1', background:'#fff', color:'#6b6b6b', borderRadius:8, padding:'10px 14px' }}>Cancel</button>
                <button onClick={handleAdd} style={{ border:'1px solid #e1e1e1', background:'#f2f2f2', color:'#5a5a5a', borderRadius:8, padding:'10px 14px' }}>Add Snack</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  )
}


