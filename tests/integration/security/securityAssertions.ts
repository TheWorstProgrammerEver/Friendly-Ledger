import type { SupabaseClient } from '@supabase/supabase-js'
import { expect } from 'vitest'
import { ledgerRequestIdentifiers, type LedgerRequestIdentifier } from '../../../common/ledgerRequestIdentifiers'
import type { FriendlyLedgerState } from '../../../src/types/ledger'
import { createAdminClient } from './localSupabase'
import type { SecurityFixture } from './securityFixture'
import type {
  DirectMutationCase,
  GroupExpectation,
  GroupScopedRow,
  IdRow,
  MemberRow,
  ProfileRow
} from './securityTypes'

export const ids = (rows: IdRow[]) => rows.map((row) => row.id)

export const selectRows = async <TRow>(client: SupabaseClient, table: string, columns: string) => {
  const { data, error } = await client
    .from(table)
    .select(columns)

  if (error) {
    throw new Error(`${table} select failed: ${error.message}`)
  }

  return (data ?? []) as TRow[]
}

export const invokeLedger = async (
  client: SupabaseClient,
  identifier: LedgerRequestIdentifier,
  params: unknown
) => client.functions.invoke('ledger', {
  body: {
    identifier,
    params
  }
})

export const invokeLoadLedger = async (client: SupabaseClient) => {
  const { data, error } = await invokeLedger(client, ledgerRequestIdentifiers.load, {})

  if (error) {
    throw error
  }

  return data as FriendlyLedgerState
}

export const expectAdminRow = async <TRow>(table: string, id: string, columns: string) => {
  const { data, error } = await createAdminClient()
    .from(table)
    .select(columns)
    .eq('id', id)
    .single<TRow>()

  if (error) {
    throw error
  }

  return data
}

export const expectAdminRowMissing = async (table: string, id: string) => {
  await expectNoAdminRows(table, 'id', id)
}

export const expectNoAdminRows = async (table: string, column: string, value: unknown) => {
  const { data, error } = await createAdminClient()
    .from(table)
    .select('id')
    .eq(column, value)

  if (error) {
    throw error
  }

  expect(data ?? []).toHaveLength(0)
}

export const selectAdminRows = async <TRow>(
  table: string,
  columns: string,
  column: string,
  value: unknown
) => {
  const { data, error } = await createAdminClient()
    .from(table)
    .select(columns)
    .eq(column, value)

  if (error) {
    throw error
  }

  return (data ?? []) as TRow[]
}

export const expectEntryDescription = async (entryId: string, description: string) => {
  const data = await expectAdminRow<{ description: string }>('ledger_entries', entryId, 'description')

  expect(data.description).toBe(description)
}

export const expectShortcutLabel = async (shortcutId: string, label: string) => {
  const data = await expectAdminRow<{ label: string }>('entry_shortcuts', shortcutId, 'label')

  expect(data.label).toBe(label)
}

export const expectRecurringTitle = async (recurringId: string, title: string) => {
  const data = await expectAdminRow<{ title: string }>('recurring_items', recurringId, 'title')

  expect(data.title).toBe(title)
}

export const expectInvitationExists = async (invitationId: string) => {
  const data = await expectAdminRow<IdRow>('group_invitations', invitationId, 'id')

  expect(data.id).toBe(invitationId)
}

export const expectMemberStatus = async (memberId: string, status: string, profileId: string | null) => {
  const data = await expectAdminRow<MemberRow>('group_members', memberId, 'id, group_id, profile_id, name, email, status')

  expect(data.status).toBe(status)
  expect(data.profile_id).toBe(profileId)
}

export const expectDirectMutationBlocked = async (client: SupabaseClient, mutation: DirectMutationCase) => {
  const insertResult = await client
    .from(mutation.table)
    .insert(mutation.insertPayload)
    .select('id')
  const updateResult = await client
    .from(mutation.table)
    .update(mutation.updatePayload)
    .eq('id', mutation.deleteId)
    .select('id')
  const deleteResult = await client
    .from(mutation.table)
    .delete()
    .eq('id', mutation.deleteId)
    .select('id')

  expect(ids((insertResult.data ?? []) as IdRow[]), `${mutation.table} insert`).not.toContain(mutation.insertedId)
  expect(updateResult.data ?? [], `${mutation.table} update`).toHaveLength(0)
  expect(deleteResult.data ?? [], `${mutation.table} delete`).toHaveLength(0)
  await mutation.verifyInsertBlocked()
  await mutation.verifyTargetUnchanged()
}

