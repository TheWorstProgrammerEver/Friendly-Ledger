import { KeyRound, LogOut, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../../lib/ui/Button/Button'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { ResponsiveContent } from '../../../lib/ui/ResponsiveContent/ResponsiveContent'
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
          <Button
            type="button"
            aria-busy={viewModel.passkeyBusy}
            disabled={viewModel.passkeyBusy}
            onClick={() => void viewModel.registerPasskey()}
          >
            <ResponsiveContent icon={<KeyRound />}>Add passkey</ResponsiveContent>
          </Button>
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
                  <ComponentRoleContext role="tertiary">
                    <Button
                      type="button"
                      disabled={viewModel.passkeyBusy}
                      onClick={() => void viewModel.renamePasskey(passkey)}
                    >
                      <ResponsiveContent icon={<Pencil />}>Rename</ResponsiveContent>
                    </Button>
                  </ComponentRoleContext>
                  <ComponentRoleContext role="destructive">
                    <Button
                      type="button"
                      disabled={viewModel.passkeyBusy}
                      onClick={() => viewModel.deletePasskey(passkey.id)}
                    >
                      <ResponsiveContent icon={<Trash2 />}>Delete</ResponsiveContent>
                    </Button>
                  </ComponentRoleContext>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ComponentRoleContext role="tertiary">
        <Button type="button" onClick={() => void viewModel.signOut()}>
          <LogOut aria-hidden="true" />
          Log out
        </Button>
      </ComponentRoleContext>
    </section>
  )
}
