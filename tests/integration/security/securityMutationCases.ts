import { randomUUID } from 'node:crypto'
import { expect } from 'vitest'
import { ledgerRequestIdentifiers } from '../../../common/ledgerRequestIdentifiers'
import type { SecurityFixture } from './securityFixture'
import {
  expectAdminRow,
  expectEntryDescription,
  expectInvitationExists,
  expectMemberStatus,
  expectNoAdminRows,
  expectRecurringTitle,
  expectShortcutLabel
} from './securityAssertions'
import type { DirectMutationCase, FunctionMutationCase } from './securityTypes'

export const directMutationCases = (source: SecurityFixture): DirectMutationCase[] => {
  const directProfileId = randomUUID()
  const directGroupId = randomUUID()
  const directMemberId = randomUUID()
  const directInvitationId = randomUUID()
  const directEntryId = randomUUID()
  const directShortcutId = randomUUID()
  const directRecurringId = randomUUID()

  return [
    {
      table: 'profiles',
      insertedId: directProfileId,
      deleteId: source.users.outsider.id,
      insertPayload: {
        id: directProfileId,
        display_name: 'Direct Profile',
        email: `${source.prefix}-direct-profile@example.com`,
        created_date: '2026-06-19'
      },
      updatePayload: {
        display_name: 'Tampered Profile'
      },
      verifyInsertBlocked: () => expectNoAdminRows('profiles', 'id', directProfileId),
      verifyTargetUnchanged: async () => {
        const profile = await expectAdminRow<{ display_name: string }>('profiles', source.users.outsider.id, 'display_name')

        expect(profile.display_name).toBe(source.users.outsider.name)
      }
    },
    {
      table: 'groups',
      insertedId: directGroupId,
      deleteId: source.groups.hidden,
      insertPayload: {
        id: directGroupId,
        name: `${source.prefix} direct hidden group`,
        created_by_profile_id: source.users.outsider.id,
        created_date: '2026-06-19'
      },
      updatePayload: {
        name: 'Tampered hidden group'
      },
      verifyInsertBlocked: () => expectNoAdminRows('groups', 'id', directGroupId),
      verifyTargetUnchanged: async () => {
        const group = await expectAdminRow<{ name: string }>('groups', source.groups.hidden, 'name')

        expect(group.name).toBe(`${source.prefix} hidden group`)
      }
    },
    {
      table: 'group_members',
      insertedId: directMemberId,
      deleteId: source.rows.hiddenMember,
      insertPayload: {
        id: directMemberId,
        group_id: source.groups.hidden,
        name: 'Direct Hidden Member',
        email: `${source.prefix}-direct-member@example.com`,
        status: 'invited',
        created_date: '2026-06-19'
      },
      updatePayload: {
        name: 'Tampered Hidden Member'
      },
      verifyInsertBlocked: () => expectNoAdminRows('group_members', 'id', directMemberId),
      verifyTargetUnchanged: () => expectMemberStatus(source.rows.hiddenMember, 'active', source.users.outsider.id)
    },
    {
      table: 'group_invitations',
      insertedId: directInvitationId,
      deleteId: source.invitations.hidden,
      insertPayload: {
        id: directInvitationId,
        group_id: source.groups.hidden,
        group_name: `${source.prefix} hidden group`,
        email: `${source.prefix}-direct-invitee@example.com`,
        invited_date: '2026-06-19'
      },
      updatePayload: {
        group_name: 'Tampered hidden invitation'
      },
      verifyInsertBlocked: () => expectNoAdminRows('group_invitations', 'id', directInvitationId),
      verifyTargetUnchanged: () => expectInvitationExists(source.invitations.hidden)
    },
    {
      table: 'ledger_entries',
      insertedId: directEntryId,
      deleteId: source.rows.hiddenEntry,
      insertPayload: {
        id: directEntryId,
        group_id: source.groups.hidden,
        entry_date: '2026-06-19',
        description: 'Direct hidden entry',
        category: 'Security',
        amount_cents: 300,
        created_by_profile_id: source.users.owner.id,
        created_by_name: source.users.owner.name,
        created_date: '2026-06-19'
      },
      updatePayload: {
        description: 'Tampered hidden entry'
      },
      verifyInsertBlocked: () => expectNoAdminRows('ledger_entries', 'id', directEntryId),
      verifyTargetUnchanged: () => expectEntryDescription(source.rows.hiddenEntry, 'Hidden entry')
    },
    {
      table: 'entry_shortcuts',
      insertedId: directShortcutId,
      deleteId: source.rows.hiddenShortcut,
      insertPayload: {
        id: directShortcutId,
        group_id: source.groups.hidden,
        label: 'Direct hidden shortcut',
        emoji: 'S',
        description: 'Direct hidden shortcut entry',
        category: 'Security',
        effect: 'positive',
        default_amount_cents: 300,
        created_date: '2026-06-19'
      },
      updatePayload: {
        label: 'Tampered hidden shortcut'
      },
      verifyInsertBlocked: () => expectNoAdminRows('entry_shortcuts', 'id', directShortcutId),
      verifyTargetUnchanged: () => expectShortcutLabel(source.rows.hiddenShortcut, 'Hidden shortcut')
    },
    {
      table: 'recurring_items',
      insertedId: directRecurringId,
      deleteId: source.rows.hiddenRecurring,
      insertPayload: {
        id: directRecurringId,
        group_id: source.groups.hidden,
        title: 'Direct hidden recurring',
        category: 'Security',
        amount_cents: -300,
        frequency: 'weekly',
        start_date: '2026-06-19',
        active: true,
        created_date: '2026-06-19'
      },
      updatePayload: {
        title: 'Tampered hidden recurring'
      },
      verifyInsertBlocked: () => expectNoAdminRows('recurring_items', 'id', directRecurringId),
      verifyTargetUnchanged: () => expectRecurringTitle(source.rows.hiddenRecurring, 'Hidden recurring')
    }
  ]
}

