import { formatMoney } from '../../domain/money'
import type { Group } from '../../types/ledger'
import { Section } from '../../../lib/ui/Section/Section'
import styles from './RecurringRules.module.scss'

type RecurringRulesProps = {
  group: Group
  onAdd: () => void
  onEdit: (itemId: string) => void
}

export const RecurringRules = ({ group, onAdd, onEdit }: RecurringRulesProps) => (
  <Section
    title="Recurring"
    titleId="recurring-rules-title"
    actions={<button type="button" onClick={onAdd}>Add recurring</button>}
  >
    {group.recurringItems.length > 0 ? (
      <ul className={styles.list}>
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
  </Section>
)
