import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { expect } from 'vitest'
import { ledgerRequestIdentifiers } from '../../../common/ledgerRequestIdentifiers'
import {
  expectAdminRow,
  expectAdminRowMissing,
  expectEntryDescription,
  expectInvitationExists,
  expectMemberStatus,
  expectNoAdminRows,
  expectRecurringTitle,
  expectShortcutLabel,
  invokeLedger,
  selectAdminRows
} from './securityAssertions'
import type { SecurityFixture } from './securityFixture'
import type { IdRow, MemberRow } from './securityTypes'

const today = '2026-06-19'

const expectSuccessfulMutation = (result: { error: { message?: string } | null }) => {
  expect(result.error?.message).toBeUndefined()
}

export const expectDirectAllowedWritesWork = async (
  ownerClient: SupabaseClient,
  profilelessClient: SupabaseClient,
  source: SecurityFixture
) => {
  const { groups, prefix, users } = source
  const directGroupId = randomUUID()
  const directGroupMemberId = randomUUID()
  const directMemberId = randomUUID()
  const directInvitationId = randomUUID()
  const directEntryId = randomUUID()
  const directShortcutId = randomUUID()
  const directRecurringId = randomUUID()
  const originalVisibleGroupName = `${prefix} visible group`
  const updatedVisibleGroupName = `${prefix} visible group updated`

  expectSuccessfulMutation(await profilelessClient
    .from('profiles')
    .insert({
      id: users.profileless.id,
      display_name: 'Direct Positive Profile',
      email: users.profileless.email,
      created_date: today
    }))
  expectSuccessfulMutation(await profilelessClient
    .from('profiles')
    .update({ display_name: 'Direct Positive Profile Updated' })
    .eq('id', users.profileless.id))

  const profile = await expectAdminRow<{ display_name: string }>('profiles', users.profileless.id, 'display_name')
  expect(profile.display_name).toBe('Direct Positive Profile Updated')

  expectSuccessfulMutation(await ownerClient
    .from('groups')
    .insert({
      id: directGroupId,
      name: `${prefix} direct created group`,
      created_by_profile_id: users.owner.id,
      created_date: today
    }))
  await expectAdminRow<IdRow>('groups', directGroupId, 'id')

  expectSuccessfulMutation(await ownerClient
    .from('group_members')
    .insert({
      id: directGroupMemberId,
      group_id: directGroupId,
      profile_id: users.owner.id,
      name: users.owner.name,
      email: users.owner.email,
      status: 'active',
      created_date: today
    }))
  await expectAdminRow<IdRow>('group_members', directGroupMemberId, 'id')

  expectSuccessfulMutation(await ownerClient
    .from('groups')
    .update({ name: updatedVisibleGroupName })
    .eq('id', groups.visible))
  const updatedGroup = await expectAdminRow<{ name: string }>('groups', groups.visible, 'name')
  expect(updatedGroup.name).toBe(updatedVisibleGroupName)

  expectSuccessfulMutation(await ownerClient
    .from('groups')
    .update({ name: originalVisibleGroupName })
    .eq('id', groups.visible))

  expectSuccessfulMutation(await ownerClient
    .from('groups')
    .delete()
    .eq('id', directGroupId))
  await expectAdminRowMissing('groups', directGroupId)

  expectSuccessfulMutation(await ownerClient
    .from('group_members')
    .insert({
      id: directMemberId,
      group_id: groups.visible,
      name: 'Direct Positive Member',
      email: `${prefix}-direct-positive-member@example.com`,
      status: 'invited',
      created_date: today
    }))
  expectSuccessfulMutation(await ownerClient
    .from('group_members')
    .update({ name: 'Direct Positive Member Updated' })
    .eq('id', directMemberId))

  const updatedMember = await expectAdminRow<{ name: string }>('group_members', directMemberId, 'name')
  expect(updatedMember.name).toBe('Direct Positive Member Updated')

  expectSuccessfulMutation(await ownerClient
    .from('group_members')
    .delete()
    .eq('id', directMemberId))
  await expectAdminRowMissing('group_members', directMemberId)

  expectSuccessfulMutation(await ownerClient
    .from('group_invitations')
    .insert({
      id: directInvitationId,
      group_id: groups.visible,
      group_name: originalVisibleGroupName,
      email: `${prefix}-direct-positive-invitee@example.com`,
      invited_date: today
    }))
  await expectInvitationExists(directInvitationId)

  expectSuccessfulMutation(await ownerClient
    .from('group_invitations')
    .delete()
    .eq('id', directInvitationId))
  await expectAdminRowMissing('group_invitations', directInvitationId)

  expectSuccessfulMutation(await ownerClient
    .from('ledger_entries')
    .insert({
      id: directEntryId,
      group_id: groups.visible,
      entry_date: today,
      description: 'Direct positive entry',
      category: 'Security',
      amount_cents: 300,
      created_by_profile_id: users.owner.id,
      created_by_name: users.owner.name,
      created_date: today
    }))
  expectSuccessfulMutation(await ownerClient
    .from('ledger_entries')
    .update({ description: 'Direct positive entry updated' })
    .eq('id', directEntryId))
  await expectEntryDescription(directEntryId, 'Direct positive entry updated')

  expectSuccessfulMutation(await ownerClient
    .from('ledger_entries')
    .delete()
    .eq('id', directEntryId))
  await expectAdminRowMissing('ledger_entries', directEntryId)

  expectSuccessfulMutation(await ownerClient
    .from('entry_shortcuts')
    .insert({
      id: directShortcutId,
      group_id: groups.visible,
      label: 'Direct positive shortcut',
      emoji: 'S',
      description: 'Direct positive shortcut entry',
      category: 'Security',
      effect: 'positive',
      default_amount_cents: 300,
      created_date: today
    }))
  expectSuccessfulMutation(await ownerClient
    .from('entry_shortcuts')
    .update({ label: 'Direct positive shortcut updated' })
    .eq('id', directShortcutId))
  await expectShortcutLabel(directShortcutId, 'Direct positive shortcut updated')

  expectSuccessfulMutation(await ownerClient
    .from('entry_shortcuts')
    .delete()
    .eq('id', directShortcutId))
  await expectAdminRowMissing('entry_shortcuts', directShortcutId)

  expectSuccessfulMutation(await ownerClient
    .from('recurring_items')
    .insert({
      id: directRecurringId,
      group_id: groups.visible,
      title: 'Direct positive recurring',
      category: 'Security',
      amount_cents: -300,
      frequency: 'weekly',
      start_date: today,
      active: true,
      created_date: today
    }))
  expectSuccessfulMutation(await ownerClient
    .from('recurring_items')
    .update({ title: 'Direct positive recurring updated' })
    .eq('id', directRecurringId))
  await expectRecurringTitle(directRecurringId, 'Direct positive recurring updated')

  expectSuccessfulMutation(await ownerClient
    .from('recurring_items')
    .delete()
    .eq('id', directRecurringId))
  await expectAdminRowMissing('recurring_items', directRecurringId)
}

