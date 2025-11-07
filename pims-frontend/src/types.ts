export type StockType = 'box' | 'packs'

export type Snack = {
  id: string
  name: string
  dateOfPurchase: string // ISO
  dateOfExpiry: string // ISO
  stockType: StockType
  stockPurchased: number
  currentStock: number
  purchasedBy: string
  barcode?: string
}

export type StockAdjustment = {
  id: string
  snackId: string
  delta: number // positive for increment, negative for decrement
  reason: 'purchase' | 'correction' | 'waste' | 'other'
  at: string
  actor: string
}

export type Consumption = {
  id: string
  snackId: string
  quantity: number
  by: string
  at: string
}

export type NotificationSettings = {
  leadTimes: number[] // e.g., [7, 30]
  recipients: string[]
  frequency: 'daily' | 'weekly'
  lowStockAbsolute?: number
  enableAnnouncements?: boolean
  announcementWebhookUrl?: string
}

export type Role = 'admin' | 'staff'

export type AuditEvent = {
  id: string
  at: string
  actor: string
  action: string
  details?: string
}

export type InAppNotification = {
  id: string
  at: string
  kind: 'expiry' | 'stock' | 'import' | 'report' | 'announcement'
  title: string
  message: string
  read?: boolean
}


