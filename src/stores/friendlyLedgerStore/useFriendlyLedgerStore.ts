import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CreateLedgerGroupCommand,
  LoadLedgerQuery
} from '../../data/ledger/requests'
import { ledgerDispatcher } from '../../data/ledger/ledgerDispatcher'
import type { IRequest } from '../../../lib/dispatch/dispatch'
import { useLoader } from '../../../lib/hooks/useLoader'
import type { Account } from '../../types/auth'
import type { FriendlyLedgerState } from '../../types/ledger'
import { useEntryActions } from './ledgerActions/useEntryActions'
import { useInvitationActions } from './ledgerActions/useInvitationActions'
import { useRecurringActions } from './ledgerActions/useRecurringActions'
import { useShortcutActions } from './ledgerActions/useShortcutActions'
import type { LedgerStateProjection } from './ledgerStateUpdates'
import { withCreatedGroup } from './ledgerStateUpdates'

const emptyState: FriendlyLedgerState = {
  groups: [],
  pendingInvitations: []
}

const errorMessage = (error: unknown) => (
  error instanceof Error ? error.message : 'Ledger request failed.'
)

export const useFriendlyLedgerStore = (currentAccount?: Account) => {
  const [state, setState] = useState<FriendlyLedgerState>(emptyState)
  const ledgerLoad = useLoader({ getErrorMessage: errorMessage })
  const ledgerLoadState = useMemo(() => ({
    ...ledgerLoad,
    busy: Boolean(currentAccount) && (!ledgerLoad.settled || ledgerLoad.busy)
  }), [currentAccount, ledgerLoad])

  const reloadLedgerState = useCallback(async (activeGroupId?: string) => {
    try {
      const nextState = await ledgerLoad.execute(() => ledgerDispatcher.dispatch(new LoadLedgerQuery({ activeGroupId })))
      setState(nextState)

      return nextState
    } catch {
      setState(emptyState)

      return undefined
    }
  }, [ledgerLoad.execute])

  useEffect(() => {
    let active = true

    if (!currentAccount) {
      setState(emptyState)
      ledgerLoad.clearError()

      return () => {
        active = false
      }
    }

    void ledgerLoad.execute(() => ledgerDispatcher.dispatch(new LoadLedgerQuery({})))
      .then((nextState) => {
        if (active) {
          setState(nextState)
        }
      })
      .catch(() => {
        if (active) {
          setState(emptyState)
        }
      })

    return () => {
      active = false
    }
  }, [currentAccount, ledgerLoad.clearError, ledgerLoad.execute])

  const runLedgerAction = useCallback(async <TResult, TParams>(
    request: IRequest<TResult, TParams>,
    applyResult: LedgerStateProjection<TResult>
  ) => {
    try {
      const result = await ledgerDispatcher.dispatch(request)
      setState((currentState) => applyResult(currentState, result))

      return result
    } catch {
      return undefined
    }
  }, [])

  const activeGroup = useMemo(
    () => state.groups.find((group) => group.id === state.activeGroupId) ?? state.groups[0],
    [state.activeGroupId, state.groups]
  )
  const actionDeps = useMemo(() => ({
    activeGroup,
    reloadLedgerState,
    runLedgerAction
  }), [activeGroup, reloadLedgerState, runLedgerAction])
  const entryActions = useEntryActions(actionDeps)
  const invitationActions = useInvitationActions(actionDeps)
  const recurringActions = useRecurringActions(actionDeps)
  const shortcutActions = useShortcutActions(actionDeps)

  const createGroup = useCallback(async (name: string, inviteEmails: string[]) => {
    if (!currentAccount) {
      return undefined
    }

    const result = await runLedgerAction(
      new CreateLedgerGroupCommand({ name, inviteEmails }),
      withCreatedGroup
    )

    return result?.group.id
  }, [currentAccount, runLedgerAction])

  const selectGroup = useCallback((groupId: string) => {
    setState((currentState) => (
      currentState.activeGroupId === groupId
        ? currentState
        : { ...currentState, activeGroupId: groupId }
    ))
  }, [])

  return {
    state,
    currentAccount,
    activeGroup,
    ...entryActions,
    ...invitationActions,
    ...recurringActions,
    ...shortcutActions,
    createGroup,
    ledgerLoad: ledgerLoadState,
    selectGroup
  }
}
