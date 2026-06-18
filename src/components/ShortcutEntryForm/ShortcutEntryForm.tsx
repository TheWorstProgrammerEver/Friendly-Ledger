import { useEffect, useRef, useState } from 'react'
import { parseMoneyToCents } from '../../domain/money'
import type { EntryFormInput } from '../EntryForm/EntryForm'
import styles from './ShortcutEntryForm.module.scss'

type ShortcutEntryFormProps = {
  formId: string
  today: string
  category: string
  defaultAmountCents?: number
  description: string
  effect: 'positive' | 'negative'
  onAdd: (input: EntryFormInput) => void | Promise<void>
}

const amountForInput = (amountCents?: number) => (
  amountCents ? (Math.abs(amountCents) / 100).toFixed(2) : ''
)

export const ShortcutEntryForm = ({
  formId,
  today,
  category,
  defaultAmountCents,
  description,
  effect,
  onAdd
}: ShortcutEntryFormProps) => {
  const amountRef = useRef<HTMLInputElement>(null)
  const [amount, setAmount] = useState(amountForInput(defaultAmountCents))

  useEffect(() => {
    const animationFrameId = window.requestAnimationFrame(() => {
      amountRef.current?.focus()
    })

    return () => window.cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <form
      id={formId}
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        void onAdd({
          date: today,
          description,
          category,
          amountCents: parseMoneyToCents(amount) * (effect === 'negative' ? -1 : 1)
        })
      }}
    >
      <label>
        Amount
        <input
          autoFocus
          ref={amountRef}
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
