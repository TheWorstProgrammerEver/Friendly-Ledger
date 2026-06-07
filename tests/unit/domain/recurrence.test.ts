import { describe, expect, it } from 'vitest'
import { getEffectiveLedgerEntries, getRecurringDates } from '../../../src/domain/recurrence'
import type { Group, RecurringItem } from '../../../src/types'

const item: RecurringItem = {
  id: 'recurring_1',
  groupId: 'group_1',
  title: 'Weekly contribution',
  category: 'Rent',
  amountCents: 50000,
  frequency: 'weekly',
  startDate: '2026-06-01',
  endDate: '2026-06-15',
  active: true,
  createdDate: '2026-06-01'
}

const group: Group = {
  id: 'group_1',
  name: 'House',
  createdDate: '2026-06-01',
  invitations: [],
  members: [
    { id: 'member_ryan', accountId: 'account_ryan', name: 'Ryan', email: 'ryan@example.com', status: 'active' },
    { id: 'member_sam', name: 'Sam', email: 'sam@example.com', status: 'active' }
  ],
  entries: [],
  recurringItems: [item]
}

describe('recurrence helpers', () => {
  it('finds implicit dates through the rule end date', () => {
    expect(getRecurringDates(item, '2026-06-30')).toEqual([
      '2026-06-01',
      '2026-06-08',
      '2026-06-15'
    ])
  })

  it('expands rules into virtual ledger entries without stored rows', () => {
    expect(group.entries).toHaveLength(0)
    expect(getEffectiveLedgerEntries(group, '2026-06-16')).toMatchObject([
      { date: '2026-06-15', source: 'recurring', recurringItemId: 'recurring_1' },
      { date: '2026-06-08', source: 'recurring', recurringItemId: 'recurring_1' },
      { date: '2026-06-01', source: 'recurring', recurringItemId: 'recurring_1' }
    ])
  })
})
