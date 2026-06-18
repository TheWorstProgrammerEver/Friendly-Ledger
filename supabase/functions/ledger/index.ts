import { createDispatcher, type IRequest } from '../../../lib/dispatch/dispatch.ts'
import { withSupabase } from 'npm:@supabase/server@^1'
import { HttpError, errorMessage } from './helpers.ts'
import { createLedgerRequestHandlers } from './handlers/index.ts'

type LedgerFunctionRequest = {
  identifier?: string
  params?: unknown
}

const parseLedgerRequest = async (request: Request): Promise<IRequest<unknown, unknown>> => {
  const body = await request.json() as LedgerFunctionRequest

  if (!body.identifier) {
    throw new HttpError(400, 'Ledger request identifier is required.')
  }

  return {
    identifier: body.identifier,
    params: body.params
  }
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (request, context) => {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 })
    }

    try {
      const { data, error } = await context.supabase.auth.getUser()

      if (error || !data.user) {
        throw new HttpError(401, 'Sign in before using the ledger.')
      }

      const dispatcher = createDispatcher(createLedgerRequestHandlers({
        client: context.supabase,
        user: data.user
      }))
      const ledgerRequest = await parseLedgerRequest(request)

      return Response.json(await dispatcher.dispatch(ledgerRequest))
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 400

      return Response.json({ error: errorMessage(error) }, { status })
    }
  })
}
