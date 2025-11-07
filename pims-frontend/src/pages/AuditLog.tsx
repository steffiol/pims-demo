import { Button, Space, Table } from 'antd'
import dayjs from 'dayjs'
import { useAuditStore } from '../store/auditStore'

export default function AuditLog() {
  const { events, clear } = useAuditStore()
  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button danger onClick={clear}>Clear log</Button>
      </Space>
      <Table
        rowKey="id"
        dataSource={events}
        columns={[
          { title: 'Time', dataIndex: 'at', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
          { title: 'Actor', dataIndex: 'actor' },
          { title: 'Action', dataIndex: 'action' },
          { title: 'Details', dataIndex: 'details' },
        ]}
      />
    </>
  )
}


