import { useCallback } from 'react'
import {
  AcceptLedgerInvitationCommand,
  InviteLedgerMemberCommand,
  RejectLedgerInvitationCommand
} from '../../../data/ledger/requests'
import { withAcceptedInvitation, withInvitedMember, withRejectedInvitation } from '../ledgerStateUpdates'
import type { ActiveGroupActionDeps } from './types'

export const useInvitationActions = ({ activeGroup, reloadLedgerState, runLedgerAction }: ActiveGroupActionDeps) => {
  const inviteMemberToGroup = useCallback((groupId: string, email: string) => {
    if (!groupId) {
      return
    }

    return runLedgerAction(new InviteLedgerMemberCommand({ groupId, email }), withInvitedMember)
  }, [runLedgerAction])

  const inviteMember = useCallback((email: string) => {
    if (activeGroup) {
      return inviteMemberToGroup(activeGroup.id, email)
    }
  }, [activeGroup, inviteMemberToGroup])

  const acceptInvitation = useCallback(async (invitationId: string) => {
    const result = await runLedgerAction(new AcceptLedgerInvitationCommand({ invitationId }), withAcceptedInvitation)

    if (result) {
      await reloadLedgerState(result.groupId)
    }

    return result
  }, [reloadLedgerState, runLedgerAction])

  const rejectInvitation = useCallback((invitationId: string) => (
    runLedgerAction(new RejectLedgerInvitationCommand({ invitationId }), withRejectedInvitation)
  ), [runLedgerAction])

  return {
    acceptInvitation,
    inviteMember,
    inviteMemberToGroup,
    rejectInvitation
  }
}
