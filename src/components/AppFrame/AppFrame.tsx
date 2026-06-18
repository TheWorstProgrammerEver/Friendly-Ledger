import { NavLink, Outlet } from 'react-router-dom'
import { AppFrame as AppFrameLayout } from '../../../lib/ui/AppFrame/AppFrame'
import { LoaderContainer } from '../../../lib/ui/LoaderContainer/LoaderContainer'
import { useAuthContext } from '../../contexts/AuthContext'
import { useLedgerContext } from '../../contexts/LedgerContext'
import styles from './AppFrame.module.scss'

const navLinkClass = ({ isActive }: { isActive: boolean }) => (
  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
)

export const AppFrame = () => {
  const { currentAccount, signOut } = useAuthContext()
  const { ledgerLoad, state } = useLedgerContext()

  return (
    <>
      <AppFrameLayout
        environment={window.config?.environment ?? 'local'}
        appName={window.config?.appName ?? 'Friendly Ledger'}
        accountMenu={(
          <details>
            <summary>{currentAccount?.email}</summary>
            <div>
              <NavLink to="/profile">Profile</NavLink>
              <button type="button" onClick={() => void signOut()}>Log out</button>
            </div>
          </details>
        )}
        navigation={(
          <nav className={styles.nav}>
            <section className={styles.staticNav} aria-label="App navigation">
              <NavLink className={navLinkClass} to="/groups/manage">
                Manage Groups
              </NavLink>
              <NavLink className={navLinkClass} to="/profile">Profile</NavLink>
            </section>

            <div className={styles.dynamicNav}>
              <details className={styles.navDetails} open>
                <summary>Groups</summary>

                <LoaderContainer loader={ledgerLoad} loadingLabel="Loading groups...">
                  <div className={styles.groupLinks}>
                    {state.groups.map((group) => (
                      <NavLink className={navLinkClass} key={group.id} to={`/groups/${group.id}`}>
                        {group.name}
                      </NavLink>
                    ))}
                    {state.groups.length === 0 && <p>No groups yet</p>}
                  </div>
                </LoaderContainer>
              </details>
            </div>
          </nav>
        )}
      >
        <Outlet />
      </AppFrameLayout>

      <datalist id="friendly-ledger-categories">
        <option value="Rent" />
        <option value="Groceries" />
        <option value="Utilities" />
        <option value="Household" />
        <option value="General" />
      </datalist>
    </>
  )
}
