import { Check, X } from 'lucide-react'
import { ActionGroup } from '../../../lib/ui/ActionGroup/ActionGroup'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { ResponsiveButton } from '../../../lib/ui/ResponsiveButton/ResponsiveButton'
import type { LedgerViewModel } from '../../stores/friendlyLedgerStore/useLedgerViewModel'
import styles from './InvitationPanel.module.scss'

type InvitationPanelProps = {
  viewModel: LedgerViewModel
}

export const InvitationPanel = ({ viewModel }: InvitationPanelProps) => {
  if (viewModel.pendingInvitations.length === 0) {
    return null
  }

  return (
    <section className={styles.panel} aria-labelledby="invites-title">
      <h2 id="invites-title">Invitations</h2>

      <ul>
        {viewModel.pendingInvitations.map((invitation) => (
          <li key={invitation.id}>
            <span>{invitation.groupName}</span>
            <ActionGroup ariaLabel={`${invitation.groupName} invitation actions`}>
              <ComponentRoleContext role="primary">
                <ResponsiveButton
                  type="button"
                  icon={<Check />}
                  label="Accept"
                  onClick={() => viewModel.acceptInvitation(invitation.id)}
                />
              </ComponentRoleContext>
              <ComponentRoleContext role="destructive">
                <ResponsiveButton
                  type="button"
                  icon={<X />}
                  label="Reject"
                  onClick={() => viewModel.rejectInvitation(invitation.id)}
                />
              </ComponentRoleContext>
            </ActionGroup>
          </li>
        ))}
      </ul>
    </section>
  )
}
