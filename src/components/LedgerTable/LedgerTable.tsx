import { formatMoney } from '../../domain/money'
import type { LedgerEntry } from '../../types'
import styles from './LedgerTable.module.scss'

type LedgerTableProps = {
  entries: LedgerEntry[]
  onDeleteEntry: (entryId: string) => void
}

export const LedgerTable = ({ entries, onDeleteEntry }: LedgerTableProps) => (
    <section className={styles.panel} aria-labelledby="entries-title">
      <h2 id="entries-title">Entries</h2>

      {entries.length > 0 ? (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
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
                  <td>{entry.source}</td>
                  <td>
                    {entry.source === 'manual' ? (
                      <button type="button" onClick={() => onDeleteEntry(entry.id)}>Delete</button>
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
