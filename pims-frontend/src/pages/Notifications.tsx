import { Badge, Button, List, Space, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { useNotificationsStore } from '../store/notificationsStore'

export default function Notifications() {
  const { notifications, markRead, clear } = useNotificationsStore()
  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Badge count={notifications.filter(n => !n.read).length}>
          <Typography.Title level={4} style={{ margin: 0 }}>In‑app Notifications</Typography.Title>
        </Badge>
        <Button onClick={clear}>Clear</Button>
      </Space>
      <List
        dataSource={notifications}
        renderItem={(n) => (
          <List.Item
            actions={[<Button key="read" type="link" onClick={() => markRead(n.id)}>{n.read ? 'Read' : 'Mark read'}</Button>]}
          >
            <List.Item.Meta
              title={<Space>
                <Tag>{n.kind}</Tag>
                <span>{n.title}</span>
              </Space>}
              description={`${dayjs(n.at).format('YYYY-MM-DD HH:mm')} — ${n.message}`}
            />
          </List.Item>
        )}
      />
    </>
  )
}




