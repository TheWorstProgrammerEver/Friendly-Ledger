import { useState } from 'react'
import { parseMoneyToCents } from '../../domain/money'
import type { RecurringFrequency, RecurringItem } from '../../types/ledger'
import styles from './RecurringForm.module.scss'

export type RecurringFormInput = {
  category: string
  amountCents: number
  title: string
  frequency: RecurringFrequency
  startDate: string
  endDate?: string
}

type RecurringEditorProps = {
  formId: string
  initialValue?: RecurringItem
  today: string
  onSave: (input: RecurringFormInput) => void | Promise<void>
}

type AddRecurringFormProps = {
  formId: string
  today: string
  onSave: (input: RecurringFormInput) => void | Promise<void>
}

type EditRecurringFormProps = {
  formId: string
  item: RecurringItem
  onSave: (input: RecurringFormInput) => void | Promise<void>
}

const amountForInput = (amountCents: number) => (
  (Math.abs(amountCents) / 100).toString()
)

const RecurringEditor = ({
  formId,
  initialValue,
  today,
  onSave
}: RecurringEditorProps) => {
  const [title, setTitle] = useState(initialValue?.title ?? '')
  const [category, setCategory] = useState(initialValue?.category ?? 'Rent')
  const [amount, setAmount] = useState(initialValue ? amountForInput(initialValue.amountCents) : '')
  const [effect, setEffect] = useState<'positive' | 'negative'>(
    initialValue && initialValue.amountCents >= 0 ? 'positive' : 'negative'
  )
  const [frequency, setFrequency] = useState<RecurringFrequency>(initialValue?.frequency ?? 'weekly')
  const [startDate, setStartDate] = useState(initialValue?.startDate ?? today)
  const [endDate, setEndDate] = useState(initialValue?.endDate ?? '')

  return (
    <form
      id={formId}
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        void onSave({
          category,
          amountCents: parseMoneyToCents(amount) * (effect === 'negative' ? -1 : 1),
          title,
          frequency,
          startDate,
          endDate: endDate || undefined
        })
      }}
    >
      <label>
        Title
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>

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

      <label>
        Effect
        <select value={effect} onChange={(event) => setEffect(event.target.value as 'positive' | 'negative')}>
          <option value="negative">Negative</option>
          <option value="positive">Positive</option>
        </select>
      </label>

      <label>
        Category
        <input list="friendly-ledger-categories" value={category} onChange={(event) => setCategory(event.target.value)} />
      </label>

      <label>
        Frequency
        <select value={frequency} onChange={(event) => setFrequency(event.target.value as RecurringFrequency)}>
          <option value="weekly">Weekly</option>
          <option value="fortnightly">Fortnightly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>

      <label>
        Start date
        <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
      </label>

      <label>
        End date
        <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
      </label>
    </form>
  )
}

export const AddRecurringForm = ({ formId, today, onSave }: AddRecurringFormProps) => (
  <RecurringEditor formId={formId} today={today} onSave={onSave} />
)

export const EditRecurringForm = ({ formId, item, onSave }: EditRecurringFormProps) => (
  <RecurringEditor formId={formId} initialValue={item} today={item.startDate} onSave={onSave} />
)
