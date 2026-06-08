import type { EntryShortcut } from '../../types'
import styles from './EntryShortcuts.module.scss'

type EntryShortcutsProps = {
  shortcuts: EntryShortcut[]
  onAdd: () => void
  onDelete: (shortcutId: string) => void
  onUse: (shortcutId: string) => void
}

const byLabel = (left: EntryShortcut, right: EntryShortcut) => (
  left.label.localeCompare(right.label, undefined, { sensitivity: 'base' })
)

export const EntryShortcuts = ({ shortcuts, onAdd, onDelete, onUse }: EntryShortcutsProps) => {
  const sortedShortcuts = [...shortcuts].sort(byLabel)

  return (
    <section className={styles.panel} aria-labelledby="entry-shortcuts-title">
      <header>
        <h2 id="entry-shortcuts-title">Shortcuts</h2>
        <button type="button" onClick={onAdd}>Add shortcut</button>
      </header>

      {sortedShortcuts.length > 0 ? (
        <ul>
          {sortedShortcuts.map((shortcut) => (
            <li key={shortcut.id}>
              <button type="button" className={styles.shortcut} onClick={() => onUse(shortcut.id)}>
                {shortcut.label}
              </button>
              <button type="button" onClick={() => onDelete(shortcut.id)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No shortcuts yet</p>
      )}
    </section>
  )
}
