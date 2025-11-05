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
        let codeReader: any
        let stopped = false
        async function run() {
            try {
                const { BrowserMultiFormatReader } = await import('@zxing/browser')
                codeReader = new BrowserMultiFormatReader()
                if (!videoRef.current) return
                // Pass undefined deviceId to trigger permission prompt and use default camera
                const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoRef.current)
                if (!stopped && result) { setSku(result.getText()); setScanOpen(false) }
            } catch (e) {
                // ignore; user may deny permission
            }
        }
        run()
        return () => { 
            stopped = true
            if (codeReader && typeof codeReader.reset === 'function') codeReader.reset()
            else if (codeReader && typeof codeReader.stopContinuousDecode === 'function') codeReader.stopContinuousDecode()
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


