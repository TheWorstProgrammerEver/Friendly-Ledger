export const ledgerRequestIdentifiers = {
  acceptInvitation: 'acceptInvitation',
  addEntry: 'addEntry',
  addEntryShortcut: 'addEntryShortcut',
  addRecurringItem: 'addRecurringItem',
  createGroup: 'createGroup',
  deleteEntry: 'deleteEntry',
  deleteEntryShortcut: 'deleteEntryShortcut',
  deleteRecurringItem: 'deleteRecurringItem',
  inviteMember: 'inviteMember',
  load: 'load',
  rejectInvitation: 'rejectInvitation',
  updateRecurringItem: 'updateRecurringItem'
} as const

export const ledgerRequestNames = Object.values(ledgerRequestIdentifiers)

export type LedgerRequestIdentifier = typeof ledgerRequestNames[number]
