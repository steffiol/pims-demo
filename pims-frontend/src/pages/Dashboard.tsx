import { Button, Card, Col, Input, Modal, Row, Space, Statistic, Tabs, Table, Tag, message } from 'antd'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useSnacksStore } from '../store/snacksStore'
import { useSettingsStore } from '../store/settingsStore'
import { computeExpiring, composeEmailBody } from '../services/notifications'
import { postAnnouncement } from '../services/announcements'
import { useNotificationsStore } from '../store/notificationsStore'
import { useAuditStore } from '../store/auditStore'

export default function Dashboard() {
  const [query, setQuery] = useState('')
  const snacks = useSnacksStore(s => s.snacks)
  const settings = useSettingsStore(s => s.settings)
  const { log } = useAuditStore()
  const [emailPreview, setEmailPreview] = useState<string | null>(null)
  const addNotification = useNotificationsStore(s => s.add)
  const filtered = useMemo(
    () => snacks.filter(s => s.name.toLowerCase().includes(query.toLowerCase())),
    [snacks, query],
  )

  const soonToExpire = filtered.filter(s => dayjs(s.dateOfExpiry).diff(dayjs(), 'day') <= 14)
  const lowStock = filtered.filter(s => s.currentStock <= Math.max(5, Math.ceil(s.stockPurchased * 0.1)))
  const recentlyAdded = filtered.filter(s => dayjs().diff(dayjs(s.dateOfPurchase), 'day') <= 7)

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Low stock" value={lowStock.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Soon to expire" value={soonToExpire.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Recently added" value={recentlyAdded.length} />
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 16 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Tabs
              items={[
                { key: 'all', label: 'All' },
                { key: 'low', label: 'Low stock' },
                { key: 'expiring', label: 'Soon to expire' },
                { key: 'recent', label: 'Recently added' },
              ]}
            />
          </Col>
          <Col>
            <Space>
              <Input.Search placeholder="Search snacks" allowClear onChange={e => setQuery(e.target.value)} />
              <Button onClick={() => {
                const exp = computeExpiring(snacks, settings.leadTimes)
                const body = composeEmailBody(exp)
                setEmailPreview(body || 'No items to notify')
              }}>Preview email</Button>
              <Button type="primary" onClick={() => {
                const exp = computeExpiring(snacks, settings.leadTimes)
                const body = composeEmailBody(exp)
                setEmailPreview(body || 'No items to notify')
                log('Expiry email queued', 'System', `${settings.recipients.join(',')}`)
              }}>Send batch email</Button>
            </Space>
          </Col>
        </Row>
        <Table
          rowKey="id"
          dataSource={filtered}
          columns={[
            { title: 'Snack name', dataIndex: 'name' },
            {
              title: 'Expiry date',
              dataIndex: 'dateOfExpiry',
              render: (v: string) => {
                const days = dayjs(v).diff(dayjs(), 'day')
                const color = days <= 7 ? 'red' : days <= 30 ? 'orange' : 'green'
                return <Tag color={color}>{dayjs(v).format('YYYY-MM-DD')} ({days}d)</Tag>
              },
            },
            { title: 'Date of purchase', dataIndex: 'dateOfPurchase', render: (v: string) => dayjs(v).format('YYYY-MM-DD') },
            { title: 'Stock type', dataIndex: 'stockType' },
            { title: 'Purchase quantity', dataIndex: 'stockPurchased' },
            { title: 'Current remaining', dataIndex: 'currentStock' },
            { title: 'Purchased by', dataIndex: 'purchasedBy' },
          ]}
        />
      </Card>
      <Modal
        title="Email preview"
        open={emailPreview !== null}
        onCancel={() => setEmailPreview(null)}
        onOk={() => setEmailPreview(null)}
      >
        <pre style={{ whiteSpace: 'pre-wrap' }}>{emailPreview || ''}</pre>
      </Modal>
      <Space style={{ marginTop: 12 }}>
        <Button onClick={async () => {
          if (!settings.enableAnnouncements || !settings.announcementWebhookUrl) {
            return message.warning('Announcements disabled or webhook missing')
          }
          const exp = computeExpiring(snacks, settings.leadTimes)
          const body = composeEmailBody(exp)
          if (!body) return message.info('No items to announce')
          const res = await postAnnouncement(settings.announcementWebhookUrl!, `SnackWatch expiry alert:\n${body}`)
          if (res.ok) {
            addNotification({ kind: 'announcement', title: 'Expiry announcement posted', message: 'Webhook delivered' })
            message.success('Announcement posted')
          } else {
            message.error(res.error || 'Failed to post')
          }
        }}>Post announcement</Button>
      </Space>
    </>
  )
}


