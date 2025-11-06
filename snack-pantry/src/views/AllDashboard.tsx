import { Avatar, Box, Card, CardContent, Chip, Container, LinearProgress, Stack, Typography, IconButton, Button } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral'
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useAppState } from '../store'
import { useMemo, useState } from 'react'

// 

function sentimentScore(reactions: { up: number, love: number, neutral: number, down: number }) {
	const total = reactions.up + reactions.love + reactions.neutral + reactions.down
	if (!total) return 0
	return Math.round(((reactions.up + reactions.love * 1.3) - reactions.down * 1.2) / total * 100)
}

export default function AllDashboard() {
	const { state } = useAppState()
	const items = Object.values(state.snacks)
    const role = (typeof window !== 'undefined' ? (localStorage.getItem('role') as string) : 'employee') || 'employee'
    const trialSku = useMemo(() => {
        if (items.length === 0) return undefined
        const saved = (typeof window !== 'undefined') ? localStorage.getItem('new-trial-sku') : null
        if (saved && items.find(i => i.sku === saved)) return saved
        const random = items[Math.floor(Math.random() * items.length)]?.sku
        if (random && typeof window !== 'undefined') localStorage.setItem('new-trial-sku', random)
        return random
    }, [items])
    const leaderboard = [...items].sort((a, b) => sentimentScore(b.stats.reactions) - sentimentScore(a.stats.reactions)).slice(0, 5)
	const [carouselIndex, setCarouselIndex] = useState(0)

    const hasData = items.length > 0
    return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
				<Box>
					<Card>
						<CardContent>
							<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>Stock Levels</Typography>
							</Stack>
                            {!hasData && (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No snacks yet</Typography>
                                    <Typography color="text.secondary">Ask an admin to top up snacks to get started 🎉</Typography>
                                </Box>
                            )}
                            <Stack spacing={2} sx={{ overflow: 'visible' }}>
                                {items.map((item) => {
									const totalQty = item.batches.reduce((s, b) => s + b.quantity, 0)
									const consumptionRate = item.stats.consumedThisMonth
									const color = consumptionRate > 80 ? 'error' : consumptionRate > 40 ? 'warning' : 'success'
									return (
										<Stack key={item.sku} direction="row" alignItems="center" spacing={2}>
                                        <Box sx={{ position: 'relative', overflow: 'visible' }}>
                                            <Avatar variant="rounded" src={item.imageUrl} alt={item.name} sx={{ width: 40, height: 40 }} />
                                        </Box>
											<Box sx={{ flexGrow: 1 }}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                                                    {trialSku === item.sku && (<Chip size="small" color="secondary" label="New Trial Snack" />)}
                                                </Stack>
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
							{items.length > 0 && (
								<Box sx={{ position: 'relative' }}>
									<IconButton size="small" onClick={() => setCarouselIndex(i => Math.max(0, i - 1))} disabled={carouselIndex === 0}
										sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
										<ChevronLeftIcon />
									</IconButton>
									<IconButton size="small" onClick={() => setCarouselIndex(i => Math.min(items.length - 1, i + 1))} disabled={carouselIndex === items.length - 1}
										sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
										<ChevronRightIcon />
									</IconButton>
									<Box sx={{ px: 6 }}>
										<SnackTile item={items[carouselIndex]} />
									</Box>
								</Box>
							)}
						</CardContent>
					</Card>
                    {/* Budget Progress card moved to Admin screens only */}
				</Box>
                <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: { xs: '1fr' }, gap: 3 }}>
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
                                        {role === 'admin' && (<Chip color="success" label={`Score ${sentimentScore(i.stats.reactions)}`} />)}
									</Stack>
								))}
							</Stack>
						</CardContent>
					</Card>
					</Box>
				</Box>
			</Box>
		</Container>
	)
}

function SnackTile({ item }: { item: { sku: string; name: string; imageUrl?: string } }) {
	return (
		<Card>
			<CardContent>
				<Stack spacing={1}>
					<Avatar variant="rounded" src={item.imageUrl} alt={item.name} sx={{ width: '100%', height: 140, borderRadius: 2 }} />
					<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
					<ReactionButtons sku={item.sku} />
				</Stack>
			</CardContent>
		</Card>
	)
}

function ReactionButtons({ sku }: { sku: string }) {
    const { actions } = useAppState()
    const [selected, setSelected] = useState<'up' | 'love' | 'neutral' | 'down' | null>(null)
    const toggle = (r: 'up' | 'love' | 'neutral' | 'down') => {
        const next = selected === r ? null : r
        actions.updateSnackReaction(sku, selected, next)
        setSelected(next)
    }
    return (
        <Stack direction="row" spacing={1}>
            <Button size="small" variant={selected === 'up' ? 'contained' : 'outlined'} onClick={() => toggle('up')}><ThumbUpAltIcon fontSize="small" /></Button>
            <Button size="small" color="secondary" variant={selected === 'love' ? 'contained' : 'outlined'} onClick={() => toggle('love')}><FavoriteIcon fontSize="small" /></Button>
            <Button size="small" variant={selected === 'neutral' ? 'contained' : 'outlined'} onClick={() => toggle('neutral')}><SentimentNeutralIcon fontSize="small" /></Button>
            <Button size="small" variant={selected === 'down' ? 'contained' : 'outlined'} onClick={() => toggle('down')}><ThumbDownAltIcon fontSize="small" /></Button>
        </Stack>
    )
}


