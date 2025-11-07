import { Button, Card, Input, Space, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanning, setScanning] = useState(false)
  const [code, setCode] = useState('')

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let active = true
    if (scanning && videoRef.current) {
      reader.decodeFromVideoDevice(undefined, videoRef.current, (res) => {
        if (!active) return
        if (res) {
          setCode(res.getText())
          message.success(`Scanned: ${res.getText()}`)
        }
      })
    }
    return () => {
      active = false
      reader.reset()
    }
  }, [scanning])

  const lookup = async () => {
    if (!code) return
    try {
      const resp = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}`)
      const json = await resp.json()
      const name = json?.product?.product_name || 'Unknown product'
      message.info(name)
    } catch {
      message.error('Lookup failed')
    }
  }

  return (
    <Card title="Barcode scanner">
      <Space direction="vertical" style={{ width: '100%' }}>
        <video ref={videoRef} style={{ width: '100%', maxHeight: 360, background: '#000' }} />
        <Space>
          <Button type={scanning ? 'default' : 'primary'} onClick={() => setScanning(s => !s)}>
            {scanning ? 'Stop scanning' : 'Start scanning'}
          </Button>
          <Input value={code} onChange={e => setCode(e.target.value)} placeholder="EAN/UPC code" style={{ width: 240 }} />
          <Button onClick={lookup}>Lookup product</Button>
        </Space>
      </Space>
    </Card>
  )
}




