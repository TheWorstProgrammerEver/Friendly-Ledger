import { createDispatcher, type IRequest } from '../../../lib/dispatch/dispatch.ts'
import { HttpError, errorMessage } from './helpers.ts'
import { corsHeaders, createUserClient, jsonResponse, requireUser } from './http.ts'
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

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(request) })
  }

  if (request.method !== 'POST') {
    return jsonResponse(request, { error: 'Method not allowed' }, 405)
  }

  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      throw new HttpError(401, 'Sign in before using the ledger.')
    }

    const client = createUserClient(authorization)
    const user = await requireUser(client)
    const dispatcher = createDispatcher(createLedgerRequestHandlers({ client, user }))
    const ledgerRequest = await parseLedgerRequest(request)

    return jsonResponse(request, await dispatcher.dispatch(ledgerRequest))
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 400

    return jsonResponse(request, { error: errorMessage(error) }, status)
  }
})
