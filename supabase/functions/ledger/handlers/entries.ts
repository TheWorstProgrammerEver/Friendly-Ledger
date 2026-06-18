import { ledgerRequestIdentifiers } from '../../../../common/ledgerRequestIdentifiers.ts'
import type { EntryInput } from '../../../../common/ledgerTypes.ts'
import { HttpError, todayIso, trimOrDefault } from '../helpers.ts'
import { ledgerEntryFromRow } from '../mappers.ts'
import { getProfile } from '../profile.ts'
import type { LedgerEntryRow } from '../types/rows.ts'
import { createLedgerRequestHandlerFactory } from './handlerFactory.ts'

type EntryParams = {
  groupId: string
  input: EntryInput
}

type DeleteEntryParams = {
  groupId: string
  entryId: string
}

export const createAddEntryHandler = createLedgerRequestHandlerFactory(ledgerRequestIdentifiers.addEntry, ({ client, user }) =>
  async (request) => {
    const { groupId, input } = request.params as EntryParams

    if (!groupId || input.amountCents === 0) {
      throw new HttpError(400, 'Entries need a group and non-zero amount.')
    }

    const profile = await getProfile(client, user)
    const entryId = crypto.randomUUID()
    const createdDate = todayIso()
    const entry: LedgerEntryRow = {
      id: entryId,
      group_id: groupId,
      entry_date: input.date,
      description: trimOrDefault(input.description, 'Ledger entry'),
      category: trimOrDefault(input.category, 'General'),
      amount_cents: input.amountCents,
      created_by_profile_id: profile.id,
      created_by_name: profile.display_name,
      created_date: createdDate
    }
    const { error } = await client
      .from('ledger_entries')
      .insert(entry)

    if (error) {
      throw error
    }

    return ledgerEntryFromRow(entry)
  })

export const createDeleteEntryHandler = createLedgerRequestHandlerFactory(ledgerRequestIdentifiers.deleteEntry, ({ client }) =>
  async (request) => {
    const { groupId, entryId } = request.params as DeleteEntryParams

    if (!groupId || !entryId) {
      throw new HttpError(400, 'Choose an entry to delete.')
    }

    const { error } = await client
      .from('ledger_entries')
      .delete()
      .eq('id', entryId)
      .eq('group_id', groupId)

    if (error) {
      throw error
    }

    return { groupId, entryId }
  })
