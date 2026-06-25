import { Check, X } from 'lucide-react'
import { Button } from '../../../lib/ui/Button/Button'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { ResponsiveContent } from '../../../lib/ui/ResponsiveContent/ResponsiveContent'
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
            <div className={styles.actions}>
              <ComponentRoleContext role="primary">
                <Button type="button" onClick={() => viewModel.acceptInvitation(invitation.id)}>
                  <ResponsiveContent icon={<Check />}>Accept</ResponsiveContent>
                </Button>
              </ComponentRoleContext>
              <ComponentRoleContext role="destructive">
                <Button type="button" onClick={() => viewModel.rejectInvitation(invitation.id)}>
                  <ResponsiveContent icon={<X />}>Reject</ResponsiveContent>
                </Button>
              </ComponentRoleContext>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
