import { Button, Card, CardContent, Container, Stack, TextField, Typography, InputAdornment, IconButton } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
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

    const [scanOpen, setScanOpen] = useState(false)
    useEffect(() => {
        if (!scanOpen) return
        let reader: any
        let controls: any
        let stopped = false
        async function run() {
            try {
                const { BrowserMultiFormatReader } = await import('@zxing/browser')
                const { BarcodeFormat, DecodeHintType } = await import('@zxing/library')
                const hints = new Map()
                hints.set(DecodeHintType.POSSIBLE_FORMATS, [
                    BarcodeFormat.EAN_13,
                    BarcodeFormat.EAN_8,
                    BarcodeFormat.UPC_A,
                    BarcodeFormat.UPC_E,
                    BarcodeFormat.CODE_128,
                    BarcodeFormat.CODE_39,
                    BarcodeFormat.ITF,
                    BarcodeFormat.QR_CODE,
                ])
                reader = new BrowserMultiFormatReader(hints)
                if (!videoRef.current) return
                // Try default device first (prompts permissions); fall back to first device if available
                const devices = await BrowserMultiFormatReader.listVideoInputDevices().catch(() => [])
                const deviceId = devices?.[0]?.deviceId
                controls = await reader.decodeFromVideoDevice(deviceId ?? undefined, videoRef.current, (result: any) => {
                    if (!result || stopped) return
                    setSku(result.getText())
                    stopped = true
                    setScanOpen(false)
                    if (controls && typeof controls.stop === 'function') controls.stop()
                })
            } catch {}
        }
        run()
        return () => {
            stopped = true
            if (controls && typeof controls.stop === 'function') controls.stop()
            if (reader && typeof reader.reset === 'function') reader.reset()
        }
    }, [scanOpen])

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
                    {scanOpen && <video ref={videoRef} style={{ width: '100%', borderRadius: 12 }} muted playsInline />}
					<Stack spacing={2} sx={{ mt: 2 }}>
						<TextField label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} size="small" fullWidth 
							InputProps={{ endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={() => setScanOpen(true)}>
										<CameraAltIcon />
									</IconButton>
								</InputAdornment>
							) }}
						/>
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


