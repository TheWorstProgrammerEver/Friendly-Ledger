import { useMemo } from 'react'
import { todayIso } from '../../domain/date'
import type { Account } from '../../types/auth'
import { useFriendlyLedgerStore } from './useFriendlyLedgerStore'

export const useLedgerViewModel = (currentAccount?: Account) => {
  const ledgerStore = useFriendlyLedgerStore(currentAccount)
  const today = todayIso()
  const pendingInvitations = useMemo(() => {
    if (!ledgerStore.currentAccount) {
      return []
    }

    return ledgerStore.state.pendingInvitations.filter((invitation) => (
      invitation.email === ledgerStore.currentAccount?.email
    ))
  }, [ledgerStore.currentAccount, ledgerStore.state.pendingInvitations])

  return {
    ...ledgerStore,
    pendingInvitations,
    today
  }
}

export type LedgerViewModel = ReturnType<typeof useLedgerViewModel>
