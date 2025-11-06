import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AppState, SnackBatch, SnackItem, FeedbackPost, ReactionEmoji } from './models'
import type { Reaction } from './models'
import { MONTHLY_LIMIT, DEMO_COST_PER_UNIT } from './models'
import { v4 as uuid } from 'uuid'
import { format } from 'date-fns'

const STORAGE_KEY = 'snack-pantry-state'

function deepClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj)) as T
}

function monthKey(date = new Date()) {
	return format(date, 'yyyy-MM')
}

function seedState(): AppState {
	const initial: AppState = {
		snacks: {},
		budget: { monthKey: monthKey(), limit: MONTHLY_LIMIT, spent: 0 },
		changeLog: [],
	}
	const addSnack = (
		name: string,
		quantity: number,
		imageUrl?: string,
		expiry?: string,
		sku?: string,
	) => {
		const skuId = sku ?? uuid().slice(0, 8).toUpperCase()
		const batch: SnackBatch = {
			id: uuid(), sku: skuId, name, imageUrl, quantity, expiryDate: expiry, createdAt: new Date().toISOString(),
		}
		const item: SnackItem = {
			sku: skuId, name, imageUrl, batches: [batch],
			stats: { reactions: { up: 0, love: 0, neutral: 0, down: 0 }, consumedThisMonth: 0, addedThisMonth: quantity },
		}
		initial.snacks[skuId] = item
	}
	addSnack('Milo 3-in-1', 48, 'https://images.unsplash.com/photo-1587303031959-7172a18e5add?q=80&w=600')
	addSnack('KitKat Mini', 96, 'https://images.unsplash.com/photo-1599948679845-3e4b90cb0f5a?q=80&w=600')
	addSnack('Coffee Pods', 120, 'https://images.unsplash.com/photo-1459755486867-b55449bb39ff?q=80&w=600')
    addSnack('Nuts Mix', 40, 'https://images.unsplash.com/photo-1467453678174-768ec283a940?q=80&w=600')
    // No explicit "New Trial Snack" item; we'll badge items in UI instead
    initial.posts = [
        { id: uuid(), type: 'giveaway', title: 'Giveaway: KitKat Mini', description: 'Expires soon — free today!', reactions: { '❤️': 0, '👍': 0 }, comments: [{ id: uuid(), user: 'System', text: 'Enjoy while stocks last!', at: new Date().toISOString() }], at: new Date().toISOString() },
        { id: uuid(), type: 'auto-summary', title: 'Weekly Auto-Summary', description: 'Coffee Pods consumption up 34% (morning rush), Nuts Mix steady. Remember to recycle pods at the pantry bin. Budget: MYR used 1500/2000.', reactions: {}, comments: [{ id: uuid(), user: 'System', text: 'Auto-generated summary for the week.', at: new Date().toISOString() }], at: new Date().toISOString() },
    ]
	return initial
}

type Actions = {
    addOrTopUpSnack: (input: { sku?: string, name: string, imageUrl?: string, quantity: number, expiryDate?: string, unitCost?: number }) => void
    updateQuantityDelta: (input: { sku: string, delta: number, reason: string }) => void
    setQuantityAbsolute: (input: { sku: string, newQuantity: number, reason: string }) => void
    addPost: (post: Omit<FeedbackPost, 'id' | 'at'>) => void
    addComment: (postId: string, text: string) => void
    addReaction: (postId: string, emoji: ReactionEmoji) => void
    votePoll: (postId: string, option: string) => void
    addSnackReaction: (sku: string, reaction: Reaction) => void
    updateSnackReaction: (sku: string, prev: Reaction | null, next: Reaction | null) => void
}

const StateContext = createContext<{
    state: AppState
    setState: React.Dispatch<React.SetStateAction<AppState>>
    actions: Actions
} | null>(null)

