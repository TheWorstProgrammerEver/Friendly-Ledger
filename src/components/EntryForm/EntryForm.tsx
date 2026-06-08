import { useState } from 'react'
import { parseMoneyToCents } from '../../domain/money'
import styles from './EntryForm.module.scss'

export type EntryFormInput = {
  date: string
  description: string
  category: string
  amountCents: number
}

export type EntryFormInitialValue = {
  date?: string
  description?: string
  category?: string
  effect?: 'positive' | 'negative'
  amountCents?: number
}

type EntryFormProps = {
  formId: string
  today: string
  initialValue?: EntryFormInitialValue
  onAdd: (input: EntryFormInput) => void
}

const amountForInput = (amountCents?: number) => (
  amountCents ? (Math.abs(amountCents) / 100).toString() : ''
)

export const EntryForm = ({ formId, today, initialValue, onAdd }: EntryFormProps) => {
  const [date, setDate] = useState(initialValue?.date ?? today)
  const [description, setDescription] = useState(initialValue?.description ?? '')
  const [category, setCategory] = useState(initialValue?.category ?? 'General')
  const [amount, setAmount] = useState(amountForInput(initialValue?.amountCents))
  const [effect, setEffect] = useState<'positive' | 'negative'>(
    initialValue?.effect ?? (initialValue?.amountCents && initialValue.amountCents < 0 ? 'negative' : 'positive')
  )

  return (
    <form
      id={formId}
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        onAdd({
          date,
          description,
          category,
          amountCents: parseMoneyToCents(amount) * (effect === 'negative' ? -1 : 1)
        })
        setDescription('')
        setAmount('')
      }}
    >
      <label>
        Date
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>

      <label>
        Amount
        <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
      </label>

      <label>
        Effect
        <select value={effect} onChange={(event) => setEffect(event.target.value as 'positive' | 'negative')}>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
        </select>
      </label>

      <label>
        Category
        <input list="friendly-ledger-categories" value={category} onChange={(event) => setCategory(event.target.value)} />
      </label>

      <label>
        Description
        <input value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>

    </form>
  )
}
