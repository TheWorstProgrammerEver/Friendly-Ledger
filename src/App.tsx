import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppFrame } from './components/AppFrame/AppFrame'
import { LedgerProvider, useLedger } from './state/LedgerContext'
import { AuthScreen } from './screens/AuthScreen/AuthScreen'
import { GroupSummaryScreen } from './screens/GroupSummaryScreen/GroupSummaryScreen'
import { ManageGroupsScreen } from './screens/ManageGroupsScreen/ManageGroupsScreen'
import { ProfileScreen } from './screens/ProfileScreen/ProfileScreen'

const RequireAuth = () => {
  const { currentAccount } = useLedger()

  return currentAccount ? <Outlet /> : <Navigate to="/sign-in" replace />
}

const StartScreen = () => {
  const { state } = useLedger()
  const firstGroup = state.groups[0]

  return <Navigate to={firstGroup ? `/groups/${firstGroup.id}` : '/groups/manage'} replace />
}

export const App = () => (
  <LedgerProvider>
    <Routes>
      <Route path="/sign-in" element={<AuthScreen />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppFrame />}>
          <Route index element={<StartScreen />} />
          <Route path="groups/manage" element={<ManageGroupsScreen />} />
          <Route path="groups/:groupId" element={<GroupSummaryScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </LedgerProvider>
)
