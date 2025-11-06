import { Container, Card, CardContent, Typography, Stack, Chip, TextField, Button, Box, LinearProgress, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { useAppState } from '../store'
import { useState } from 'react'

export default function Feedback() {
	const { state, actions } = useAppState()
	const [newTitle, setNewTitle] = useState('')
	const [newDesc, setNewDesc] = useState('')
    const [type, setType] = useState<'request' | 'poll'>('request')
    const [optionsCsv, setOptionsCsv] = useState('Yes,No')
    const role = (typeof window !== 'undefined' ? (localStorage.getItem('role') as string) : 'employee') || 'employee'
    const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
	const posts = state.posts ?? []

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Stack spacing={3}>
                <Card>
					<CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Interactive Suggestion Portal</Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                            <Chip label="Weekly Snack Mood Poll" color="secondary" />
                            <Chip label="Auto-summary enabled" />
                            <Chip label="Giveaway Mode active when expiring" color="success" />
                        </Stack>
                        {role === 'admin' && (
                            <>
                                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                    <ToggleButtonGroup exclusive size="small" value={type} onChange={(_, v) => v && setType(v)}>
                                        <ToggleButton value="request">Request</ToggleButton>
                                        <ToggleButton value="poll">Poll</ToggleButton>
                                    </ToggleButtonGroup>
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                    <TextField size="small" label={type === 'poll' ? 'Poll title' : 'Request title'} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} fullWidth />
                                    <TextField size="small" label={type === 'poll' ? 'Options (comma separated)' : 'Description'} value={type === 'poll' ? optionsCsv : newDesc} onChange={(e) => type === 'poll' ? setOptionsCsv(e.target.value) : setNewDesc(e.target.value)} fullWidth />
                                    <Button variant="contained" onClick={() => { 
                                        if (!newTitle.trim()) return; 
                                        if (type === 'poll') { const options = optionsCsv.split(',').map(s => s.trim()).filter(Boolean); actions.addPost({ type: 'poll', title: newTitle.trim(), options }) }
                                        else { actions.addPost({ type: 'request', title: newTitle.trim(), description: newDesc.trim() }) }
                                        setNewTitle(''); setNewDesc(''); setOptionsCsv('Yes,No')
                                    }}>Post</Button>
                                </Stack>
                            </>
                        )}
					</CardContent>
				</Card>

				{posts.map(p => {
					const totalVotes = p.options?.reduce((s, o) => s + (p.votes?.[o] ?? 0), 0) ?? 0
					return (
						<Card key={p.id}>
							<CardContent>
								<Stack spacing={1}>
									<Stack direction="row" spacing={1} alignItems="center">
										<Chip size="small" label={p.type} />
										<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{p.title}</Typography>
									</Stack>
									{p.description && <Typography color="text.secondary">{p.description}</Typography>}
									{p.options && (
										<Stack spacing={1} sx={{ mt: 1 }}>
											{p.options.map(o => {
												const count = p.votes?.[o] ?? 0
												const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0
												return (
													<Box key={o}>
														<Stack direction="row" spacing={1} alignItems="center">
															<Button size="small" variant="outlined" onClick={() => actions.votePoll(p.id, o)}>{o}</Button>
															<Typography variant="body2" color="text.secondary">{count} votes</Typography>
														</Stack>
														<LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
													</Box>
												)
											})}
										</Stack>
									)}
									<Stack direction="row" spacing={1}>
										<Button size="small" onClick={() => actions.addReaction(p.id, '👍')}>👍 {p.reactions?.['👍'] ?? 0}</Button>
										<Button size="small" onClick={() => actions.addReaction(p.id, '❤️')}>❤️ {p.reactions?.['❤️'] ?? 0}</Button>
										<Button size="small" onClick={() => actions.addReaction(p.id, '😐')}>😐 {p.reactions?.['😐'] ?? 0}</Button>
										<Button size="small" onClick={() => actions.addReaction(p.id, '👎')}>👎 {p.reactions?.['👎'] ?? 0}</Button>
									</Stack>
                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                        <TextField size="small" placeholder="Add a comment" fullWidth value={commentDrafts[p.id] ?? ''} onChange={(e) => setCommentDrafts(d => ({ ...d, [p.id]: e.target.value }))} />
                                        <Button size="small" variant="outlined" onClick={() => { const v = (commentDrafts[p.id] ?? '').trim(); if (v) { actions.addComment(p.id, v); setCommentDrafts(d => ({ ...d, [p.id]: '' })) } }}>Comment</Button>
                                    </Stack>
									{(p.comments?.length ?? 0) > 0 && (
										<Stack sx={{ mt: 1 }} spacing={0.5}>
											{p.comments!.map(c => (
												<Typography key={c.id} variant="body2"><b>{c.user}:</b> {c.text}</Typography>
											))}
										</Stack>
									)}
								</Stack>
							</CardContent>
						</Card>
					)
				})}
			</Stack>
		</Container>
	)
}


