import { useState } from 'react'
import { FormGrid } from '../../../lib/ui/FormGrid/FormGrid'
import { parseMoneyToCents } from '../../domain/money'

export type EntryShortcutFormInput = {
  label: string
  emoji: string
  description: string
  category: string
  effect: 'positive' | 'negative'
  defaultAmountCents?: number
}

type EntryShortcutFormProps = {
  formId: string
  onSave: (input: EntryShortcutFormInput) => void | Promise<void>
}

export const EntryShortcutForm = ({ formId, onSave }: EntryShortcutFormProps) => {
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('⚡')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [effect, setEffect] = useState<'positive' | 'negative'>('positive')
  const [defaultAmount, setDefaultAmount] = useState('')

  return (
    <FormGrid
      id={formId}
      onSubmit={(event) => {
        event.preventDefault()
        void onSave({
          label,
          emoji,
          description,
          category,
          effect,
          defaultAmountCents: defaultAmount ? parseMoneyToCents(defaultAmount) : undefined
        })
      }}
    >
      <label>
        Button label
        <input value={label} onChange={(event) => setLabel(event.target.value)} />
      </label>

      <label>
        Emoji
        <input value={emoji} onChange={(event) => setEmoji(event.target.value)} />
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
        Default amount
        <input
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          value={defaultAmount}
          onChange={(event) => setDefaultAmount(event.target.value)}
        />
      </label>

      <label>
        Description
        <input value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
    </FormGrid>
  )
}
