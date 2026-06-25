import { Settings } from 'lucide-react'
import { ActionLink } from '../../../lib/ui/Button/ActionLink'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { IconAndLabel, IconOnly } from '../../../lib/ui/ResponsiveContent/IconContent'
import { ResponsiveContent } from '../../../lib/ui/ResponsiveContent/ResponsiveContent'
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
        <ActionLink to={manageHref}>
          <ResponsiveContent
            compact={<IconOnly icon={<Settings />} label="Manage recurring" />}
            nonCompact={(
              <IconAndLabel icon={<Settings />} label="Manage recurring">
                Manage
              </IconAndLabel>
            )}
          />
        </ActionLink>
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
