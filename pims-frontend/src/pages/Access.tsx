import { Card, Radio } from 'antd'
import { useSettingsStore } from '../store/settingsStore'

export default function Access() {
  const { role, setRole } = useSettingsStore()
  return (
    <Card title="Role selection">
      <Radio.Group value={role} onChange={(e) => setRole(e.target.value)}>
        <Radio.Button value="admin">Admin</Radio.Button>
        <Radio.Button value="staff">Staff</Radio.Button>
      </Radio.Group>
    </Card>
  )
}