export const functionMutationCases = (source: SecurityFixture): FunctionMutationCase[] => {
  const directInviteEmail = `${source.prefix}-function-invitee@example.com`

  return [
    {
      identifier: ledgerRequestIdentifiers.addEntry,
      shouldError: true,
      params: {
        groupId: source.groups.hidden,
        input: {
          date: '2026-06-19',
          description: 'Function hidden entry',
          category: 'Security',
          amountCents: 300
        }
      },
      verifyUnchanged: () => expectNoAdminRows('ledger_entries', 'description', 'Function hidden entry')
    },
    {
      identifier: ledgerRequestIdentifiers.deleteEntry,
      shouldError: false,
      params: {
        groupId: source.groups.hidden,
        entryId: source.rows.hiddenEntry
      },
      verifyUnchanged: () => expectEntryDescription(source.rows.hiddenEntry, 'Hidden entry')
    },
    {
      identifier: ledgerRequestIdentifiers.addEntryShortcut,
      shouldError: true,
      params: {
        groupId: source.groups.hidden,
        input: {
          label: 'Function hidden shortcut',
          emoji: 'S',
          description: 'Function hidden shortcut entry',
          category: 'Security',
          effect: 'positive',
          defaultAmountCents: 300
        }
      },
      verifyUnchanged: () => expectNoAdminRows('entry_shortcuts', 'label', 'Function hidden shortcut')
    },
    {
      identifier: ledgerRequestIdentifiers.deleteEntryShortcut,
      shouldError: false,
      params: {
        groupId: source.groups.hidden,
        shortcutId: source.rows.hiddenShortcut
      },
      verifyUnchanged: () => expectShortcutLabel(source.rows.hiddenShortcut, 'Hidden shortcut')
    },
    {
      identifier: ledgerRequestIdentifiers.addRecurringItem,
      shouldError: true,
      params: {
        groupId: source.groups.hidden,
        input: {
          title: 'Function hidden recurring',
          category: 'Security',
          amountCents: -300,
          frequency: 'weekly',
          startDate: '2026-06-19'
        }
      },
      verifyUnchanged: () => expectNoAdminRows('recurring_items', 'title', 'Function hidden recurring')
    },
    {
      identifier: ledgerRequestIdentifiers.updateRecurringItem,
      shouldError: true,
      params: {
        groupId: source.groups.hidden,
        itemId: source.rows.hiddenRecurring,
        input: {
          title: 'Tampered hidden recurring',
          category: 'Security',
          amountCents: -300,
          frequency: 'weekly',
          startDate: '2026-06-19'
        }
      },
      verifyUnchanged: () => expectRecurringTitle(source.rows.hiddenRecurring, 'Hidden recurring')
    },
    {
      identifier: ledgerRequestIdentifiers.deleteRecurringItem,
      shouldError: false,
      params: {
        groupId: source.groups.hidden,
        itemId: source.rows.hiddenRecurring
      },
      verifyUnchanged: () => expectRecurringTitle(source.rows.hiddenRecurring, 'Hidden recurring')
    },
    {
      identifier: ledgerRequestIdentifiers.inviteMember,
      shouldError: true,
      params: {
        groupId: source.groups.hidden,
        email: directInviteEmail
      },
      verifyUnchanged: async () => {
        await expectNoAdminRows('group_members', 'email', directInviteEmail)
        await expectNoAdminRows('group_invitations', 'email', directInviteEmail)
      }
    },
    {
      identifier: ledgerRequestIdentifiers.acceptInvitation,
      shouldError: true,
      params: {
        invitationId: source.invitations.hidden
      },
      verifyUnchanged: async () => {
        await expectInvitationExists(source.invitations.hidden)
        await expectMemberStatus(source.rows.hiddenMember, 'active', source.users.outsider.id)
      }
    },
    {
      identifier: ledgerRequestIdentifiers.rejectInvitation,
      shouldError: true,
      params: {
        invitationId: source.invitations.hidden
      },
      verifyUnchanged: () => expectInvitationExists(source.invitations.hidden)
    }
  ]
}
