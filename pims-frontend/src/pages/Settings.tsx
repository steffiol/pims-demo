import { Button, Card, Form, Input, InputNumber, Select, Switch, Space, message } from 'antd'
import { useSettingsStore } from '../store/settingsStore'
import { postAnnouncement } from '../services/announcements'

export default function Settings() {
  const { settings, setSettings } = useSettingsStore()
  return (
    <Card title="Notification thresholds and recipients">
      <Form layout="vertical" onFinish={(v) => { setSettings(v); message.success('Settings saved') }} initialValues={settings}>
        <Form.Item label="Lead times (days)" name="leadTimes" rules={[{ required: true }]}>
          <Select mode="tags" tokenSeparators={[',']} placeholder="e.g. 7, 30" />
        </Form.Item>
        <Form.Item label="Recipients (emails)" name="recipients" rules={[{ required: true }]}>
          <Select mode="tags" tokenSeparators={[',']} placeholder="email@company.com" />
        </Form.Item>
        <Form.Item label="Email frequency" name="frequency">
          <Select
            options={[
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
            ]}
          />
        </Form.Item>
        <Form.Item label="Low stock threshold (absolute)" name="lowStockAbsolute">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Purchased by default name" name="purchasedByDefault">
          <Input placeholder="Admin" />
        </Form.Item>
        <Form.Item label="Enable announcement posts" name="enableAnnouncements" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item label="Announcement webhook URL" name="announcementWebhookUrl">
          <Input placeholder="https://hooks.slack.com/services/..." />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">Save settings</Button>
          <Button onClick={async () => {
            if (!settings.announcementWebhookUrl) return message.warning('Add a webhook URL')
            const res = await postAnnouncement(settings.announcementWebhookUrl, 'Test announcement from SnackWatch')
            message[res.ok ? 'success' : 'error'](res.ok ? 'Sent' : res.error || 'Failed')
          }}>Test announcement</Button>
        </Space>
      </Form>
    </Card>
  )
}


