import { Outlet } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { LedgerContextProvider } from '../contexts/LedgerContext'

export const LedgerRouteScope = () => {
  const { currentAccount } = useAuthContext()

  return (
    <LedgerContextProvider currentAccount={currentAccount}>
      <Outlet />
    </LedgerContextProvider>
  )
}
