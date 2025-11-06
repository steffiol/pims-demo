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
    const { state, actions } = useAppState()
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

    // When SKU changes, prefill known item details
    useEffect(() => {
        const code = sku?.replace(/\D/g, '')
        if (!code) return
        const existing = state.snacks[code] || state.snacks[sku]
        if (existing) {
            setName(existing.name || '')
            setImageUrl(existing.imageUrl || '')
        }
    }, [sku, state.snacks])

    // If not in local inventory, try fetching public product metadata by barcode with multiple fallbacks
    useEffect(() => {
        const code = sku.replace(/\D/g, '')
        if (!code || code.length < 8) return
        let aborted = false
        ;(async () => {
            try {
                let filled = false

                // 1) Open Food Facts v0
                try {
                    const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`, { headers: { 'Accept': 'application/json' } })
                    if (offRes.ok) {
                        const offData = await offRes.json()
                        if (!aborted && offData?.status === 1 && offData.product) {
                            const p = offData.product
                            const nm = p.product_name || p.generic_name
                            const img = p.image_url || p.image_front_url || p.image_small_url
                            if (nm && !name) { setName(nm); filled = true }
                            if (img && !imageUrl) { setImageUrl(img); filled = true }
                        }
                    }
                } catch {}
                if (aborted || filled) return

                // 2) Open Food Facts v2 (sometimes has data when v0 misses)
                try {
                    const off2Res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`, { headers: { 'Accept': 'application/json' } })
                    if (off2Res.ok) {
                        const off2Data = await off2Res.json()
                        const p = off2Data?.product
                        if (!aborted && p) {
                            const nm = p.product_name || p.generic_name
                            const img = p.image_url || p.image_front_url || p.image_small_url
                            if (nm && !name) { setName(nm); filled = true }
                            if (img && !imageUrl) { setImageUrl(img); filled = true }
                        }
                    }
                } catch {}
                if (aborted || filled) return

                // 3) UPCItemDB trial (limited, may be rate-limited)
                try {
                    const upcRes = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`, { headers: { 'Accept': 'application/json' } })
                    if (upcRes.ok) {
                        const upcData = await upcRes.json()
                        const itm = upcData?.items?.[0]
                        if (itm) {
                            const nm = itm.title
                            const img = (Array.isArray(itm.images) && itm.images[0]) || itm.image
                            if (nm && !name) { setName(nm); filled = true }
                            if (img && !imageUrl) { setImageUrl(img); filled = true }
                        }
                    }
                } catch {}

                if (aborted || filled) return

                // 4) BarcodeLookup (requires key) — if provided, try this rich catalog
                try {
                    // Vite convention for env keys
                    const key = (import.meta as any)?.env?.VITE_BARCODELOOKUP_KEY
                    if (key) {
                        const blRes = await fetch(`https://api.barcodelookup.com/v3/products?barcode=${code}&formatted=y&key=${key}`, { headers: { 'Accept': 'application/json' } })
                        if (blRes.ok) {
                            const blData = await blRes.json()
                            const prod = blData?.products?.[0]
                            if (prod) {
                                const nm = prod.product_name || prod.title || prod.alias
                                const img = (Array.isArray(prod.images) && prod.images[0]) || prod.image_url
                                if (nm && !name) { setName(nm); filled = true }
                                if (img && !imageUrl) { setImageUrl(img); filled = true }
                            }
                        }
                    }
                } catch {}
                if (aborted || filled) return

                // 5) UPCDatabase (requires key) — optional fallback
                try {
                    const upcdbKey = (import.meta as any)?.env?.VITE_UPCDATABASE_KEY
                    if (upcdbKey) {
                        const dbRes = await fetch(`https://api.upcdatabase.org/product/${code}/${upcdbKey}`, { headers: { 'Accept': 'application/json' } })
                        if (dbRes.ok) {
                            const dbData = await dbRes.json()
                            const nm = dbData?.title || dbData?.description
                            const img = dbData?.images?.[0]
                            if (nm && !name) { setName(nm); filled = true }
                            if (img && !imageUrl) { setImageUrl(img); filled = true }
                        }
                    }
                } catch {}

                if (aborted || filled) return

                // 6) SerpAPI fallback (Google SERP) — derive title and image
                try {
                    const serpKey = (import.meta as any)?.env?.VITE_SERPAPI_KEY
                    if (serpKey) {
                        // Organic results for title
                        const serpRes = await fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(code)}&api_key=${serpKey}`, { headers: { 'Accept': 'application/json' } })
                        if (serpRes.ok) {
                            const serpData = await serpRes.json()
                            const first = serpData?.organic_results?.[0]
                            const title = first?.title
                            if (title && !name) { setName(title); filled = true }
                        }
                        if (!filled) {
                            // Image search for a thumbnail
                            const imgRes = await fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(code)}&tbm=isch&api_key=${serpKey}`, { headers: { 'Accept': 'application/json' } })
                            if (imgRes.ok) {
                                const imgData = await imgRes.json()
                                const img = imgData?.images_results?.[0]?.thumbnail || imgData?.images_results?.[0]?.original
                                if (img && !imageUrl) { setImageUrl(img); filled = true }
                            }
                        }
                    }
                } catch {}

                if (!filled && !aborted) enqueueSnackbar('No public product data found for this barcode', { variant: 'info' })
            } catch {}
        })()
        return () => { aborted = true }
    }, [sku])

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


