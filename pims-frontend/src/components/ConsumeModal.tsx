import { Modal, Form, InputNumber, Input } from 'antd'
import { useEffect } from 'react'

type Props = {
  open: boolean
  onCancel: () => void
  onSubmit: (quantity: number, by: string) => void
}

export function ConsumeModal({ open, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm()
  useEffect(() => { if (!open) form.resetFields() }, [open])
  return (
    <Modal
      open={open}
      title="Log consumption"
      okText="Log"
      onOk={() => form.submit()}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical" onFinish={(v) => onSubmit(v.quantity, v.by)} initialValues={{ quantity: 1 }}>
        <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}> 
          <InputNumber style={{ width: '100%' }} min={1} />
        </Form.Item>
        <Form.Item label="By (name)" name="by" rules={[{ required: true }]}> 
          <Input placeholder="Your name" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ConsumeModal




