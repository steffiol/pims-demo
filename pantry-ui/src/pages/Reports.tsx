import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { snackRows } from '../data/snacks'

type Row = {
  snackName: string
  dateOfPurchase: string
  expiryDate: string
  purchasedQty: number
  currentQty: number
  stockType: string
  purchasedBy: string
  reportDate: string
}

export default function Reports() {
  const now = dayjs()
  const [year, setYear] = useState<number>(now.year())
  const [monthIdx, setMonthIdx] = useState<number>(now.month()) // 0-11

  const ym = dayjs(new Date(year, monthIdx, 1)).format('YYYY-MM')

  const rows: Row[] = useMemo(() => {
    const rd = dayjs().format('YYYY-MM-DD')
    // Build from shared snack data, adjusting purchase date into selected month when needed
    const mapped: Row[] = snackRows.slice(0, 5).map((s, i) => ({
      snackName: s.name,
      dateOfPurchase: dayjs(s.purchaseDate).year(year).month(monthIdx).date(Math.min(28, 2 + i)).format('YYYY-MM-DD'),
      expiryDate: s.expiry,
      purchasedQty: s.purchased,
      currentQty: s.current,
      stockType: s.type,
      purchasedBy: s.by,
      reportDate: rd,
    }))
    return mapped.filter(r => dayjs(r.dateOfPurchase).format('YYYY-MM') === ym)
  }, [monthIdx, year, ym])

  const exportExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, sheet, 'Monthly')
    XLSX.writeFile(wb, `snacks_report_${ym}.xlsx`)
  }

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(16)
    doc.text(`SnackWatch Monthly Report — ${ym}`, 14, 16)
    autoTable(doc, {
      startY: 22,
      head: [[
        'Snack name',
        'Date of purchase',
        'Expiry date',
        'Purchased quantity',
        'Current remaining',
        'Stock type',
        'Purchased by',
        'Report date',
      ]],
      body: rows.map(r => [
        r.snackName,
        dayjs(r.dateOfPurchase).format('YYYY-MM-DD'),
        dayjs(r.expiryDate).format('YYYY-MM-DD'),
        String(r.purchasedQty),
        String(r.currentQty),
        r.stockType,
        r.purchasedBy,
        r.reportDate,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [242, 242, 242], textColor: 17 },
    })
    doc.save(`snacks_report_${ym}.pdf`)
  }

  return (
    <>
      <h1 className="title" style={{ marginBottom: 12 }}>Reports</h1>
      <div className="card" style={{ display:'flex', gap:12, alignItems:'center' }}>
        <label style={{ color:'#6b6b6b' }}>Month</label>
        <select value={monthIdx} onChange={e => setMonthIdx(Number(e.target.value))} style={{ border:'1px solid #d8d8d8', borderRadius:8, padding:'10px 12px' }}>
          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
            <option value={i} key={m}>{m}</option>
          ))}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ border:'1px solid #d8d8d8', borderRadius:8, padding:'10px 12px' }}>
          {Array.from({ length: 6 }).map((_, idx) => {
            const y = now.year() - 2 + idx
            return <option key={y} value={y}>{y}</option>
          })}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={exportExcel} style={{ border:'1px solid #e1e1e1', background:'#fff', borderRadius:8, padding:'10px 14px', color:'#6b6b6b' }}>Export Excel</button>
        <button onClick={exportPdf} style={{ border:'1px solid #e1e1e1', background:'#fff', borderRadius:8, padding:'10px 14px', color:'#6b6b6b' }}>Export PDF</button>
      </div>

      <div className="card" style={{ paddingTop: 0 }}>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Snack name</th>
              <th>Date of purchase</th>
              <th>Expiry date</th>
              <th>Purchased quantity</th>
              <th>Current remaining</th>
              <th>Stock type</th>
              <th>Purchased by</th>
              <th>Report date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign:'center', color:'#8a8a8a', padding:'60px 0' }}>No data</td></tr>
            ) : rows.map((r, idx) => (
              <tr key={idx}>
                <td>{r.snackName}</td>
                <td>{dayjs(r.dateOfPurchase).format('YYYY-MM-DD')}</td>
                <td>{dayjs(r.expiryDate).format('YYYY-MM-DD')}</td>
                <td>{r.purchasedQty}</td>
                <td>{r.currentQty}</td>
                <td>{r.stockType}</td>
                <td>{r.purchasedBy}</td>
                <td>{r.reportDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </>
  )
}


