import { formatMoney } from '../../domain/money'
import styles from './BalanceSummary.module.scss'

type BalanceSummaryProps = {
  balanceCents: number
}

const balanceClass = (amountCents: number) => {
  if (amountCents > 0) {
    return styles.positive
  }

  if (amountCents < 0) {
    return styles.negative
  }

  return styles.neutral
}

const balanceLabel = (amountCents: number) => {
  if (amountCents > 0) {
    return 'Surplus'
  }

  if (amountCents < 0) {
    return 'Deficit'
  }

  return 'Balanced'
}

export const BalanceSummary = ({ balanceCents }: BalanceSummaryProps) => (
  <section className={styles.panel} aria-labelledby="balances-title">
    <h2 id="balances-title">Balance</h2>

    <div className={styles.balance}>
      <output className={balanceClass(balanceCents)}>{formatMoney(balanceCents)}</output>
      <span>{balanceLabel(balanceCents)}</span>
    </div>
  </section>
)
