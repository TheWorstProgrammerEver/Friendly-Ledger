import { useState } from 'react'
import { getEnabledAuthenticationTypes } from '../../auth/authenticationTypes'
import { CreateAccountForm } from './CreateAccountForm'
import { SignInForm } from './SignInForm'
import type { AuthPanelProps } from './AuthPanelTypes'
import styles from './AuthPanel.module.scss'

type AuthMode = 'create' | 'sign-in'

export const AuthPanel = (props: AuthPanelProps) => {
  const { appName, environment, onStatusClear, supportedTypes } = props
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const enabledTypes = getEnabledAuthenticationTypes(supportedTypes)
  const signingIn = mode === 'sign-in'

  const setAuthMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    onStatusClear()
  }

  return (
    <section className={styles.panel} aria-labelledby="auth-title">
      <header className={styles.brand}>
        <span className={styles.mark} aria-hidden="true">FL</span>
        <p>{environment}</p>
        <h1 id="auth-title">{signingIn ? 'Sign In' : 'Create Account'}</h1>
      </header>

      <div className={styles.card}>
        {enabledTypes.length === 0 ? (
          <p className={styles.error} role="alert">No authentication methods are enabled.</p>
        ) : signingIn ? (
          <SignInForm {...props} />
        ) : (
          <CreateAccountForm {...props} />
        )}
      </div>

      <footer className={styles.switcher}>
        {signingIn ? (
          <p>New to {appName}? <button type="button" onClick={() => setAuthMode('create')}>Create an account</button></p>
        ) : (
          <p>Already have an account? <button type="button" onClick={() => setAuthMode('sign-in')}>Sign in</button></p>
        )}
      </footer>
    </section>
  )
}
