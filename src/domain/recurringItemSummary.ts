import type { RecurringItem } from '../types/ledger'
import { formatMoney } from './money'

export const recurringItemSummary = (item: RecurringItem) => (
  `${formatMoney(item.amountCents)} ${item.frequency}, from ${item.startDate}${item.endDate ? ` to ${item.endDate}` : ''}`
)
