export function getExpiryDays(): number {
  const v = localStorage.getItem('expiryDays')
  const n = v ? parseInt(v, 10) : NaN
  return Number.isFinite(n) ? n : 30
}

export function setExpiryDays(n: number) {
  localStorage.setItem('expiryDays', String(n))
}


