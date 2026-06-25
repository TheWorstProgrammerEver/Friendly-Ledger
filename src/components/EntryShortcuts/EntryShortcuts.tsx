import { Settings } from 'lucide-react'
import { ActionLink } from '../../../lib/ui/Button/ActionLink'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { ResponsiveContent } from '../../../lib/ui/ResponsiveContent/ResponsiveContent'
import type { EntryShortcut } from '../../types/ledger'
import { Section } from '../../../lib/ui/Section/Section'
import styles from './EntryShortcuts.module.scss'

type EntryShortcutsProps = {
  manageHref: string
  shortcuts: EntryShortcut[]
  onUse: (shortcutId: string) => void
}

const byLabel = (left: EntryShortcut, right: EntryShortcut) => (
  left.label.localeCompare(right.label, undefined, { sensitivity: 'base' })
)

export const EntryShortcuts = ({ manageHref, shortcuts, onUse }: EntryShortcutsProps) => {
  const sortedShortcuts = [...shortcuts].sort(byLabel)

  return (
    <Section
      title="Shortcuts"
      titleId="entry-shortcuts-title"
      actions={(
        <ComponentRoleContext role="tertiary">
          <ActionLink to={manageHref}>
            <ResponsiveContent label="Manage shortcuts" icon={<Settings />}>
              Manage
            </ResponsiveContent>
          </ActionLink>
        </ComponentRoleContext>
      )}
    >
      {sortedShortcuts.length > 0 ? (
        <ul className={styles.grid}>
          {sortedShortcuts.map((shortcut) => (
            <li key={shortcut.id}>
              <button type="button" className={styles.card} onClick={() => onUse(shortcut.id)}>
                <span className={styles.icon} aria-hidden="true">{shortcut.emoji ?? '⚡'}</span>
                <span className={styles.label}>{shortcut.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No shortcuts yet</p>
      )}
    </Section>
  )
}
