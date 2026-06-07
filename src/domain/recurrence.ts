import type { Group, LedgerEntry, RecurringItem } from '../types'
import { advanceDate } from './date'

const getLastOccurrenceDate = (item: RecurringItem, throughDate: string) => {
  if (!item.endDate) {
    return throughDate
  }

  return item.endDate < throughDate ? item.endDate : throughDate
}

export const getRecurringDates = (item: RecurringItem, throughDate: string) => {
  const dates: string[] = []
  const lastDate = getLastOccurrenceDate(item, throughDate)
  let occurrenceDate = item.startDate

  while (item.active && occurrenceDate <= lastDate && dates.length < 600) {
    dates.push(occurrenceDate)
    occurrenceDate = advanceDate(occurrenceDate, item.frequency)
  }

  return dates
}

export const getRecurringLedgerEntries = (group: Group, throughDate: string): LedgerEntry[] => (
  group.recurringItems.flatMap((item) => getRecurringDates(item, throughDate).map((date) => ({
    id: `${item.id}:${date}`,
    groupId: group.id,
    date,
    description: item.title,
    category: item.category,
    amountCents: item.amountCents,
    source: 'recurring' as const,
    recurringItemId: item.id,
    createdDate: item.createdDate
  })))
)

export const getEffectiveLedgerEntries = (group: Group, throughDate?: string): LedgerEntry[] => {
  const manualEntries = throughDate
    ? group.entries.filter((entry) => entry.date <= throughDate)
    : group.entries
  const recurringEntries = throughDate ? getRecurringLedgerEntries(group, throughDate) : []

  return [...manualEntries, ...recurringEntries]
    .sort((left, right) => right.date.localeCompare(left.date) || right.createdDate.localeCompare(left.createdDate))
}
