import type { RequestHandlers } from '../../../../lib/dispatch/dispatch.ts'
import type { LedgerInvocationContext } from '../types/context.ts'
import { createAddEntryHandler, createDeleteEntryHandler } from './entries.ts'
import { createCreateGroupHandler, createLoadLedgerHandler } from './groups.ts'
import type { LedgerRequestHandlerFactory } from './handlerFactory.ts'
import {
  createAcceptInvitationHandler,
  createInviteMemberHandler,
  createRejectInvitationHandler
} from './invitations.ts'
import {
  createAddRecurringItemHandler,
  createDeleteRecurringItemHandler,
  createUpdateRecurringItemHandler
} from './recurring.ts'
import { createAddEntryShortcutHandler, createDeleteEntryShortcutHandler } from './shortcuts.ts'

const handlerFactories: LedgerRequestHandlerFactory[] = [
  createAcceptInvitationHandler,
  createAddEntryHandler,
  createAddEntryShortcutHandler,
  createAddRecurringItemHandler,
  createCreateGroupHandler,
  createDeleteEntryHandler,
  createDeleteEntryShortcutHandler,
  createDeleteRecurringItemHandler,
  createInviteMemberHandler,
  createLoadLedgerHandler,
  createRejectInvitationHandler,
  createUpdateRecurringItemHandler
]

export const createLedgerRequestHandlers = (context: LedgerInvocationContext): RequestHandlers => (
  Object.fromEntries(handlerFactories.map((factory) => [
    factory.requestIdentifier,
    factory(context)
  ]))
)
