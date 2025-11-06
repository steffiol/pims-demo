import { Container, Box, Card, CardContent, Typography, Chip, Stack, LinearProgress } from '@mui/material'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip } from 'recharts'
import { useAppState } from '../store'

export default function AdminDashboard() {
	const { state } = useAppState()
	const items = Object.values(state.snacks)
	const lowStock = items.filter(i => i.batches.reduce((s, b) => s + b.quantity, 0) < 20)
	const expiringSoon = items.filter(i => i.batches.some(b => b.expiryDate))
    const used = 150
    const pct = Math.min(100, Math.round((used / state.budget.limit) * 100))
    const movement = items.map(i => ({
        name: i.name,
        consumed: i.stats.consumedThisMonth,
        added: i.stats.addedThisMonth,
    })).sort((a,b) => b.consumed - a.consumed)
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
								{expiringSoon.map(i => (
									<Stack key={i.sku} direction="row" spacing={1} alignItems="center">
										<Chip label={i.name} />
										<Chip size="small" color="error" label={`Expiring`} />
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
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Fast–Slow Movement</Typography>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={movement}>
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={40} />
                                    <YAxis hide />
                                    <RTooltip />
                                    <Bar dataKey="consumed" stackId="a" fill="#0ea5e9" radius={[6,6,0,0]} />
                                    <Bar dataKey="added" stackId="a" fill="#a78bfa" radius={[6,6,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Box>
			</Box>
		</Container>
	)
}


