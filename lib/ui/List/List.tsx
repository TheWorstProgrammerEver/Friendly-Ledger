import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ActionGroup } from '../ActionGroup/ActionGroup'
import styles from './List.module.scss'

type ListProps = {
  ariaLabel?: string
  children: ReactNode
}

type ListItemProps = {
  actions?: ReactNode
  actionsLabel?: string
  details: ReactNode
  leading?: ReactNode
  navigationLabel?: string
  to?: string
}

export const List = ({ ariaLabel, children }: ListProps) => (
  <ul className={styles.list} aria-label={ariaLabel}>
    {children}
  </ul>
)

export const ListItem = ({ actions, actionsLabel, details, leading, navigationLabel, to }: ListItemProps) => {
  const className = [
    leading ? styles.withLeading : styles.item,
    to ? styles.interactive : undefined
  ].filter(Boolean).join(' ')

  const content = (
    <>
      {leading && (
        <span className={styles.leading}>
          {leading}
        </span>
      )}

      <span className={styles.details}>
        {details}
      </span>
    </>
  )

  return (
    <li className={className}>
      {to ? (
        <Link className={styles.target} to={to} aria-label={navigationLabel}>
          {content}
        </Link>
      ) : content}

      {actions && (
        <ActionGroup ariaLabel={actionsLabel} className={styles.actions}>
          {actions}
        </ActionGroup>
      )}
    </li>
  )
}
