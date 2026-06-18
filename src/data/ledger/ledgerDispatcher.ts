import { createDispatcher, createRequestHandlers } from '../../../lib/dispatch/dispatch'
import { createSupabaseFunctionInvokerRequestHandler } from '../supabaseFunctionInvokerRequestHandler'
import { supabase } from '../supabaseClient'
import { ledgerRequestTypes } from './requests'

const ledgerFunctionInvoker = createSupabaseFunctionInvokerRequestHandler(supabase, 'ledger')

const handlers = createRequestHandlers(ledgerRequestTypes.map((requestType) => ({
  identifier: requestType.identifier,
  handler: ledgerFunctionInvoker
})))

export const ledgerDispatcher = createDispatcher(handlers)
