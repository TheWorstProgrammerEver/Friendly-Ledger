import type { RecurringFrequency } from '../types'

const pad = (value: number) => value.toString().padStart(2, '0')

export const toLocalIsoDate = (date: Date) => (
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
)

export const todayIso = () => toLocalIsoDate(new Date())

const fromIso = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number)

  return new Date(Date.UTC(year, month - 1, day))
}

const toUtcIsoDate = (date: Date) => (
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
)

const addDays = (isoDate: string, days: number) => {
  const date = fromIso(isoDate)
  date.setUTCDate(date.getUTCDate() + days)

  return toUtcIsoDate(date)
}

const addMonths = (isoDate: string, months: number) => {
  const date = fromIso(isoDate)
  const day = date.getUTCDate()
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1))
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate()

  target.setUTCDate(Math.min(day, lastDay))

  return toUtcIsoDate(target)
}

export const advanceDate = (isoDate: string, frequency: RecurringFrequency) => {
  if (frequency === 'weekly') {
    return addDays(isoDate, 7)
  }

  if (frequency === 'fortnightly') {
    return addDays(isoDate, 14)
  }

  return addMonths(isoDate, 1)
}
