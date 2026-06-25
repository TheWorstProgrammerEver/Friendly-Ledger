import { Pencil, Plus } from 'lucide-react'
import { Button } from '../../../lib/ui/Button/Button'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { ResponsiveContent } from '../../../lib/ui/ResponsiveContent/ResponsiveContent'
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
    actions={(
      <Button type="button" onClick={onAdd}>
        <ResponsiveContent label="Add recurring" icon={<Plus />}>
          Add
        </ResponsiveContent>
      </Button>
    )}
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
            <ComponentRoleContext role="tertiary">
              <Button type="button" onClick={() => onEdit(item.id)}>
                <ResponsiveContent icon={<Pencil />}>Edit</ResponsiveContent>
              </Button>
            </ComponentRoleContext>
          </li>
        ))}
      </ul>
    ) : (
      <p>No recurring rules</p>
    )}
  </Section>
)
