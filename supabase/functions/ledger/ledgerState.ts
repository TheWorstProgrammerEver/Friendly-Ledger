import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { selectRows } from './helpers.ts'
import type {
  EntryShortcutRow,
  InvitationRow,
  LedgerEntryRow,
  MemberRow,
  RecurringItemRow
} from './types/rows.ts'
import {
  entryShortcutFromRow,
  invitationFromRow,
  ledgerEntryFromRow,
  memberFromRow,
  recurringItemFromRow
} from './mappers.ts'

type GroupRow = {
  id: string
  name: string
  created_date: string
}

const unique = (values: string[]) => [...new Set(values)]

export const loadState = async (client: SupabaseClient, userId: string, userEmail: string, activeGroupId?: string) => {
  const [activeMemberships, pendingInvitationRows] = await Promise.all([
    selectRows<MemberRow>(
      client
        .from('group_members')
        .select('id, group_id, profile_id, name, email, status')
        .eq('profile_id', userId)
        .eq('status', 'active')
    ),
    selectRows<InvitationRow>(
      client
        .from('group_invitations')
        .select('id, group_id, group_name, email, invited_date')
        .eq('email', userEmail)
        .order('invited_date', { ascending: true })
    )
  ])
  const groupIds = unique(activeMemberships.map((member) => member.group_id))
  const pendingInvitations = pendingInvitationRows.map((invitation) => ({
    ...invitationFromRow(invitation),
    groupName: invitation.group_name
  }))

  if (groupIds.length === 0) {
    return { groups: [], pendingInvitations, activeGroupId }
  }

  const groups = await selectRows<GroupRow>(
    client
      .from('groups')
      .select('id, name, created_date')
      .in('id', groupIds)
      .order('created_date', { ascending: true })
      .order('name', { ascending: true })
  )

  const [members, invitations, entries, entryShortcuts, recurringItems] = await Promise.all([
    selectRows<MemberRow>(
      client
        .from('group_members')
        .select('id, group_id, profile_id, name, email, status')
        .in('group_id', groupIds)
        .order('created_date', { ascending: true })
    ),
    selectRows<InvitationRow>(
      client
        .from('group_invitations')
        .select('id, group_id, group_name, email, invited_date')
        .in('group_id', groupIds)
        .order('invited_date', { ascending: true })
    ),
    selectRows<LedgerEntryRow>(
      client
        .from('ledger_entries')
        .select('id, group_id, entry_date, description, category, amount_cents, created_by_profile_id, created_by_name, created_date')
        .in('group_id', groupIds)
        .order('entry_date', { ascending: false })
        .order('created_date', { ascending: false })
    ),
    selectRows<EntryShortcutRow>(
      client
        .from('entry_shortcuts')
        .select('id, group_id, label, emoji, description, category, effect, default_amount_cents, created_date')
        .in('group_id', groupIds)
        .order('label', { ascending: true })
    ),
    selectRows<RecurringItemRow>(
      client
        .from('recurring_items')
        .select('id, group_id, title, category, amount_cents, frequency, start_date, end_date, active, created_date')
        .in('group_id', groupIds)
        .order('start_date', { ascending: false })
    )
  ])

  return {
    activeGroupId,
    pendingInvitations,
    groups: groups.map((group) => ({
      id: group.id,
      name: group.name,
      createdDate: group.created_date,
      members: members
        .filter((member) => member.group_id === group.id)
        .map(memberFromRow),
      invitations: invitations
        .filter((invitation) => invitation.group_id === group.id)
        .map(invitationFromRow),
      entries: entries
        .filter((entry) => entry.group_id === group.id)
        .map(ledgerEntryFromRow),
      entryShortcuts: entryShortcuts
        .filter((shortcut) => shortcut.group_id === group.id)
        .map(entryShortcutFromRow),
      recurringItems: recurringItems
        .filter((item) => item.group_id === group.id)
        .map(recurringItemFromRow)
    }))
  }
}
