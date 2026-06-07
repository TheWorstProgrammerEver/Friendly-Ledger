import type { Group } from '../types'
import { getEffectiveLedgerEntries } from './recurrence'

export type GroupBalance = {
  balanceCents: number
  entryCount: number
}

export const getGroupBalance = (group: Group, throughDate?: string): GroupBalance => {
  const entries = getEffectiveLedgerEntries(group, throughDate)

  return {
    balanceCents: entries.reduce((total, entry) => total + entry.amountCents, 0),
    entryCount: entries.length
  }
}
