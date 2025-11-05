import { Box, Card, CardContent, Container, Tab, Tabs, Typography, Stack, Button, Chip, TextField } from '@mui/material'
import { useState, useMemo } from 'react'
import { useAppState } from '../store'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip } from 'recharts'
import { format, isBefore } from 'date-fns'

export default function ConsumptionLog() {
    const [tab, setTab] = useState(0)
    const { state, actions } = useAppState()
    const items = Object.values(state.snacks)

    const movement = useMemo(() => items.map(i => ({
        name: i.name,
        consumed: i.stats.consumedThisMonth,
        added: i.stats.addedThisMonth,
    })).sort((a,b) => b.consumed - a.consumed), [items])

    const expiredBatches = useMemo(() => items.flatMap(i => i.batches.filter(b => b.expiryDate && isBefore(new Date(b.expiryDate!), new Date())).map(b => ({
        sku: i.sku, name: i.name, batchId: b.id, qty: b.quantity, expiry: b.expiryDate!
    }))), [items])

    const recommendations = useMemo(() => items.map(i => {
        const score = (i.stats.reactions.up + i.stats.reactions.love * 1.3) - i.stats.reactions.down * 1.2
        const fast = i.stats.consumedThisMonth > 50
        return { sku: i.sku, name: i.name, score, fast }
    }).sort((a,b) => b.score - a.score), [items])

    const [thresholds, setThresholds] = useState<Record<string, number>>({})

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Fast–Slow Report" />
                <Tab label="Waste Log" />
                <Tab label="Recommendations" />
                <Tab label="Auto-Threshold" />
            </Tabs>
            <Card>
                <CardContent>
                    {tab === 0 && (
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Fast–Slow Movement</Typography>
                            <ResponsiveContainer width="100%" height={300}>
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
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Waste Log (expired/disposed)</Typography>
                            <Stack spacing={1}>
                                {expiredBatches.length === 0 && <Typography color="text.secondary">No expired batches.</Typography>}
                                {expiredBatches.map(e => (
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
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Purchase Recommendation Engine</Typography>
                            <Stack spacing={1}>
                                {recommendations.map(r => (
                                    <Stack key={r.sku} direction="row" spacing={1} alignItems="center">
                                        <Chip label={r.name} />
                                        <Chip size="small" color={r.fast ? 'success' : 'default'} label={r.fast ? 'Fast mover' : 'Normal'} />
                                        <Chip size="small" label={`Score ${Math.round(r.score)}`} />
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                    )}
                    {tab === 3 && (
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Smart Auto-Threshold Adjustment</Typography>
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
        </Container>
    )
}


