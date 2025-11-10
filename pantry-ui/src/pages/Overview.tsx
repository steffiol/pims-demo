import { FaSearch } from 'react-icons/fa'
import { useMemo, useState } from 'react'

export default function Overview() {
  const baseRows = [
    { name: 'Milo 3-in-1 Activgo', quantity: 40, type: 'Pack', expiry: '2026-03-22' },
    { name: "Lay's Nori Seaweed", quantity: 16, type: 'Box', expiry: '2026-03-22' },
    { name: 'Oriental Super Ring Family Packets', quantity: 52, type: 'Pack', expiry: '2027-06-14' },
  ]
  const [sortBy, setSortBy] = useState<'expiry' | 'quantity' | ''>('') 
  const rows = useMemo(() => {
    const copy = baseRows.slice()
    if (sortBy === 'expiry') {
      copy.sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime())
    } else if (sortBy === 'quantity') {
      copy.sort((a, b) => a.quantity - b.quantity)
    }
    return copy
  }, [sortBy])
  return (
    <>
      <section className="kpis">
        <div className="kpi"><div className="num">95</div><div className="label">Snacks Available</div></div>
        <div className="kpi"><div className="num">14</div><div className="label">Low Stock</div></div>
        <div className="kpi"><div className="num">8</div><div className="label">Expiring Soon</div></div>
      </section>
      <div style={{ display:'grid', gridTemplateColumns:'7fr 5fr', gap: 24 }}>
        <section className="card health">
          <h3>Stock Overview</h3>
          {(() => {
            // Fixed values to match requested design
            const low = 14
            const expiring = 8
            const wLow = 70
            const wExp = 40
            return (
              <>
                <div className="row">
                  <div>{`Low Stock (${low})`}</div>
                  <div className="bar"><div className="fill" style={{ width: `${wLow}%` }} /></div>
                </div>
                <div className="row">
                  <div>{`Expiring Soon (${expiring})`}</div>
                  <div className="bar"><div className="fill" style={{ width: `${wExp}%` }} /></div>
                </div>
              </>
            )
          })()}
        </section>
        <section className="card">
          {(() => {
            const totalBudget = 2000
            const used = 1360
            const pct = Math.round((used / totalBudget) * 100)
            const r = 54
            const c = 2 * Math.PI * r
            const dash = (pct / 100) * c
            return (
              <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', alignItems:'center', gap: 16 }}>
                <div style={{ position:'relative', width: 140, height: 140 }}>
                  <svg width="140" height="140">
                    <circle cx="70" cy="70" r={r} stroke="#e5e5e5" strokeWidth="12" fill="none" />
                    <circle
                      cx="70"
                      cy="70"
                      r={r}
                      stroke="#b8b8b8"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${dash} ${c - dash}`}
                      strokeLinecap="round"
                      transform="rotate(-90 70 70)"
                    />
                  </svg>
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', color:'#6e6e6e' }}>
                    <div style={{ fontSize: 28, fontWeight: 600 }}>{pct}%</div>
                    <div style={{ fontSize: 12, color:'#8a8a8a' }}>Used</div>
                  </div>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 22, color:'#6e6e6e', fontWeight:600 }}>Monthly Budget</h3>
                  <div style={{ marginTop: 8, color:'#7a7a7a' }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span>Used</span>
                      <span>RM {used.toLocaleString()}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop: 6 }}>
                      <span>Remaining</span>
                      <span>RM {(totalBudget - used).toLocaleString()}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop: 6 }}>
                      <span>Total</span>
                      <span>RM {totalBudget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </section>
      </div>
      <section>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 className="" style={{ margin: 0, fontSize: 28, color: '#6e6e6e', fontWeight: 600 }}>Current Snacks Inventory</h3>
          <div className="toolbar">
            <div className="search"><span>Search snacks</span> <FaSearch className="icon" /></div>
            <div className="field">
              <label>Sort by</label>
              <select className="select" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                <option value="">None</option>
                <option value="expiry">Expiry date</option>
                <option value="quantity">Stock quantity</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card" style={{ paddingTop: 0 }}>
          <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Snack Name</th>
                <th>Stock Quantity</th>
                <th>Stock Type</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td>
                  <td>{r.quantity}</td>
                  <td>{r.type}</td>
                  <td>{new Date(r.expiry).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </section>
    </>
  )
}


