import { Card, CardContent, Container, Stack, TextField, Typography, Button, MenuItem, Chip } from '@mui/material'
import { useAppState } from '../store'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSnackbar } from 'notistack'
import { format } from 'date-fns'

export default function EditQuantity() {
    const { state, actions } = useAppState()
    const items = useMemo(() => Object.values(state.snacks), [state.snacks])
    const [selectedSku, setSelectedSku] = useState('')
    const selected = items.find(i => i.sku === selectedSku)
    const currentQty = selected ? selected.batches.reduce((s, b) => s + b.quantity, 0) : 0
    const [newQty, setNewQty] = useState<number>(currentQty)
    const { enqueueSnackbar } = useSnackbar()
    const videoRef = useRef<HTMLVideoElement | null>(null)

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
                if (stopped) return
                const sku = result.getText()
                setSelectedSku(sku)
                const itm = items.find(x => x.sku === sku)
                setNewQty(itm ? itm.batches.reduce((s, b) => s + b.quantity, 0) : 0)
            } catch {}
        }
        run()
        return () => {
            stopped = true
            if (codeReader && typeof codeReader.reset === 'function') codeReader.reset()
            else if (codeReader && typeof codeReader.stopContinuousDecode === 'function') codeReader.stopContinuousDecode()
        }
    }, [items])

    const onUpdate = () => {
        if (!selected) return
        actions.setQuantityAbsolute({ sku: selected.sku, newQuantity: Math.max(0, newQty), reason: 'Manual edit' })
        enqueueSnackbar('Quantity updated', { variant: 'success' })
    }

    return (
		<Container maxWidth="sm" sx={{ py: 4 }}>
			<Card>
				<CardContent>
					<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Edit Snack Quantity</Typography>
					<video ref={videoRef} style={{ width: '100%', borderRadius: 12 }} muted />
					<Stack spacing={2}>
                        <TextField select label="Select snack" size="small" value={selectedSku} onChange={(e) => { setSelectedSku(e.target.value); const itm = items.find(x => x.sku === e.target.value); setNewQty(itm ? itm.batches.reduce((s, b) => s + b.quantity, 0) : 0) }}>
                            {items.map(i => (
                                <MenuItem key={i.sku} value={i.sku}>{i.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Current quantity" size="small" value={currentQty} InputProps={{ readOnly: true }} />
                        <TextField label="New quantity" type="number" size="small" value={newQty} onChange={(e) => setNewQty(Number(e.target.value))} />
                        <Button variant="contained" onClick={onUpdate} disabled={!selected}>Update</Button>
						{(state.changeLog.length > 0 && selectedSku) && (
							<Stack spacing={1} sx={{ mt: 1 }}>
								<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Change History</Typography>
								{state.changeLog.filter(c => c.sku === selectedSku).slice(0, 10).map(c => (
									<Stack key={c.id} direction="row" spacing={1} alignItems="center">
										<Chip size="small" label={c.delta > 0 ? `+${c.delta}` : `${c.delta}`} color={c.delta > 0 ? 'success' : 'warning'} />
										<Typography variant="body2">{c.reason}</Typography>
										<Typography variant="caption" color="text.secondary">{format(new Date(c.at), 'yyyy-MM-dd HH:mm')}</Typography>
									</Stack>
								))}
							</Stack>
						)}
					</Stack>
				</CardContent>
			</Card>
		</Container>
	)
}


