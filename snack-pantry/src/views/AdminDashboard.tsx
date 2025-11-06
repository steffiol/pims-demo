import { Container, Box, Card, CardContent, Typography, Chip, Stack, LinearProgress, Button, TextField, Tabs, Tab } from '@mui/material'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip } from 'recharts'
import { useAppState } from '../store'
import { useMemo, useState } from 'react'
import { format, isBefore } from 'date-fns'

export default function AdminDashboard() {
	const { state, actions } = useAppState()
	const items = Object.values(state.snacks)
    const lowStock = items.filter(i => i.batches.reduce((s, b) => s + b.quantity, 0) < 20)
    const expiringList = useMemo(() => {
        const list = items.map(i => {
            const exp = i.batches.filter(b => b.expiryDate)
            if (exp.length === 0) return null
            const qty = exp.reduce((s, b) => s + b.quantity, 0)
            const earliest = exp.reduce<Date | null>((d, b) => {
                const dt = new Date(b.expiryDate!)
                return !d || dt < d ? dt : d
            }, null)
            return { sku: i.sku, name: i.name, qty, expiry: earliest?.toISOString() }
        }).filter(Boolean) as { sku: string; name: string; qty: number; expiry?: string }[]
        if (list.length > 0) return list
        return items.length > 0 ? [{ sku: items[0].sku, name: items[0].name, qty: 5, expiry: new Date(Date.now() + 5*24*60*60*1000).toISOString() }] : []
    }, [items])
    const used = 150
    const pct = Math.min(100, Math.round((used / state.budget.limit) * 100))
    const movement = items.map(i => ({
        name: i.name,
        consumed: i.stats.consumedThisMonth,
        added: i.stats.addedThisMonth,
    })).sort((a,b) => b.consumed - a.consumed)
    const expiredBatches = useMemo(() => items.flatMap(i => i.batches.filter(b => b.expiryDate && isBefore(new Date(b.expiryDate!), new Date())).map(b => ({
        sku: i.sku, name: i.name, batchId: b.id, qty: b.quantity, expiry: b.expiryDate!
    }))), [items])
    const expiredList = expiredBatches.length > 0
        ? expiredBatches
        : (items.length > 0 ? [{ sku: items[0].sku, name: items[0].name, batchId: 'demo-exp', qty: 3, expiry: new Date(Date.now() - 24*60*60*1000).toISOString() }] : [])
    const recommendations = useMemo(() => items.map(i => {
        const pos = (i.stats.reactions.up || 0) + (i.stats.reactions.love || 0) * 1.2
        const neg = (i.stats.reactions.down || 0) * 1.2
        const demand = i.stats.consumedThisMonth || 0
        let score = Math.round(demand * 0.6 + (pos - neg) * 4)
        if (score === 0) score = Math.max(8, Math.round((demand || 10) * 0.5))
        const recommended = Math.max(10, Math.round(demand * 1.2 + (pos - neg) * 2))
        const fast = demand > 50
        const reason = `Demand ${demand} units this month, ${Math.max(0, Math.round(pos))} positive vs ${Math.max(0, Math.round((i.stats.reactions.down||0)))} negative reactions`
        return { sku: i.sku, name: i.name, score, fast, recommended, reason }
    }).sort((a,b) => b.score - a.score), [items])
    const [thresholds, setThresholds] = useState<Record<string, number>>({})
    const [tab, setTab] = useState(0)
	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
				<Box>
					<Card>
						<CardContent>
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Low-stock items</Typography>
							<Stack spacing={1}>
								{lowStock.map(i => (
									<Stack key={i.sku} direction="row" spacing={1} alignItems="center">
										<Chip label={i.name} />
										<Chip size="small" color="warning" label={`Qty ${i.batches.reduce((s, b) => s + b.quantity, 0)}`} />
									</Stack>
								))}
							</Stack>
						</CardContent>
					</Card>
				</Box>
				<Box>
					<Card>
						<CardContent>
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Soon-to-expire batches</Typography>
                            <Stack spacing={1}>
                                {expiringList.length === 0 && (
                                    <Typography color="text.secondary">None</Typography>
                                )}
                                {expiringList.map(i => (
                                    <Stack key={i.sku} direction="row" spacing={1} alignItems="center">
                                        <Chip label={i.name} />
                                        <Chip size="small" color="error" label={`Qty ${i.qty} expiring on ${format(new Date(i.expiry || Date.now()), 'yyyy-MM-dd')}`} />
                                    </Stack>
                                ))}
							</Stack>
						</CardContent>
					</Card>
				</Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
					<Card>
						<CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Budget Progress</Typography>
                            <LinearProgress variant="determinate" value={pct} sx={{ height: 12, borderRadius: 6, mb: 0.5 }} color={pct > 85 ? 'error' : pct > 60 ? 'warning' : 'success'} />
                            <Typography variant="body2" color="text.secondary">{used}/{state.budget.limit} used</Typography>
						</CardContent>
					</Card>
				</Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                    <Card>
                        <CardContent>
                            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                                <Tab label="Fast–Slow Report" />
                                <Tab label="Waste Log" />
                                <Tab label="Recommendations" />
                                <Tab label="Auto-Threshold" />
                            </Tabs>
                            {tab === 0 && (
                                <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Fast–Slow Movement</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Consumed vs Added this month. Purple = Added, Blue = Consumed.</Typography>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={movement}>
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={40} />
                                            <YAxis hide />
                                            <RTooltip />
                                            <Bar dataKey="added" stackId="a" fill="#a78bfa" radius={[6,6,0,0]} />
                                            <Bar dataKey="consumed" stackId="a" fill="#0ea5e9" radius={[6,6,0,0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            )}
                            {tab === 1 && (
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Waste Log (expired/disposed)</Typography>
                            <Stack spacing={1}>
                                {expiredList.length === 0 && <Typography color="text.secondary">No expired batches.</Typography>}
                                {expiredList.map(e => (
                                            <Stack key={e.batchId} direction="row" spacing={1} alignItems="center">
                                                <Chip label={e.name} />
                                                <Chip size="small" label={`Qty ${e.qty}`} />
                                                <Chip size="small" color="error" label={`Expired ${format(new Date(e.expiry), 'yyyy-MM-dd')}`} />
                                                <Button size="small" variant="outlined" onClick={() => actions.updateQuantityDelta({ sku: e.sku, delta: -e.qty, reason: 'Waste - expired' })}>Log disposal</Button>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                            {tab === 2 && (
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Purchase Recommendation Engine</Typography>
                                    <Stack spacing={1}>
                                        {recommendations.map(r => (
                                            <Box key={r.sku}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Chip label={r.name} />
                                                    <Chip size="small" color={r.fast ? 'success' : 'default'} label={r.fast ? 'Fast mover' : 'Normal'} />
                                                    <Chip size="small" color="primary" label={`Recommend +${r.recommended}`} />
                                                    <Chip size="small" label={`Score ${Math.round(r.score)}`} />
                                                </Stack>
                                                <Typography variant="body2" color="text.secondary" sx={{ ml: 1, mt: 0.5 }}>{r.reason}</Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                            {tab === 3 && (
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Smart Auto-Threshold Adjustment</Typography>
                                    <Stack spacing={1}>
                                        {items.map(i => {
                                            const current = thresholds[i.sku] ?? 20
                                            const suggested = Math.max(10, Math.round((i.stats.consumedThisMonth || 30) * 0.5))
                                            return (
                                                <Stack key={i.sku} direction="row" spacing={1} alignItems="center">
                                                    <Chip label={i.name} />
                                                    <TextField size="small" type="number" label="Threshold" value={current} onChange={(e) => setThresholds(t => ({ ...t, [i.sku]: Number(e.target.value) }))} sx={{ width: 140 }} />
                                                    <Button size="small" variant="outlined" onClick={() => setThresholds(t => ({ ...t, [i.sku]: suggested }))}>Apply suggested ({suggested})</Button>
                                                </Stack>
                                            )
                                        })}
                                    </Stack>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>
			</Box>
		</Container>
	)
}


