import { describe, expect, it } from 'vitest'
import {
  withAddedEntry,
  withDeletedEntry,
  withInvitedMember
} from '../../../src/stores/friendlyLedgerStore/ledgerStateUpdates'
import type { FriendlyLedgerState, Group, LedgerEntry } from '../../../src/types/ledger'

const group = (id: string): Group => ({
  id,
  name: id,
  createdDate: '2026-06-13',
  members: [],
  invitations: [],
  entries: [],
  entryShortcuts: [],
  recurringItems: []
})

describe('ledgerStateUpdates', () => {
  it('projects added and deleted entries into the matching group', () => {
    const state: FriendlyLedgerState = {
      activeGroupId: 'group-a',
      pendingInvitations: [],
      groups: [group('group-a'), group('group-b')]
    }
    const entry: LedgerEntry = {
      id: 'entry-a',
      groupId: 'group-a',
      date: '2026-06-13',
      description: 'Groceries',
      category: 'Food',
      amountCents: 4500,
      source: 'manual',
      createdDate: '2026-06-13'
    }

    const withEntry = withAddedEntry(state, entry)
    const withoutEntry = withDeletedEntry(withEntry, { groupId: 'group-a', entryId: 'entry-a' })

    expect(withEntry.groups[0].entries).toEqual([entry])
    expect(withEntry.groups[1].entries).toEqual([])
    expect(withoutEntry.groups[0].entries).toEqual([])
  })

  it('projects invitation results without replacing existing group history', () => {
    const existingEntry: LedgerEntry = {
      id: 'entry-a',
      groupId: 'group-a',
      date: '2026-06-13',
      description: 'Rent',
      category: 'Rent',
      amountCents: -50000,
      source: 'manual',
      createdDate: '2026-06-13'
    }
    const state: FriendlyLedgerState = {
      pendingInvitations: [],
      groups: [{ ...group('group-a'), entries: [existingEntry] }]
    }

    const nextState = withInvitedMember(state, {
      groupId: 'group-a',
      member: {
        id: 'member-a',
        name: 'Sam',
        email: 'sam@example.com',
        status: 'invited'
      },
      invitation: {
        id: 'invitation-a',
        groupId: 'group-a',
        email: 'sam@example.com',
        invitedDate: '2026-06-13'
      }
    })

    expect(nextState.groups[0].entries).toEqual([existingEntry])
    expect(nextState.groups[0].members).toHaveLength(1)
    expect(nextState.groups[0].invitations).toHaveLength(1)
  })
})
