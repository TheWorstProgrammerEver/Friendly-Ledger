import { Settings } from 'lucide-react'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { ResponsiveActionLink } from '../../../lib/ui/ResponsiveActionLink/ResponsiveActionLink'
import { Section } from '../../../lib/ui/Section/Section'
import { recurringItemSummary } from '../../domain/recurringItemSummary'
import type { RecurringItem } from '../../types/ledger'
import styles from './RecurringRules.module.scss'

type RecurringRulesProps = {
  manageHref: string
  recurringItems: RecurringItem[]
}

export const RecurringRules = ({ manageHref, recurringItems }: RecurringRulesProps) => (
  <Section
    title="Recurring"
    titleId="recurring-rules-title"
    actions={(
      <ComponentRoleContext role="tertiary">
        <ResponsiveActionLink to={manageHref} icon={<Settings />} label="Manage recurring">
          Manage
        </ResponsiveActionLink>
      </ComponentRoleContext>
    )}
  >
    {recurringItems.length > 0 ? (
      <ul className={styles.list}>
        {recurringItems.map((item) => (
          <li key={item.id}>
            <span>
              <strong>{item.title}</strong>
              <small>{recurringItemSummary(item)}</small>
            </span>
          </li>
        ))}
      </ul>
    ) : (
      <p>No recurring rules</p>
    )}
  </Section>
)
