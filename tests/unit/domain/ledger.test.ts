import { describe, expect, it } from 'vitest'
import { getGroupBalance } from '../../../src/domain/ledger'
import type { Group } from '../../../src/types/ledger'

const group: Group = {
  id: 'group_1',
  name: 'Ryan Rent',
  createdDate: '2026-06-01',
  invitations: [],
  recurringItems: [],
  members: [
    { id: 'member_ryan', accountId: 'account_ryan', name: 'Ryan', email: 'ryan@example.com', status: 'active' },
    { id: 'member_ronald', name: 'Ronald', email: 'ronald@example.com', status: 'active' }
  ],
  entries: [
    {
      id: 'entry_1',
      groupId: 'group_1',
      date: '2026-06-01',
      description: 'Car insurance',
      category: 'Insurance',
      amountCents: 550000,
      source: 'manual',
      createdDate: '2026-06-01'
    },
    {
      id: 'entry_2',
      groupId: 'group_1',
      date: '2026-06-02',
      description: 'Rent',
      category: 'Rent',
      amountCents: -500000,
      source: 'manual',
      createdDate: '2026-06-02'
    }
  ]
}

describe('group balance', () => {
  it('sums signed ledger entries', () => {
    expect(getGroupBalance(group)).toEqual({
      balanceCents: 50000
    })
  })

  it('only counts manual entries through the provided date', () => {
    expect(getGroupBalance(group, '2026-06-01')).toEqual({
      balanceCents: 550000
    })
  })

  it('includes implicit recurring entries through the provided date', () => {
    const groupWithRent: Group = {
      ...group,
      entries: [],
      recurringItems: [
        {
          id: 'recurring_1',
          groupId: 'group_1',
          title: 'Rent',
          category: 'Rent',
          amountCents: -50000,
          frequency: 'weekly',
          startDate: '2026-06-01',
          active: true,
          createdDate: '2026-06-01'
        }
      ]
    }

    expect(getGroupBalance(groupWithRent, '2026-06-16')).toEqual({
      balanceCents: -150000
    })
  })
})
