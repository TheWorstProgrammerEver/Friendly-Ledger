import { useState } from 'react'
import { parseMoneyToCents } from '../../domain/money'
import styles from './EntryForm.module.scss'

export type EntryFormInput = {
  date: string
  description: string
  category: string
  amountCents: number
}

type EntryFormProps = {
  today: string
  onAdd: (input: EntryFormInput) => void
}

export const EntryForm = ({ today, onAdd }: EntryFormProps) => {
  const [date, setDate] = useState(today)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [amount, setAmount] = useState('')
  const [effect, setEffect] = useState<'positive' | 'negative'>('positive')

  return (
    <form
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

      <button type="submit">Add entry</button>
    </form>
  )
}
