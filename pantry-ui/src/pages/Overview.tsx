import { FaSearch } from 'react-icons/fa'

export default function Overview() {
  return (
    <>
      <section className="kpis">
        <div className="kpi"><div className="num">95</div><div className="label">Snacks available</div></div>
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
          <h3 className="" style={{ margin: 0, fontSize: 28, color: '#6e6e6e', fontWeight: 600 }}>Snacks Inventory</h3>
          <div className="toolbar">
            <div className="search"><span>Search snacks</span> <FaSearch className="icon" /></div>
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
              <tr>
                <td>Milo 3-in-1 Activgo</td>
                <td>40</td>
                <td>Pack</td>
                <td>22/03/2026</td>
              </tr>
              <tr>
                <td>Lay's Nori Seaweed</td>
                <td>16</td>
                <td>Box</td>
                <td>22/03/2026</td>
              </tr>
              <tr>
                <td>Oriental Super Ring Family Packets</td>
                <td>52</td>
                <td>Pack</td>
                <td>14/06/2027</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </section>
    </>
  )
}


