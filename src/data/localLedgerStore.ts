import type { FriendlyLedgerState } from '../types'

const storageKey = 'friendly-ledger-state-v2'

const emptyState: FriendlyLedgerState = {
  accounts: [],
  groups: []
}

export const loadFriendlyLedgerState = (): FriendlyLedgerState => {
  if (typeof window === 'undefined') {
    return emptyState
  }

  const savedState = window.localStorage.getItem(storageKey)

  if (!savedState) {
    return emptyState
  }

  try {
    return { ...emptyState, ...JSON.parse(savedState) }
  } catch {
    return emptyState
  }
}

export const saveFriendlyLedgerState = (state: FriendlyLedgerState) => {
  window.localStorage.setItem(storageKey, JSON.stringify(state))
}
