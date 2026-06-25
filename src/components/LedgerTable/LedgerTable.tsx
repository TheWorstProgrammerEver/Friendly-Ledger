import { Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { HeaderWithActions } from '../../../lib/ui/HeaderWithActions/HeaderWithActions'
import { ResponsiveButton } from '../../../lib/ui/ResponsiveButton/ResponsiveButton'
import { formatMoney } from '../../domain/money'
import { useConfirmation } from '../../../lib/hooks/useConfirmation'
import type { LedgerEntry } from '../../types/ledger'
import styles from './LedgerTable.module.scss'

type LedgerTableProps = {
  actions?: ReactNode
  entries: LedgerEntry[]
  onDeleteEntry: (entryId: string) => void
}

const createdByLabel = (entry: LedgerEntry) => {
  if (entry.source === 'recurring') {
    return 'Recurring'
  }

  return entry.createdByName ?? 'Unknown'
}

const entryCountLabel = (entryCount: number) => (
  `${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}`
)

export const LedgerTable = ({ actions, entries, onDeleteEntry }: LedgerTableProps) => {
  const confirmDelete = useConfirmation('Delete this manual entry?')

  return (
    <section className={styles.panel} aria-labelledby="entries-title">
      <HeaderWithActions
        header={<h2 id="entries-title">Entries</h2>}
        actions={actions}
      />

      {entries.length > 0 ? (
        <div className={styles.tableWrap}>
          <table>
            <caption>{entryCountLabel(entries.length)}</caption>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Entered by</th>
                <th>Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>{entry.description}</td>
                  <td>{entry.category}</td>
                  <td>{formatMoney(entry.amountCents)}</td>
                  <td>{createdByLabel(entry)}</td>
                  <td>{entry.source}</td>
                  <td>
                    {entry.source === 'manual' ? (
                      <ComponentRoleContext role="destructive">
                        <ResponsiveButton
                          type="button"
                          icon={<Trash2 />}
                          label="Delete"
                          onClick={() => confirmDelete(() => onDeleteEntry(entry.id))}
                        />
                      </ComponentRoleContext>
                    ) : (
                      <span className={styles.implicit}>Implicit</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No entries</p>
      )}
    </section>
  )
}
