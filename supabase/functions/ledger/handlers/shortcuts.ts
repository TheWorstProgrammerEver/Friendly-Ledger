import { ledgerRequestIdentifiers } from '../../../../common/ledgerRequestIdentifiers.ts'
import type { EntryShortcutInput } from '../../../../common/ledgerTypes.ts'
import { HttpError, todayIso, trimOrDefault } from '../helpers.ts'
import { entryShortcutFromRow } from '../mappers.ts'
import type { EntryShortcutRow } from '../types/rows.ts'
import { createLedgerRequestHandlerFactory } from './handlerFactory.ts'

type ShortcutParams = {
  groupId: string
  input: EntryShortcutInput
}

type DeleteShortcutParams = {
  groupId: string
  shortcutId: string
}

export const createAddEntryShortcutHandler = createLedgerRequestHandlerFactory(ledgerRequestIdentifiers.addEntryShortcut, ({ client }) =>
  async (request) => {
    const { groupId, input } = request.params as ShortcutParams

    if (!groupId) {
      throw new HttpError(400, 'Choose a group before adding a shortcut.')
    }

    const defaultAmountCents = typeof input.defaultAmountCents === 'number' && Number.isFinite(input.defaultAmountCents)
      ? Math.abs(Math.round(input.defaultAmountCents)) * (input.effect === 'negative' ? -1 : 1)
      : null

    const shortcut: EntryShortcutRow = {
      id: crypto.randomUUID(),
      group_id: groupId,
      label: trimOrDefault(input.label, input.description?.trim() || 'Entry shortcut'),
      emoji: trimOrDefault(input.emoji, '⚡'),
      description: trimOrDefault(input.description, input.label?.trim() || 'Ledger entry'),
      category: trimOrDefault(input.category, 'General'),
      effect: input.effect,
      default_amount_cents: defaultAmountCents,
      created_date: todayIso()
    }
    const { error } = await client
      .from('entry_shortcuts')
      .insert(shortcut)

    if (error) {
      throw error
    }

    return entryShortcutFromRow(shortcut)
  })

export const createDeleteEntryShortcutHandler = createLedgerRequestHandlerFactory(ledgerRequestIdentifiers.deleteEntryShortcut, ({ client }) =>
  async (request) => {
    const { groupId, shortcutId } = request.params as DeleteShortcutParams

    if (!groupId || !shortcutId) {
      throw new HttpError(400, 'Choose a shortcut to delete.')
    }

    const { error } = await client
      .from('entry_shortcuts')
      .delete()
      .eq('id', shortcutId)
      .eq('group_id', groupId)

    if (error) {
      throw error
    }

    return { groupId, shortcutId }
  })
