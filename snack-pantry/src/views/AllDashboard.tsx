import { Avatar, Box, Card, CardContent, Chip, Container, LinearProgress, Stack, Typography } from '@mui/material'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip } from 'recharts'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral'
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import { useAppState } from '../store'

// 

function sentimentScore(reactions: { up: number, love: number, neutral: number, down: number }) {
	const total = reactions.up + reactions.love + reactions.neutral + reactions.down
	if (!total) return 0
	return Math.round(((reactions.up + reactions.love * 1.3) - reactions.down * 1.2) / total * 100)
}

export default function AllDashboard() {
	const { state } = useAppState()
	const items = Object.values(state.snacks)
	const leaderboard = [...items].sort((a, b) => sentimentScore(b.stats.reactions) - sentimentScore(a.stats.reactions)).slice(0, 5)
	const consumption = items.map(i => ({ name: i.name, consumed: i.stats.consumedThisMonth || Math.round((i.batches[0]?.quantity ?? 0) * 0.2) }))
	const budgetPct = Math.min(100, Math.round((state.budget.spent / state.budget.limit) * 100))

    const hasData = items.length > 0
    return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
				<Box>
					<Card>
						<CardContent>
							<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>Stock Levels</Typography>
								<Chip size="small" color="secondary" icon={<NewReleasesIcon />} label="New Trial Snack" />
							</Stack>
                            {!hasData && (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No snacks yet</Typography>
                                    <Typography color="text.secondary">Ask an admin to top up snacks to get started 🎉</Typography>
                                </Box>
                            )}
                            <Stack spacing={2}>
								{items.map(item => {
									const totalQty = item.batches.reduce((s, b) => s + b.quantity, 0)
									const consumptionRate = item.stats.consumedThisMonth
									const color = consumptionRate > 80 ? 'error' : consumptionRate > 40 ? 'warning' : 'success'
									return (
										<Stack key={item.sku} direction="row" alignItems="center" spacing={2}>
                                        <Avatar variant="rounded" src={item.imageUrl} alt={item.name} sx={{ width: 40, height: 40 }} />
											<Box sx={{ flexGrow: 1 }}>
												<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                                            <LinearProgress variant="determinate" value={Math.min(100, (totalQty / 150) * 100)} color={color as any} sx={{ height: 10, borderRadius: 5, mt: 0.5 }} />
											</Box>
											<Chip size="small" label={`${totalQty}`} />
										</Stack>
									)
								})}
							</Stack>
						</CardContent>
					</Card>
				</Box>
				<Box>
					<Card sx={{ mb: 3 }}>
						<CardContent>
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Snack Mood Reaction</Typography>
							<Stack direction="row" spacing={2}>
								<Chip icon={<ThumbUpAltIcon />} label="👍" />
								<Chip icon={<FavoriteIcon />} label="❤️" color="secondary" />
								<Chip icon={<SentimentNeutralIcon />} label="😐" />
								<Chip icon={<ThumbDownAltIcon />} label="👎" />
							</Stack>
						</CardContent>
					</Card>
					<Card>
						<CardContent>
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Budget Progress (MYR {state.budget.limit})</Typography>
							<LinearProgress variant="determinate" value={budgetPct} sx={{ height: 10, borderRadius: 5, mb: 1 }} color={budgetPct > 85 ? 'error' : budgetPct > 60 ? 'warning' : 'success'} />
							<Typography variant="body2" color="text.secondary">{budgetPct}% used</Typography>
						</CardContent>
					</Card>
				</Box>
				<Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
					<Box>
					<Card>
						<CardContent>
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Top 5 Most Loved Snacks This Month</Typography>
							<Stack spacing={1}>
								{leaderboard.map((i, idx) => (
									<Stack key={i.sku} direction="row" spacing={2} alignItems="center">
										<Chip label={`#${idx + 1}`} />
										<Avatar src={i.imageUrl} variant="rounded" />
										<Typography sx={{ flexGrow: 1 }}>{i.name}</Typography>
										<Chip color="success" label={`${sentimentScore(i.stats.reactions)} SS`} />
									</Stack>
								))}
							</Stack>
						</CardContent>
					</Card>
					</Box>
					<Box>
                    <Card>
						<CardContent>
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Fast–Slow Movement</Typography>
                            {typeof window !== 'undefined' && (window as any).ResizeObserver ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={consumption}>
                                        <XAxis dataKey="name" hide />
                                        <YAxis hide />
                                        <RTooltip />
                                        <Bar dataKey="consumed" fill="#0ea5e9" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={700} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Typography color="text.secondary">Chart unavailable on this browser.</Typography>
                            )}
						</CardContent>
					</Card>
					</Box>
				</Box>
			</Box>
		</Container>
	)
}


