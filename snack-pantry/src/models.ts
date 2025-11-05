export type Reaction = 'up' | 'love' | 'neutral' | 'down'

export interface SnackBatch {
	id: string
	sku: string
	name: string
	imageUrl?: string
	quantity: number
	expiryDate?: string
	createdAt: string
}

export interface SnackStats {
	reactions: Record<Reaction, number>
	consumedThisMonth: number
	addedThisMonth: number
}

export interface SnackItem {
	sku: string
	name: string
	imageUrl?: string
	batches: SnackBatch[]
	stats: SnackStats
	doNotBuy?: boolean
}

export interface Budget {
	monthKey: string
	limit: number
	spent: number
}

export interface AppState {
	snacks: Record<string, SnackItem>
	budget: Budget
	changeLog: { id: string, at: string, sku: string, delta: number, reason: string }[]
	posts?: FeedbackPost[]
}

export const MONTHLY_LIMIT = 2000
export const DEMO_COST_PER_UNIT = 2.5

export type ReactionEmoji = '👍' | '❤️' | '😐' | '👎'

export interface FeedbackComment {
	id: string
	user: string
	text: string
	at: string
}

export interface FeedbackPost {
	id: string
	type: 'request' | 'poll' | 'auto-summary' | 'giveaway'
	title: string
	description?: string
	options?: string[]
	votes?: Record<string, number>
	reactions?: Partial<Record<ReactionEmoji, number>>
	comments?: FeedbackComment[]
	at: string
}


