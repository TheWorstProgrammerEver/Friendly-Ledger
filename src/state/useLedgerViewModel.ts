import { useMemo } from 'react'
import { todayIso } from '../domain/date'
import { useFriendlyLedgerStore } from './useFriendlyLedgerStore'

export const useLedgerViewModel = () => {
  const ledgerStore = useFriendlyLedgerStore()
  const today = todayIso()
  const pendingInvitations = useMemo(() => {
    if (!ledgerStore.currentAccount) {
      return []
    }

    return ledgerStore.state.groups.flatMap((group) => group.invitations
      .filter((invitation) => (
        invitation.status === 'pending'
        && invitation.email === ledgerStore.currentAccount?.email
      ))
      .map((invitation) => ({ ...invitation, groupName: group.name })))
  }, [ledgerStore.currentAccount, ledgerStore.state.groups])

  return {
    ...ledgerStore,
    pendingInvitations,
    today
  }
}

export type LedgerViewModel = ReturnType<typeof useLedgerViewModel>
