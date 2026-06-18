import type { RequestHandler } from '../../../../lib/dispatch/dispatch.ts'
import type { LedgerRequestIdentifier } from '../../../../common/ledgerRequestIdentifiers.ts'
import type { LedgerInvocationContext } from '../types/context.ts'

export type LedgerRequestHandlerFactory = {
  (context: LedgerInvocationContext): RequestHandler
  requestIdentifier: LedgerRequestIdentifier
}

export const createLedgerRequestHandlerFactory = (
  requestIdentifier: LedgerRequestIdentifier,
  createHandler: (context: LedgerInvocationContext) => RequestHandler
): LedgerRequestHandlerFactory => Object.assign(createHandler, { requestIdentifier })