export const groupExpectation = (source: SecurityFixture, group: 'hidden' | 'visible'): GroupExpectation => ({
  groupId: source.groups[group],
  invitationId: source.invitations[group],
  entryId: group === 'visible' ? source.rows.visibleEntry : source.rows.hiddenEntry,
  recurringId: group === 'visible' ? source.rows.visibleRecurring : source.rows.hiddenRecurring,
  shortcutId: group === 'visible' ? source.rows.visibleShortcut : source.rows.hiddenShortcut
})

export const expectFunctionGroupAccess = async (
  client: SupabaseClient,
  accessible: GroupExpectation,
  inaccessible: GroupExpectation
) => {
  const state = await invokeLoadLedger(client)
  const groupIds = state.groups.map((group) => group.id)
  const group = state.groups.find((candidate) => candidate.id === accessible.groupId)

  expect(groupIds).toContain(accessible.groupId)
  expect(groupIds).not.toContain(inaccessible.groupId)
  expect(group).toBeDefined()
  expect(ids(group?.entries ?? [])).toContain(accessible.entryId)
  expect(ids(group?.entries ?? [])).not.toContain(inaccessible.entryId)
  expect(ids(group?.entryShortcuts ?? [])).toContain(accessible.shortcutId)
  expect(ids(group?.entryShortcuts ?? [])).not.toContain(inaccessible.shortcutId)
  expect(ids(group?.recurringItems ?? [])).toContain(accessible.recurringId)
  expect(ids(group?.recurringItems ?? [])).not.toContain(inaccessible.recurringId)
  expect(ids(group?.invitations ?? [])).toContain(accessible.invitationId)
  expect(ids(group?.invitations ?? [])).not.toContain(inaccessible.invitationId)
}

export const expectDirectGroupAccess = async (
  client: SupabaseClient,
  profileId: string,
  otherProfileIds: string[],
  accessible: GroupExpectation,
  inaccessible: GroupExpectation
) => {
  const groups = await selectRows<IdRow>(client, 'groups', 'id')
  const entries = await selectRows<GroupScopedRow>(client, 'ledger_entries', 'id, group_id')
  const shortcuts = await selectRows<GroupScopedRow>(client, 'entry_shortcuts', 'id, group_id')
  const recurringItems = await selectRows<GroupScopedRow>(client, 'recurring_items', 'id, group_id')
  const members = await selectRows<GroupScopedRow>(client, 'group_members', 'id, group_id')
  const invitations = await selectRows<GroupScopedRow>(client, 'group_invitations', 'id, group_id')
  const profiles = await selectRows<ProfileRow>(client, 'profiles', 'id, email')

  expect(ids(groups)).toContain(accessible.groupId)
  expect(ids(groups)).not.toContain(inaccessible.groupId)
  expect(ids(entries)).toContain(accessible.entryId)
  expect(ids(entries)).not.toContain(inaccessible.entryId)
  expect(ids(shortcuts)).toContain(accessible.shortcutId)
  expect(ids(shortcuts)).not.toContain(inaccessible.shortcutId)
  expect(ids(recurringItems)).toContain(accessible.recurringId)
  expect(ids(recurringItems)).not.toContain(inaccessible.recurringId)
  expect(members.map((row) => row.group_id)).toContain(accessible.groupId)
  expect(members.map((row) => row.group_id)).not.toContain(inaccessible.groupId)
  expect(ids(invitations)).toContain(accessible.invitationId)
  expect(ids(invitations)).not.toContain(inaccessible.invitationId)
  expect(ids(profiles)).toContain(profileId)

  for (const otherProfileId of otherProfileIds) {
    expect(ids(profiles)).not.toContain(otherProfileId)
  }
}