export function useAppState() {
	const ctx = useContext(StateContext)
	if (!ctx) throw new Error('State not ready')
	return ctx
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<AppState>(() => {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (raw) {
			try { return JSON.parse(raw) as AppState } catch {}
		}
		return seedState()
	})

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
	}, [state])

	// One-time migrations: rename demo snack names and ensure sample posts
	useEffect(() => {
		let changed = false
		setState(s => {
			const next = deepClone(s)
			for (const [sku, item] of Object.entries(next.snacks)) {
				if (item.name === 'New Trial Snack') { next.snacks[sku].name = 'Granola Bars'; changed = true }
			}
			next.posts = next.posts ?? []
            const enableAuto = (typeof window !== 'undefined' ? localStorage.getItem('feature-auto-summary') : null) !== 'false'
            const enableGive = (typeof window !== 'undefined' ? localStorage.getItem('feature-giveaway') : null) !== 'false'
            const hasAuto = next.posts.some(p => p.type === 'auto-summary')
            const hasGive = next.posts.some(p => p.type === 'giveaway')
            if (enableAuto && !hasAuto) {
                const budgetLine = `MYR used 1500/${MONTHLY_LIMIT}`
                next.posts.unshift({ id: uuid(), type: 'auto-summary', title: 'Weekly Auto-Summary', description: `Coffee Pods consumption up 34% (morning rush), Nuts Mix steady. Remember to recycle pods at the pantry bin. Budget: ${budgetLine}.`, reactions: {}, comments: [{ id: uuid(), user: 'System', text: 'Auto-generated summary for the week.', at: new Date().toISOString() }], at: new Date().toISOString() })
                changed = true
            }
            if (enableGive && !hasGive) {
                const expiringSnack = Object.values(next.snacks).find(i => i.batches.some(b => b.expiryDate))
                let desc = 'Expires soon — free today!'
                if (expiringSnack) {
                    const earliest = expiringSnack.batches.filter(b => b.expiryDate).map(b => new Date(b.expiryDate!)).sort((a,b)=>+a-+b)[0]
                    if (earliest) desc = `Expires on ${format(earliest, 'yyyy-MM-dd')} — free today!`
                }
                next.posts.unshift({ id: uuid(), type: 'giveaway', title: `Giveaway: ${expiringSnack?.name ?? 'KitKat Mini'}`, description: desc, reactions: { '❤️': 0, '👍': 0 }, comments: [{ id: uuid(), user: 'System', text: 'Enjoy while stocks last!', at: new Date().toISOString() }], at: new Date().toISOString() })
                changed = true
            }
			return changed ? next : s
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// seed weekly auto posts (poll + summary + giveaway) once per week
	useEffect(() => {
		const weekKey = format(new Date(), 'yyyy-ww')
		const flag = localStorage.getItem(`snack-week-${weekKey}`)
		if (!flag) {
			setState(s => {
				const next = deepClone(s)
                next.posts = next.posts ?? []
                const enablePoll = (typeof window !== 'undefined' ? localStorage.getItem('feature-weekly-poll') : null) !== 'false'
                const enableAuto = (typeof window !== 'undefined' ? localStorage.getItem('feature-auto-summary') : null) !== 'false'
                const enableGive = (typeof window !== 'undefined' ? localStorage.getItem('feature-giveaway') : null) !== 'false'
                if (enablePoll) next.posts.unshift({ id: uuid(), type: 'poll', title: 'Weekly Snack Mood Poll', description: 'Sweet or Savory week?', options: ['Sweet', 'Savory'], votes: {}, reactions: { '👍': 0, '❤️': 0, '😐': 0, '👎': 0 }, comments: [], at: new Date().toISOString() })
				const almostOut = Object.values(next.snacks).find(i => i.batches.reduce((s,b)=>s+b.quantity,0) < 10)
                if (enableAuto && almostOut) {
                    const budgetLine = `MYR used 1500/${MONTHLY_LIMIT}`
                    next.posts.unshift({ id: uuid(), type: 'auto-summary', title: 'Weekly Auto-Summary', description: `Coffee Pods consumption up 34% (morning rush), Nuts Mix steady. Remember to recycle pods at the pantry bin. Budget: ${budgetLine}.`, reactions: {}, comments: [], at: new Date().toISOString() })
				}
				const expiring = Object.values(next.snacks).find(i => i.batches.some(b => b.expiryDate))
                if (enableGive && expiring) {
                    const earliest = expiring.batches.filter(b => b.expiryDate).map(b => new Date(b.expiryDate!)).sort((a,b)=>+a-+b)[0]
                    const desc = earliest ? `Expires on ${format(earliest, 'yyyy-MM-dd')} — free today!` : 'Expires soon — free today!'
                    next.posts.unshift({ id: uuid(), type: 'giveaway', title: `Giveaway: ${expiring.name}`, description: desc, reactions: { '❤️': 0, '👍': 0 }, comments: [], at: new Date().toISOString() })
				}
				return next
			})
			localStorage.setItem(`snack-week-${weekKey}`, '1')
		}
	}, [])

	useEffect(() => {
		if (state.budget.monthKey !== monthKey()) {
			setState(s => ({ ...s, budget: { monthKey: monthKey(), limit: MONTHLY_LIMIT, spent: 0 } }))
		}
	}, [state.budget.monthKey])

	const actions: Actions = useMemo(() => ({
		addOrTopUpSnack: ({ sku, name, imageUrl, quantity, expiryDate, unitCost }) => {
			setState(s => {
				const next: AppState = deepClone(s)
				const skuId = (sku && sku.trim()) || uuid().slice(0, 8).toUpperCase()
				const batch: SnackBatch = { id: uuid(), sku: skuId, name, imageUrl, quantity, expiryDate, createdAt: new Date().toISOString() }
				const existing = next.snacks[skuId]
				if (existing) {
					existing.batches.push(batch)
					existing.name = name || existing.name
					existing.imageUrl = imageUrl || existing.imageUrl
					existing.stats.addedThisMonth += quantity
				} else {
					next.snacks[skuId] = {
						sku: skuId,
						name,
						imageUrl,
						batches: [batch],
						stats: { reactions: { up: 0, love: 0, neutral: 0, down: 0 }, consumedThisMonth: 0, addedThisMonth: quantity },
					}
				}
				const cost = (unitCost ?? DEMO_COST_PER_UNIT) * quantity
				next.budget.spent += cost
				next.changeLog.unshift({ id: uuid(), at: new Date().toISOString(), sku: skuId, delta: quantity, reason: 'Top up' })
				return next
			})
		},
		updateQuantityDelta: ({ sku, delta, reason }) => {
			if (!delta) return
			setState(s => {
				const next: AppState = deepClone(s)
				const item = next.snacks[sku]
				if (!item) return next
				if (delta > 0) {
					// add quantity into a new batch without expiry
					item.batches.push({ id: uuid(), sku, name: item.name, imageUrl: item.imageUrl, quantity: delta, createdAt: new Date().toISOString() })
				} else {
					// consume from oldest batches first
					let remaining = -delta
					for (const b of item.batches) {
						if (remaining <= 0) break
						const take = Math.min(b.quantity, remaining)
						b.quantity -= take
						remaining -= take
					}
					item.stats.consumedThisMonth += -delta
					item.batches = item.batches.filter(b => b.quantity > 0)
				}
				next.changeLog.unshift({ id: uuid(), at: new Date().toISOString(), sku, delta, reason })
				return next
			})
		},
		setQuantityAbsolute: ({ sku, newQuantity, reason }) => {
			setState(s => {
				const next: AppState = deepClone(s)
				const item = next.snacks[sku]
				if (!item) return next
				const current = item.batches.reduce((sum, b) => sum + b.quantity, 0)
				const delta = newQuantity - current
				if (delta !== 0) {
					if (delta > 0) {
						item.batches.push({ id: uuid(), sku, name: item.name, imageUrl: item.imageUrl, quantity: delta, createdAt: new Date().toISOString() })
					} else {
						let remaining = -delta
						for (const b of item.batches) {
							if (remaining <= 0) break
							const take = Math.min(b.quantity, remaining)
							b.quantity -= take
							remaining -= take
						}
						item.batches = item.batches.filter(b => b.quantity > 0)
					}
					next.changeLog.unshift({ id: uuid(), at: new Date().toISOString(), sku, delta, reason })
				}
				return next
			})
		},
		addPost: (post) => {
			setState(s => {
				const next = deepClone(s)
				next.posts = next.posts ?? []
				next.posts.unshift({ id: uuid(), at: new Date().toISOString(), ...post })
				return next
			})
		},
		addComment: (postId, text) => {
			setState(s => {
				const next = deepClone(s)
				const p = next.posts?.find(p => p.id === postId)
				if (p) {
					p.comments = p.comments ?? []
					p.comments.push({ id: uuid(), user: 'You', text, at: new Date().toISOString() })
				}
				return next
			})
		},
		addReaction: (postId, emoji) => {
			setState(s => {
				const next = deepClone(s)
				const p = next.posts?.find(p => p.id === postId)
				if (p) {
					p.reactions = p.reactions ?? {}
					p.reactions[emoji] = (p.reactions[emoji] ?? 0) + 1
				}
				return next
			})
		},
		votePoll: (postId, option) => {
			setState(s => {
				const next = deepClone(s)
				const p = next.posts?.find(p => p.id === postId)
				if (p && p.options) {
					p.votes = p.votes ?? {}
					p.votes[option] = (p.votes[option] ?? 0) + 1
				}
				return next
			})
		},
        addSnackReaction: (sku, reaction) => {
            setState(s => {
                const next = deepClone(s)
                const item = next.snacks[sku]
                if (item) {
                    item.stats.reactions[reaction] = (item.stats.reactions[reaction] ?? 0) + 1
                }
                return next
            })
        },
        updateSnackReaction: (sku, prev, next) => {
            setState(s => {
                const nextState = deepClone(s)
                const item = nextState.snacks[sku]
                if (!item) return nextState
                if (prev && item.stats.reactions[prev] > 0) item.stats.reactions[prev] -= 1
                if (next) item.stats.reactions[next] = (item.stats.reactions[next] ?? 0) + 1
                return nextState
            })
        },
	}), [])

	const value = useMemo(() => ({ state, setState, actions }), [state, actions])
	return <StateContext.Provider value={value}>{children}</StateContext.Provider>
}


