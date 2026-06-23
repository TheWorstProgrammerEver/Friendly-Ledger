import { useProfileScreenViewModel } from './useProfileScreenViewModel'
import styles from './ProfileScreen.module.scss'

const displayDate = (isoDate?: string) => (
  isoDate ? new Date(isoDate).toLocaleDateString() : 'Never'
)

export const ProfileScreen = () => {
  const viewModel = useProfileScreenViewModel()

  return (
    <section className={styles.screen} aria-labelledby="profile-title">
      <header>
        <h2 id="profile-title">Profile</h2>
      </header>

      <dl>
        <div>
          <dt>Name</dt>
          <dd>{viewModel.currentAccount?.name}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{viewModel.currentAccount?.email}</dd>
        </div>
      </dl>

      <section className={styles.passkeys} aria-labelledby="passkeys-title">
        <header>
          <h3 id="passkeys-title">Passkeys</h3>
          <button
            type="button"
            aria-busy={viewModel.passkeyBusy}
            disabled={viewModel.passkeyBusy}
            onClick={() => void viewModel.registerPasskey()}
          >
            Add passkey
          </button>
        </header>

        {viewModel.passkeyError && (
          <p className={styles.error} role="alert">
            {viewModel.passkeyError}
          </p>
        )}

        {viewModel.passkeyNotice && (
          <p className={styles.notice} role="status">
            {viewModel.passkeyNotice}
          </p>
        )}

        {viewModel.passkeys.length === 0 ? (
          <p>No passkeys registered.</p>
        ) : (
          <ul>
            {viewModel.passkeys.map((passkey) => (
              <li key={passkey.id}>
                <span>
                  <strong>{passkey.friendlyName ?? 'Passkey'}</strong>
                  <small>
                    Created {displayDate(passkey.createdAt)} · Last used {displayDate(passkey.lastUsedAt)}
                  </small>
                </span>
                <span className={styles.passkeyActions}>
                  <button
                    type="button"
                    disabled={viewModel.passkeyBusy}
                    onClick={() => void viewModel.renamePasskey(passkey)}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    disabled={viewModel.passkeyBusy}
                    onClick={() => viewModel.deletePasskey(passkey.id)}
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button type="button" onClick={() => void viewModel.signOut()}>Log out</button>
    </section>
  )
}
