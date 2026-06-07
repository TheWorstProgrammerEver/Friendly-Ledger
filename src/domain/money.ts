export const parseMoneyToCents = (value: string) => {
  const normalized = value.replace(/[$,\s]/g, '')
  const amount = Number(normalized)

  if (!Number.isFinite(amount)) {
    return 0
  }

  return Math.round(Math.abs(amount) * 100)
}

export const formatMoney = (amountCents: number) => {
  const sign = amountCents < 0 ? '-' : ''
  const dollars = Math.abs(amountCents) / 100

  return `${sign}$${dollars.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}
