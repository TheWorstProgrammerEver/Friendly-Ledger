import type {
  EntryInput,
  EntryShortcutEffect,
  EntryShortcutInput,
  RecurringFrequency,
  RecurringInput
} from '../../common/ledgerTypes'

export type {
  EntryInput,
  EntryShortcutEffect,
  EntryShortcutInput,
  RecurringFrequency,
  RecurringInput
}

export type Member = {
  id: string
  accountId?: string
  name: string
  email: string
  status: 'active' | 'invited'
}

export type Invitation = {
  id: string
  groupId: string
  email: string
  invitedDate: string
}

export type PendingInvitation = Invitation & {
  groupName: string
}

export type LedgerEntry = {
  id: string
  groupId: string
  date: string
  description: string
  category: string
  amountCents: number
  source: 'manual' | 'recurring'
  recurringItemId?: string
  createdByAccountId?: string
  createdByName?: string
  createdDate: string
}

export type EntryShortcut = {
  id: string
  groupId: string
  label: string
  emoji: string
  description: string
  category: string
  effect: EntryShortcutEffect
  defaultAmountCents?: number
  createdDate: string
}

export type RecurringItem = {
  id: string
  groupId: string
  title: string
  category: string
  amountCents: number
  frequency: RecurringFrequency
  startDate: string
  endDate?: string
  active: boolean
  createdDate: string
}

export type Group = {
  id: string
  name: string
  members: Member[]
  invitations: Invitation[]
  entries: LedgerEntry[]
  entryShortcuts?: EntryShortcut[]
  recurringItems: RecurringItem[]
  createdDate: string
}

export type FriendlyLedgerState = {
  groups: Group[]
  pendingInvitations: PendingInvitation[]
  activeGroupId?: string
}
