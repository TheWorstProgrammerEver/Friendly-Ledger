import { useState } from 'react'
import styles from './EntryShortcutForm.module.scss'

export type EntryShortcutFormInput = {
  label: string
  description: string
  category: string
  effect: 'positive' | 'negative'
}

type EntryShortcutFormProps = {
  formId: string
  onSave: (input: EntryShortcutFormInput) => void
}

export const EntryShortcutForm = ({ formId, onSave }: EntryShortcutFormProps) => {
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [effect, setEffect] = useState<'positive' | 'negative'>('positive')

  return (
    <form
      id={formId}
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        onSave({ label, description, category, effect })
        setLabel('')
        setDescription('')
      }}
    >
      <label>
        Button label
        <input value={label} onChange={(event) => setLabel(event.target.value)} />
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
