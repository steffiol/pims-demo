import { Modal, Form, InputNumber, Select } from 'antd'
import { useEffect } from 'react'

type Props = {
  open: boolean
  onCancel: () => void
  onSubmit: (delta: number, reason: 'purchase' | 'correction' | 'waste' | 'other') => void
}

export function AdjustStockModal({ open, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm()
  useEffect(() => { if (!open) form.resetFields() }, [open])
  return (
    <Modal
      open={open}
      title="Adjust stock"
      okText="Apply"
      onOk={() => form.submit()}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical" onFinish={(v) => onSubmit(v.delta, v.reason)} initialValues={{ delta: 1, reason: 'correction' }}>
        <Form.Item label="Change amount (+/-)" name="delta" rules={[{ required: true }]}> 
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Reason" name="reason" rules={[{ required: true }]}> 
          <Select options={[
            { value: 'purchase', label: 'Purchase' },
            { value: 'correction', label: 'Correction' },
            { value: 'waste', label: 'Waste' },
            { value: 'other', label: 'Other' },
          ]} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AdjustStockModal




