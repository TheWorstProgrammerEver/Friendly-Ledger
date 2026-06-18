import { createContext, type ReactNode, useContext } from 'react'
import type { Account } from '../types/auth'
import { useLedgerViewModel, type LedgerViewModel } from '../stores/friendlyLedgerStore/useLedgerViewModel'

const LedgerContext = createContext<LedgerViewModel | undefined>(undefined)

type LedgerContextProviderProps = {
  children: ReactNode
  currentAccount?: Account
}

export const LedgerContextProvider = ({ children, currentAccount }: LedgerContextProviderProps) => {
  const viewModel = useLedgerViewModel(currentAccount)

  return (
    <LedgerContext.Provider value={viewModel}>
      {children}
    </LedgerContext.Provider>
  )
}

export const useLedgerContext = () => {
  const context = useContext(LedgerContext)

  if (!context) {
    throw new Error('useLedgerContext must be used inside LedgerContextProvider')
  }

  return context
}
