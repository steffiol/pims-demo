import { Button, Card, CardContent, Container, Typography, Stack } from '@mui/material'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useRef } from 'react'
import { useAppState } from '../store'
import { format } from 'date-fns'

export default function MonthlyReport() {
	const ref = useRef<HTMLDivElement | null>(null)
    const { state } = useAppState()
    const items = Object.values(state.snacks)
    const lowStock = items.filter(i => i.batches.reduce((s,b)=>s+b.quantity,0) < 20)
    const expiring = items.flatMap(i => i.batches.filter(b => b.expiryDate).map(b => ({ name: i.name, expiry: b.expiryDate! })))
    const balance = items.map(i => ({ name: i.name, qty: i.batches.reduce((s,b)=>s+b.quantity,0) }))
    const doNotBuy = items.filter(i => i.doNotBuy)
    const forecast = items.map(i => ({ name: i.name, nextQty: Math.max(10, Math.round((i.stats.consumedThisMonth || 30) * 1.2)) }))
	const exportPdf = async () => {
		if (!ref.current) return
		const canvas = await html2canvas(ref.current)
		const imgData = canvas.toDataURL('image/png')
		const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
		const width = pdf.internal.pageSize.getWidth()
		const height = (canvas.height * width) / canvas.width
		pdf.addImage(imgData, 'PNG', 0, 0, width, height)
		pdf.save('Pantry-Monthly-Report.pdf')
	}
	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Card>
				<CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Monthly Report</Typography>
                    <div ref={ref}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Inventory Balance</Typography>
                        <Stack spacing={0.5} sx={{ mb: 2 }}>
                            {balance.map(b => (<Typography key={b.name}>{b.name}: {b.qty}</Typography>))}
                        </Stack>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Expiry Alerts</Typography>
                        <Stack spacing={0.5} sx={{ mb: 2 }}>
                            {expiring.length === 0 ? <Typography color="text.secondary">None</Typography> : expiring.map(e => (<Typography key={e.name+e.expiry}>{e.name} expires {format(new Date(e.expiry), 'yyyy-MM-dd')}</Typography>))}
                        </Stack>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Low-stock Reminders</Typography>
                        <Stack spacing={0.5} sx={{ mb: 2 }}>
                            {lowStock.length === 0 ? <Typography color="text.secondary">None</Typography> : lowStock.map(i => (<Typography key={i.sku}>{i.name}</Typography>))}
                        </Stack>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Purchase Recommendations</Typography>
                        <Stack spacing={0.5} sx={{ mb: 2 }}>
                            {forecast.map(f => (<Typography key={f.name}>{f.name}: next month estimate {f.nextQty}</Typography>))}
                        </Stack>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Do Not Buy</Typography>
                        <Stack spacing={0.5} sx={{ mb: 2 }}>
                            {doNotBuy.length === 0 ? <Typography color="text.secondary">None</Typography> : doNotBuy.map(i => (<Typography key={i.sku}>{i.name}</Typography>))}
                        </Stack>
                    </div>
					<Button variant="contained" sx={{ mt: 2 }} onClick={exportPdf}>Export PDF</Button>
				</CardContent>
			</Card>
		</Container>
	)
}