export const expectFunctionAllowedWritesWork = async (
  ownerClient: SupabaseClient,
  acceptInviteeClient: SupabaseClient,
  rejectInviteeClient: SupabaseClient,
  source: SecurityFixture
) => {
  const { groups, invitations, prefix, rows, users } = source
  const inviteEmail = `${prefix}-function-positive-invitee@example.com`
  const createGroupResult = await invokeLedger(ownerClient, ledgerRequestIdentifiers.createGroup, {
    name: `${prefix} function created group`,
    inviteEmails: []
  })

  expect(createGroupResult.error).toBeFalsy()
  expect(createGroupResult.data?.group?.name).toBe(`${prefix} function created group`)
  await expectAdminRow<IdRow>('groups', createGroupResult.data.group.id, 'id')

  const addEntryResult = await invokeLedger(ownerClient, ledgerRequestIdentifiers.addEntry, {
    groupId: groups.visible,
    input: {
      date: today,
      description: 'Function positive entry',
      category: 'Security',
      amountCents: 300
    }
  })

  expect(addEntryResult.error).toBeFalsy()
  await expectEntryDescription(addEntryResult.data.id, 'Function positive entry')

  const deleteEntryResult = await invokeLedger(ownerClient, ledgerRequestIdentifiers.deleteEntry, {
    groupId: groups.visible,
    entryId: addEntryResult.data.id
  })

  expect(deleteEntryResult.error).toBeFalsy()
  await expectAdminRowMissing('ledger_entries', addEntryResult.data.id)

  const addShortcutResult = await invokeLedger(ownerClient, ledgerRequestIdentifiers.addEntryShortcut, {
    groupId: groups.visible,
    input: {
      label: 'Function positive shortcut',
      emoji: 'S',
      description: 'Function positive shortcut entry',
      category: 'Security',
      effect: 'positive',
      defaultAmountCents: 300
    }
  })

  expect(addShortcutResult.error).toBeFalsy()
  await expectShortcutLabel(addShortcutResult.data.id, 'Function positive shortcut')

  const deleteShortcutResult = await invokeLedger(ownerClient, ledgerRequestIdentifiers.deleteEntryShortcut, {
    groupId: groups.visible,
    shortcutId: addShortcutResult.data.id
  })

  expect(deleteShortcutResult.error).toBeFalsy()
  await expectAdminRowMissing('entry_shortcuts', addShortcutResult.data.id)

  const addRecurringResult = await invokeLedger(ownerClient, ledgerRequestIdentifiers.addRecurringItem, {
    groupId: groups.visible,
    input: {
      title: 'Function positive recurring',
      category: 'Security',
      amountCents: -300,
      frequency: 'weekly',
      startDate: today
    }
  })

  expect(addRecurringResult.error).toBeFalsy()
  await expectRecurringTitle(addRecurringResult.data.id, 'Function positive recurring')

  const updateRecurringResult = await invokeLedger(ownerClient, ledgerRequestIdentifiers.updateRecurringItem, {
    groupId: groups.visible,
    itemId: addRecurringResult.data.id,
    input: {
      title: 'Function positive recurring updated',
      category: 'Security',
      amountCents: -400,
      frequency: 'weekly',
      startDate: today
    }
  })

  expect(updateRecurringResult.error).toBeFalsy()
  await expectRecurringTitle(addRecurringResult.data.id, 'Function positive recurring updated')

  const deleteRecurringResult = await invokeLedger(ownerClient, ledgerRequestIdentifiers.deleteRecurringItem, {
    groupId: groups.visible,
    itemId: addRecurringResult.data.id
  })

  expect(deleteRecurringResult.error).toBeFalsy()
  await expectAdminRowMissing('recurring_items', addRecurringResult.data.id)

  const inviteResult = await invokeLedger(ownerClient, ledgerRequestIdentifiers.inviteMember, {
    groupId: groups.visible,
    email: inviteEmail
  })

  expect(inviteResult.error).toBeFalsy()
  expect(inviteResult.data.member.email).toBe(inviteEmail)
  expect(inviteResult.data.invitation.email).toBe(inviteEmail)
  await expectInvitationExists(inviteResult.data.invitation.id)

  const invitedMembers = await selectAdminRows<MemberRow>(
    'group_members',
    'id, group_id, profile_id, name, email, status',
    'email',
    inviteEmail
  )
  expect(invitedMembers).toEqual([
    expect.objectContaining({
      email: inviteEmail,
      group_id: groups.visible,
      status: 'invited'
    })
  ])

  const acceptResult = await invokeLedger(acceptInviteeClient, ledgerRequestIdentifiers.acceptInvitation, {
    invitationId: invitations.acceptVisible
  })

  expect(acceptResult.error).toBeFalsy()
  expect(acceptResult.data.member.accountId).toBe(users.acceptInvitee.id)
  await expectNoAdminRows('group_invitations', 'id', invitations.acceptVisible)
  await expectMemberStatus(rows.acceptInvitedMember, 'active', users.acceptInvitee.id)

  const rejectResult = await invokeLedger(rejectInviteeClient, ledgerRequestIdentifiers.rejectInvitation, {
    invitationId: invitations.rejectVisible
  })

  expect(rejectResult.error).toBeFalsy()
  await expectNoAdminRows('group_invitations', 'id', invitations.rejectVisible)
  await expectAdminRowMissing('group_members', rows.rejectInvitedMember)
}
