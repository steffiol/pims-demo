import { Button, Input, Space, Table, Tag, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useSnacksStore } from '../store/snacksStore'
import { AdjustStockModal } from '../components/AdjustStockModal'
import { ConsumeModal } from '../components/ConsumeModal'
import { useAuditStore } from '../store/auditStore'

export default function Snacks() {
  const [query, setQuery] = useState('')
  const [adjustId, setAdjustId] = useState<string | null>(null)
  const [consumeId, setConsumeId] = useState<string | null>(null)
  const data = useSnacksStore(s => s.snacks)
  const adjustStock = useSnacksStore(s => s.adjustStock)
  const consume = useSnacksStore(s => s.consume)
  const { log } = useAuditStore()
  const filtered = useMemo(
    () => data.filter(s => s.name.toLowerCase().includes(query.toLowerCase())),
    [data, query],
  )

  return (
    <>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Input.Search placeholder="Search snacks" allowClear onChange={e => setQuery(e.target.value)} style={{ maxWidth: 360 }} />
        <Button type="primary" icon={<PlusOutlined />}>Add snack</Button>
      </Space>
      <Table
        rowKey="id"
        dataSource={filtered}
        columns={[
          { title: 'Snack', dataIndex: 'name' },
          {
            title: 'Expiry',
            dataIndex: 'dateOfExpiry',
            render: (v: string) => {
              const days = dayjs(v).diff(dayjs(), 'day')
              const color = days <= 7 ? 'red' : days <= 30 ? 'orange' : 'green'
              return <Tag color={color}>{dayjs(v).format('YYYY-MM-DD')} ({days}d)</Tag>
            },
            sorter: (a, b) => dayjs(a.dateOfExpiry).unix() - dayjs(b.dateOfExpiry).unix(),
          },
          { title: 'Type', dataIndex: 'stockType', filters: [ { text: 'Box', value: 'box' }, { text: 'Packs', value: 'packs' } ], onFilter: (v, r) => r.stockType === v },
          { title: 'Purchased', dataIndex: 'stockPurchased', sorter: (a, b) => a.stockPurchased - b.stockPurchased },
          { title: 'Current', dataIndex: 'currentStock', sorter: (a, b) => a.currentStock - b.currentStock },
          { title: 'Purchased by', dataIndex: 'purchasedBy' },
          { title: 'Actions', render: (_, record) => (
            <Space>
              <Button onClick={() => setAdjustId(record.id)}>Adjust</Button>
              <Button onClick={() => setConsumeId(record.id)}>Consume</Button>
            </Space>
          ) },
        ]}
      />
      <AdjustStockModal
        open={!!adjustId}
        onCancel={() => setAdjustId(null)}
        onSubmit={(delta, reason) => {
          if (!adjustId) return
          adjustStock(adjustId, delta, reason, 'Admin')
          log('Stock adjusted', 'Admin', `${delta} (${reason}) for ${adjustId}`)
          message.success('Stock updated')
          setAdjustId(null)
        }}
      />
      <ConsumeModal
        open={!!consumeId}
        onCancel={() => setConsumeId(null)}
        onSubmit={(qty, by) => {
          if (!consumeId) return
          consume(consumeId, qty, by)
          log('Consumption logged', by, `${qty} for ${consumeId}`)
          message.success('Consumption recorded')
          setConsumeId(null)
        }}
      />
    </>
  )
}


