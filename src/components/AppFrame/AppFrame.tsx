import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useLedger } from '../../state/LedgerContext'
import styles from './AppFrame.module.scss'

const navLinkClass = ({ isActive }: { isActive: boolean }) => (
  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
)

export const AppFrame = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { currentAccount, signOut, state } = useLedger()

  return (
    <div className={collapsed ? `${styles.frame} ${styles.collapsed}` : styles.frame}>
      <header className={styles.header}>
        <div>
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

      <aside className={styles.sidebar} aria-label="Primary navigation">
        <button
          className={styles.collapseButton}
          type="button"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((isCollapsed) => !isCollapsed)}
        >
          {collapsed ? 'Open' : 'Collapse'}
        </button>

        <nav className={styles.nav}>
          <section>
            <h2>Groups</h2>
            {state.groups.map((group) => (
              <NavLink className={navLinkClass} key={group.id} to={`/groups/${group.id}`}>
                {group.name}
              </NavLink>
            ))}
            <NavLink className={navLinkClass} to="/groups/manage">Manage Groups</NavLink>
          </section>

          <section>
            <NavLink className={navLinkClass} to="/profile">Profile</NavLink>
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
