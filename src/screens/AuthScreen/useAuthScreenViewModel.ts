import { useLedger } from '../../state/LedgerContext'

export const useAuthScreenViewModel = () => {
  const { currentAccount, signIn } = useLedger()

  return {
    signIn,
    signedIn: Boolean(currentAccount)
  }
}
