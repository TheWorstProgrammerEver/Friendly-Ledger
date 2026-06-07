import { useLedger } from '../../state/LedgerContext'

export const useProfileScreenViewModel = () => {
  const { currentAccount, signOut } = useLedger()

  return {
    currentAccount,
    signOut
  }
}
