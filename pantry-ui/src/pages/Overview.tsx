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
      <section className="card health">
        <h3>Stock Health Overview</h3>
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


