import { Navigate, Route, Routes } from 'react-router-dom'
import { AppFrame } from './components/AppFrame/AppFrame'
import { useLedgerContext } from './contexts/LedgerContext'
import { LedgerRouteScope } from './routing/LedgerRouteScope'
import { RequireAuth } from './routing/RequireAuth'
import { AuthScreen } from './screens/AuthScreen/AuthScreen'
import { GroupSummaryScreen } from './screens/GroupSummaryScreen/GroupSummaryScreen'
import { ManageGroupsScreen } from './screens/ManageGroupsScreen/ManageGroupsScreen'
import { ManageShortcutsScreen } from './screens/ManageShortcutsScreen/ManageShortcutsScreen'
import { ProfileScreen } from './screens/ProfileScreen/ProfileScreen'
import { AuthContextProvider } from './contexts/AuthContext'

const StartScreen = () => {
  const { state } = useLedgerContext()
  const firstGroup = state.groups[0]

  return <Navigate to={firstGroup ? `/groups/${firstGroup.id}` : '/groups/manage'} replace />
}

export const App = () => (
  <AuthContextProvider>
    <Routes>
      <Route path="/sign-in" element={<AuthScreen />} />
      <Route element={<RequireAuth />}>
        <Route element={<LedgerRouteScope />}>
          <Route element={<AppFrame />}>
            <Route index element={<StartScreen />} />
            <Route path="groups/manage" element={<ManageGroupsScreen />} />
            <Route path="groups/:groupId" element={<GroupSummaryScreen />} />
            <Route path="groups/:groupId/shortcuts" element={<ManageShortcutsScreen />} />
            <Route path="profile" element={<ProfileScreen />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AuthContextProvider>
)
