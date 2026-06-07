import { formatMoney } from '../../domain/money'
import type { Group } from '../../types'
import styles from './RecurringRules.module.scss'

type RecurringRulesProps = {
  group: Group
  onAdd: () => void
  onEdit: (itemId: string) => void
}

export const RecurringRules = ({ group, onAdd, onEdit }: RecurringRulesProps) => (
  <section className={styles.panel} aria-labelledby="recurring-rules-title">
    <header>
      <h2 id="recurring-rules-title">Recurring</h2>
      <button type="button" onClick={onAdd}>Add recurring</button>
    </header>

    {group.recurringItems.length > 0 ? (
      <ul>
        {group.recurringItems.map((item) => (
          <li key={item.id}>
            <span>
              <strong>{item.title}</strong>
              <small>
                {formatMoney(item.amountCents)} {item.frequency}, from {item.startDate}
                {item.endDate ? ` to ${item.endDate}` : ''}
              </small>
            </span>
            <button type="button" onClick={() => onEdit(item.id)}>Edit</button>
          </li>
        ))}
      </ul>
    ) : (
      <p>No recurring rules</p>
    )}
  </section>
)
