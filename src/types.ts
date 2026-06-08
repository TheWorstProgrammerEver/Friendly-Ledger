export type Account = {
  id: string
  name: string
  email: string
  createdDate: string
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
  status: 'pending' | 'accepted'
  invitedDate: string
  acceptedDate?: string
  acceptedByAccountId?: string
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
  description: string
  category: string
  effect: 'positive' | 'negative'
  createdDate: string
}

export type RecurringFrequency = 'weekly' | 'fortnightly' | 'monthly'

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
  accounts: Account[]
  currentAccountId?: string
  groups: Group[]
  activeGroupId?: string
}
