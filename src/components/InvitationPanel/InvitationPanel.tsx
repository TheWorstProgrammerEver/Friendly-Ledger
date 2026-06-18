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
              <button type="button" onClick={() => viewModel.acceptInvitation(invitation.id)}>
                Accept
              </button>
              <button type="button" onClick={() => viewModel.rejectInvitation(invitation.id)}>
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
