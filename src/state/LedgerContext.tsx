import { createContext, type ReactNode, useContext } from 'react'
import { useLedgerViewModel, type LedgerViewModel } from './useLedgerViewModel'

const LedgerContext = createContext<LedgerViewModel | undefined>(undefined)

type LedgerProviderProps = {
  children: ReactNode
}

export const LedgerProvider = ({ children }: LedgerProviderProps) => {
  const viewModel = useLedgerViewModel()

  return (
    <LedgerContext.Provider value={viewModel}>
      {children}
    </LedgerContext.Provider>
  )
}

export const useLedger = () => {
  const context = useContext(LedgerContext)

  if (!context) {
    throw new Error('useLedger must be used inside LedgerProvider')
  }

  return context
}
