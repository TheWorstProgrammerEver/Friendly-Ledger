import { useId, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useLedger } from '../../state/LedgerContext'
import styles from './AppFrame.module.scss'

const navLinkClass = ({ isActive }: { isActive: boolean }) => (
  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
)

const shouldShowNavigation = () => (
  typeof window === 'undefined' || window.matchMedia('(min-width: 761px)').matches
)

export const AppFrame = () => {
  const navigationId = useId()
  const [navigationOpen, setNavigationOpen] = useState(shouldShowNavigation)
  const { currentAccount, signOut, state } = useLedger()
  const frameClassName = navigationOpen
    ? `${styles.frame} ${styles.navigationOpen}`
    : `${styles.frame} ${styles.navigationClosed}`

  const closeNavigationOnCompact = () => {
    if (window.matchMedia('(max-width: 760px)').matches) {
      setNavigationOpen(false)
    }
  }

  return (
    <div className={frameClassName}>
      <header className={styles.header}>
        <button
          className={styles.menuButton}
          type="button"
          aria-controls={navigationId}
          aria-expanded={navigationOpen}
          aria-label={navigationOpen ? 'Hide navigation' : 'Show navigation'}
          onClick={() => setNavigationOpen((isOpen) => !isOpen)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <div className={styles.brand}>
          <p>{window.config?.environment ?? 'local'}</p>
          <h1>{window.config?.appName ?? 'Friendly Ledger'}</h1>
        </div>

        <details className={styles.accountMenu}>
          <summary>{currentAccount?.email}</summary>
          <div>
            <NavLink to="/profile">Profile</NavLink>
            <button type="button" onClick={signOut}>Log out</button>
          </div>
        </details>
      </header>

      {navigationOpen ? (
        <button
          className={styles.backdrop}
          type="button"
          aria-label="Close navigation"
          onClick={() => setNavigationOpen(false)}
        />
      ) : null}

      <aside
        className={styles.sidebar}
        id={navigationId}
        aria-label="Primary navigation"
        aria-hidden={!navigationOpen}
        inert={navigationOpen ? undefined : true}
      >
        <nav className={styles.nav}>
          <section>
            <h2>Groups</h2>
            {state.groups.map((group) => (
              <NavLink
                className={navLinkClass}
                key={group.id}
                to={`/groups/${group.id}`}
                onClick={closeNavigationOnCompact}
              >
                {group.name}
              </NavLink>
            ))}
            <NavLink className={navLinkClass} to="/groups/manage" onClick={closeNavigationOnCompact}>
              Manage Groups
            </NavLink>
          </section>

          <section>
            <NavLink className={navLinkClass} to="/profile" onClick={closeNavigationOnCompact}>Profile</NavLink>
          </section>
        </nav>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>

      <datalist id="friendly-ledger-categories">
        <option value="Rent" />
        <option value="Groceries" />
        <option value="Utilities" />
        <option value="Household" />
        <option value="General" />
      </datalist>
    </div>
  )
}
