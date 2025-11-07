export type SnackRow = { name: string; expiry: string; purchaseDate: string; type: string; purchased: number; current: number; by: string }

export const snackRows: SnackRow[] = [
  { name: 'Milo 3-in-1 Activgo', expiry: '2026-03-22', purchaseDate: '2025-02-15', type: 'Pack', purchased: 100, current: 40, by: 'Admin' },
  { name: "Lay's Nori Seaweed", expiry: '2026-03-22', purchaseDate: '2025-02-02', type: 'Box', purchased: 30, current: 16, by: 'Admin' },
  { name: 'Oriental Super Ring Family Packets', expiry: '2027-06-14', purchaseDate: '2024-12-01', type: 'Pack', purchased: 70, current: 52, by: 'Admin' },
  { name: 'Jacob’s Cream Crackers', expiry: '2026-10-10', purchaseDate: '2025-01-08', type: 'Box', purchased: 20, current: 6, by: 'Admin' },
  { name: 'KitKat 4-Finger', expiry: '2026-05-01', purchaseDate: '2025-03-10', type: 'Pack', purchased: 50, current: 22, by: 'Admin' },
]


