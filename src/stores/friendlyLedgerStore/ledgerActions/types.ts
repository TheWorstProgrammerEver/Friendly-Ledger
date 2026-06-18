import type { IRequest } from '../../../../lib/dispatch/dispatch'
import type { Group } from '../../../types/ledger'
import type { LedgerStateProjection } from '../ledgerStateUpdates'

export type LedgerActionRunner = <TResult, TParams>(
  request: IRequest<TResult, TParams>,
  applyResult: LedgerStateProjection<TResult>
) => Promise<TResult | undefined>

export type ActiveGroupActionDeps = {
  activeGroup?: Group
  reloadLedgerState: (activeGroupId?: string) => Promise<unknown>
  runLedgerAction: LedgerActionRunner
}
