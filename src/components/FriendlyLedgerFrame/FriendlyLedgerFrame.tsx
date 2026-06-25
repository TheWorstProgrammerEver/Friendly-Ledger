import { CircleUserRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { AppFrame } from '../../../lib/ui/AppFrame/AppFrame'
import { ActionLink } from '../../../lib/ui/Button/ActionLink'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { LoaderContainer } from '../../../lib/ui/LoaderContainer/LoaderContainer'
import { IconAndLabel, IconOnly } from '../../../lib/ui/ResponsiveContent/IconContent'
import { ResponsiveContent } from '../../../lib/ui/ResponsiveContent/ResponsiveContent'
import { useAuthContext } from '../../contexts/AuthContext'
import { useLedgerContext } from '../../contexts/LedgerContext'
import styles from './FriendlyLedgerFrame.module.scss'

const navLinkClass = ({ isActive }: { isActive: boolean }) => (
  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
)

export const FriendlyLedgerFrame = () => {
  const { currentAccount } = useAuthContext()
  const { ledgerLoad, state } = useLedgerContext()
  const accountEmail = currentAccount?.email ?? 'Profile'

  return (
    <>
      <AppFrame
        environment={window.config?.environment ?? 'local'}
        appName={window.config?.appName ?? 'Friendly Ledger'}
        accountMenu={(
          <ComponentRoleContext role="secondary">
            <ActionLink className={styles.profileLink} to="/profile">
              <ResponsiveContent
                compact={<IconOnly icon={<CircleUserRound />} label={`Open profile for ${accountEmail}`} />}
                nonCompact={(
                  <IconAndLabel icon={<CircleUserRound />} label={`Open profile for ${accountEmail}`}>
                    {accountEmail}
                  </IconAndLabel>
                )}
              />
            </ActionLink>
          </ComponentRoleContext>
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
      </AppFrame>

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
