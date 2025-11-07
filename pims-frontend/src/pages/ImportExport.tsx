import { Button, Divider, Upload, message } from 'antd'
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'
import { useSnacksStore } from '../store/snacksStore'
import { useAuditStore } from '../store/auditStore'

export default function ImportExport() {
  const importUpsert = useSnacksStore(s => s.importUpsert)
  const snacks = useSnacksStore(s => s.snacks)
  const { log } = useAuditStore()
  const props = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    customRequest: async ({ file, onSuccess, onError }: any) => {
      try {
        const f = file as File
        const data = await f.arrayBuffer()
        const wb = XLSX.read(data)
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws)
        const mapped = rows.map((r: any) => ({
          id: r.id?.toString?.() || undefined,
          name: String(r.name || ''),
          dateOfPurchase: String(r.dateOfPurchase || ''),
          dateOfExpiry: String(r.dateOfExpiry || ''),
          stockType: (String(r.stockType || 'packs').toLowerCase() === 'box' ? 'box' : 'packs') as 'box' | 'packs',
          stockPurchased: Number(r.stockPurchased || 0),
          currentStock: Number(r.currentStock || 0),
          purchasedBy: String(r.purchasedBy || 'Admin'),
        }))
        const res = importUpsert(mapped as any)
        log('Excel import upsert', 'System', `created=${res.created}, updated=${res.updated}, skipped=${res.skipped}`)
        message.success(`Imported: ${res.created} created, ${res.updated} updated, ${res.skipped} skipped`)
        onSuccess?.({}, f)
      } catch (e: any) {
        message.error(e?.message || 'Failed to parse file')
        onError?.(e)
      }
    },
  }

  const downloadTemplate = () => {
    const rows = [
      {
        id: 'optional-existing-id',
        name: 'Snack name',
        dateOfPurchase: 'YYYY-MM-DD',
        dateOfExpiry: 'YYYY-MM-DD',
        stockType: 'box|packs',
        stockPurchased: 0,
        currentStock: 0,
        purchasedBy: 'Name',
      },
    ]
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Snacks')
    XLSX.writeFile(wb, 'snack_import_template.xlsx')
  }

  const exportData = () => {
    const rows = snacks.map(s => ({
      id: s.id,
      name: s.name,
      dateOfPurchase: s.dateOfPurchase,
      dateOfExpiry: s.dateOfExpiry,
      stockType: s.stockType,
      stockPurchased: s.stockPurchased,
      currentStock: s.currentStock,
      purchasedBy: s.purchasedBy,
      barcode: s.barcode || '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Snacks')
    XLSX.writeFile(wb, 'snacks_export.xlsx')
  }

  return (
    <>
      <Upload.Dragger {...props} style={{ marginBottom: 16 }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag Excel file to this area to import</p>
        <p className="ant-upload-hint">Must match template columns and types</p>
      </Upload.Dragger>
      <Divider />
      <Button type="primary" icon={<DownloadOutlined />} onClick={downloadTemplate} style={{ marginRight: 8 }}>
        Download template
      </Button>
      <Button onClick={exportData}>Export current data</Button>
    </>
  )
}


