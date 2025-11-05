import { Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { useAppState } from '../store'
import { useSnackbar } from 'notistack'

export default function TopUp() {
	const videoRef = useRef<HTMLVideoElement | null>(null)
	const [sku, setSku] = useState('')
	const [name, setName] = useState('')
    const [qty, setQty] = useState(10)
	const [expiry, setExpiry] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const { actions } = useAppState()
    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        let codeReader: any
		let stopped = false
		async function run() {
			try {
                const { BrowserMultiFormatReader } = await import('@zxing/browser')
                codeReader = new BrowserMultiFormatReader()
                const devices = await BrowserMultiFormatReader.listVideoInputDevices()
				const deviceId = devices[0]?.deviceId
				if (!deviceId || !videoRef.current) return
				const result = await codeReader.decodeOnceFromVideoDevice(deviceId, videoRef.current)
				if (!stopped) setSku(result.getText())
			} catch {}
		}
		run()
        return () => { 
            stopped = true
            if (codeReader && typeof codeReader.reset === 'function') codeReader.reset()
            else if (codeReader && typeof codeReader.stopContinuousDecode === 'function') codeReader.stopContinuousDecode()
        }
	}, [])

    const generateSku = () => setSku(uuid().slice(0, 8).toUpperCase())

    const submit = () => {
        if (!name.trim()) return
        actions.addOrTopUpSnack({ sku, name, imageUrl, quantity: Math.max(0, qty), expiryDate: expiry })
        setSku(''); setName(''); setImageUrl(''); setQty(10); setExpiry('')
        enqueueSnackbar('Snack topped up successfully', { variant: 'success' })
    }

    return (
		<Container maxWidth="sm" sx={{ py: 4 }}>
			<Card>
				<CardContent>
					<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Top Up Snacks</Typography>
					<video ref={videoRef} style={{ width: '100%', borderRadius: 12 }} muted />
					<Stack spacing={2} sx={{ mt: 2 }}>
                        <Stack direction="row" spacing={1}>
                            <TextField label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} size="small" fullWidth />
                            <Button onClick={generateSku} variant="outlined">Random</Button>
                        </Stack>
						<TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} size="small" />
                        <TextField label="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} size="small" />
						<TextField label="Quantity" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} size="small" />
						<TextField label="Expiry Date" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
                        <Button variant="contained" onClick={submit}>Add to Stock</Button>
					</Stack>
				</CardContent>
			</Card>
		</Container>
	)
}


