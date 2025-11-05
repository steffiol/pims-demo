import { Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useAppState } from '../store'
import { useSnackbar } from 'notistack'

export default function PantryStation() {
	const scannerRef = useRef<HTMLDivElement | null>(null)
    const [scanned, setScanned] = useState<string>('')
	const [qty, setQty] = useState<number>(1)
    const { actions } = useAppState()
    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        let scanner: any
        (async () => {
            if (!scannerRef.current) return
            try {
                const { Html5QrcodeScanner } = await import('html5-qrcode')
                scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false)
                scanner.render(
                    (decoded: string) => { setScanned(decoded); scanner.clear() },
                    () => {},
                    { facingMode: 'environment' }
                )
            } catch {}
        })()
        return () => { if (scanner && scanner.clear) scanner.clear().catch(() => {}) }
    }, [])

    const onDone = () => {
        if (!scanned.trim()) return
        actions.updateQuantityDelta({ sku: scanned.trim(), delta: -Math.max(1, qty), reason: 'Pantry QR take' })
        setScanned(''); setQty(1)
        enqueueSnackbar('Enjoy your snack! Logged successfully.', { variant: 'success' })
    }

    return (
		<Container maxWidth="sm" sx={{ py: 4 }}>
			<Card>
				<CardContent>
					<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>QR "Take Snack" Station</Typography>
					<Box id="qr-reader" ref={scannerRef} />
					<Stack direction="row" spacing={2} sx={{ mt: 2 }}>
						<TextField label="SKU" value={scanned} fullWidth size="small" />
						<TextField label="Qty" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} size="small" sx={{ width: 120 }} />
                        <Button variant="contained" onClick={onDone}>Done</Button>
					</Stack>
				</CardContent>
			</Card>
		</Container>
	)
}


