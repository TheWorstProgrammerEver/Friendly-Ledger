import type { EntryShortcutEffect, RecurringFrequency } from '../../../../common/ledgerTypes.ts'

export type MemberRow = {
  id: string
  group_id: string
  profile_id: string | null
  name: string
  email: string
  status: 'active' | 'invited'
}

export type InvitationRow = {
  id: string
  group_id: string
  group_name: string
  email: string
  invited_date: string
}

export type LedgerEntryRow = {
  id: string
  group_id: string
  entry_date: string
  description: string
  category: string
  amount_cents: number
  created_by_profile_id: string | null
  created_by_name: string | null
  created_date: string
}

export type EntryShortcutRow = {
  id: string
  group_id: string
  label: string
  emoji: string
  description: string
  category: string
  effect: EntryShortcutEffect
  default_amount_cents: number | null
  created_date: string
}

export type RecurringItemRow = {
  id: string
  group_id: string
  title: string
  category: string
  amount_cents: number
  frequency: RecurringFrequency
  start_date: string
  end_date: string | null
  active: boolean
  created_date: string
}
