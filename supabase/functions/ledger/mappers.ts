import type {
  EntryShortcutRow,
  InvitationRow,
  LedgerEntryRow,
  MemberRow,
  RecurringItemRow
} from './types/rows.ts'

export const memberFromRow = (member: MemberRow) => ({
  id: member.id,
  accountId: member.profile_id ?? undefined,
  name: member.name,
  email: member.email,
  status: member.status
})

export const invitationFromRow = (invitation: InvitationRow) => ({
  id: invitation.id,
  groupId: invitation.group_id,
  email: invitation.email,
  invitedDate: invitation.invited_date
})

export const ledgerEntryFromRow = (entry: LedgerEntryRow) => ({
  id: entry.id,
  groupId: entry.group_id,
  date: entry.entry_date,
  description: entry.description,
  category: entry.category,
  amountCents: entry.amount_cents,
  source: 'manual' as const,
  createdByAccountId: entry.created_by_profile_id ?? undefined,
  createdByName: entry.created_by_name ?? undefined,
  createdDate: entry.created_date
})

export const entryShortcutFromRow = (shortcut: EntryShortcutRow) => ({
  id: shortcut.id,
  groupId: shortcut.group_id,
  label: shortcut.label,
  emoji: shortcut.emoji,
  description: shortcut.description,
  category: shortcut.category,
  effect: shortcut.effect,
  defaultAmountCents: shortcut.default_amount_cents ?? undefined,
  createdDate: shortcut.created_date
})

export const recurringItemFromRow = (item: RecurringItemRow) => ({
  id: item.id,
  groupId: item.group_id,
  title: item.title,
  category: item.category,
  amountCents: item.amount_cents,
  frequency: item.frequency,
  startDate: item.start_date,
  endDate: item.end_date ?? undefined,
  active: item.active,
  createdDate: item.created_date
})
