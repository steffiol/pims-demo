import { Button, DatePicker, Space } from 'antd'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'

export default function Reports() {
  const generateMonthly = () => {
    const now = dayjs()
    const rows = [
      {
        reportDate: now.format('YYYY-MM-DD'),
        snack: 'Example',
        dateOfPurchase: now.subtract(1, 'month').format('YYYY-MM-DD'),
        dateOfExpiry: now.add(1, 'month').format('YYYY-MM-DD'),
        stockType: 'packs',
        stockPurchased: 100,
        currentStock: 20,
        purchasedBy: 'Admin',
      },
    ]
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly')
    XLSX.writeFile(wb, `snacks_report_${now.format('YYYY_MM')}.xlsx`)
  }

  return (
    <Space>
      <DatePicker picker="month" allowClear />
      <Button type="primary" onClick={generateMonthly}>Generate report</Button>
    </Space>
  )
}


