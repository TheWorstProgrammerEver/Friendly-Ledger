export type RecurringFrequency = 'weekly' | 'fortnightly' | 'monthly'

export type EntryInput = {
  date: string
  description: string
  category: string
  amountCents: number
}

export type RecurringInput = {
  title: string
  category: string
  amountCents: number
  frequency: RecurringFrequency
  startDate: string
  endDate?: string
}

export type EntryShortcutEffect = 'positive' | 'negative'

export type EntryShortcutInput = {
  label: string
  emoji: string
  description: string
  category: string
  effect: EntryShortcutEffect
  defaultAmountCents?: number
}
