import type { LedgerViewModel } from '../../state/useLedgerViewModel'
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
            <button type="button" onClick={() => viewModel.acceptInvitation(invitation.id)}>
              Accept
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
