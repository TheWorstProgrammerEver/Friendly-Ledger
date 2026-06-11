import { useState } from 'react'
import { parseMoneyToCents } from '../../domain/money'
import type { EntryFormInput } from '../EntryForm/EntryForm'
import styles from './ShortcutEntryForm.module.scss'

type ShortcutEntryFormProps = {
  formId: string
  today: string
  category: string
  description: string
  effect: 'positive' | 'negative'
  onAdd: (input: EntryFormInput) => void
}

export const ShortcutEntryForm = ({
  formId,
  today,
  category,
  description,
  effect,
  onAdd
}: ShortcutEntryFormProps) => {
  const [amount, setAmount] = useState('')

  return (
    <form
      id={formId}
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        onAdd({
          date: today,
          description,
          category,
          amountCents: parseMoneyToCents(amount) * (effect === 'negative' ? -1 : 1)
        })
        setAmount('')
      }}
    >
      <label>
        Amount
        <input
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
    </form>
  )
}
