import { useState } from 'react'
import { FormGrid } from '../../../lib/ui/FormGrid/FormGrid'
import { parseMoneyToCents } from '../../domain/money'

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
  onAdd: (input: EntryFormInput) => void | Promise<void>
}

const amountForInput = (amountCents?: number) => (
  amountCents ? (Math.abs(amountCents) / 100).toFixed(2) : ''
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
    <FormGrid
      id={formId}
      onSubmit={(event) => {
        event.preventDefault()
        void onAdd({
          date,
          description,
          category,
          amountCents: parseMoneyToCents(amount) * (effect === 'negative' ? -1 : 1)
        })
      }}
    >
      <label>
        Date
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
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

    </FormGrid>
  )
}
