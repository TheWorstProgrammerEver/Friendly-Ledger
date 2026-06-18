import { ledgerRequestIdentifiers } from '../../../../common/ledgerRequestIdentifiers.ts'
import type { RecurringInput } from '../../../../common/ledgerTypes.ts'
import { HttpError, todayIso, trimOrDefault } from '../helpers.ts'
import { recurringItemFromRow } from '../mappers.ts'
import type { RecurringItemRow } from '../types/rows.ts'
import { createLedgerRequestHandlerFactory } from './handlerFactory.ts'

type RecurringParams = {
  groupId: string
  input: RecurringInput
}

type UpdateRecurringParams = RecurringParams & {
  itemId: string
}

type DeleteRecurringParams = {
  groupId: string
  itemId: string
}

const recurringPayload = (groupId: string, input: RecurringInput) => {
  if (!groupId || input.amountCents === 0) {
    throw new HttpError(400, 'Recurring rules need a group and non-zero amount.')
  }

  return {
    group_id: groupId,
    title: trimOrDefault(input.title, input.category?.trim() || 'Recurring item'),
    category: trimOrDefault(input.category, 'General'),
    amount_cents: input.amountCents,
    frequency: input.frequency,
    start_date: input.startDate,
    end_date: input.endDate || null,
    active: true
  }
}

export const createAddRecurringItemHandler = createLedgerRequestHandlerFactory(ledgerRequestIdentifiers.addRecurringItem, ({ client }) =>
  async (request) => {
    const { groupId, input } = request.params as RecurringParams
    const item: RecurringItemRow = {
      id: crypto.randomUUID(),
      ...recurringPayload(groupId, input),
      created_date: todayIso()
    }
    const { error } = await client
      .from('recurring_items')
      .insert(item)

    if (error) {
      throw error
    }

    return recurringItemFromRow(item)
  })

export const createUpdateRecurringItemHandler = createLedgerRequestHandlerFactory(ledgerRequestIdentifiers.updateRecurringItem, ({ client }) =>
  async (request) => {
    const { groupId, itemId, input } = request.params as UpdateRecurringParams
    const { data, error } = await client
      .from('recurring_items')
      .update(recurringPayload(groupId, input))
      .eq('id', itemId)
      .eq('group_id', groupId)
      .select('id, group_id, title, category, amount_cents, frequency, start_date, end_date, active, created_date')
      .maybeSingle<RecurringItemRow>()

    if (error) {
      throw error
    }

    if (!data) {
      throw new HttpError(404, 'Recurring rule not found.')
    }

    return recurringItemFromRow(data)
  })

export const createDeleteRecurringItemHandler = createLedgerRequestHandlerFactory(ledgerRequestIdentifiers.deleteRecurringItem, ({ client }) =>
  async (request) => {
    const { groupId, itemId } = request.params as DeleteRecurringParams

    if (!groupId || !itemId) {
      throw new HttpError(400, 'Choose a recurring rule to delete.')
    }

    const { error } = await client
      .from('recurring_items')
      .delete()
      .eq('id', itemId)
      .eq('group_id', groupId)

    if (error) {
      throw error
    }

    return { groupId, itemId }
  })
