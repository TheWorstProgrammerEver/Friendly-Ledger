import { useState } from 'react'
import styles from './AuthPanel.module.scss'

type AuthPanelProps = {
  onSubmit: (email: string, name: string, password: string) => void
}

export const AuthPanel = ({ onSubmit }: AuthPanelProps) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const submit = () => {
    if (email.trim()) {
      onSubmit(email, name, password)
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="auth-title">
      <header>
        <p>{window.config?.environment ?? 'local'}</p>
        <h1 id="auth-title">{window.config?.appName ?? 'Friendly Ledger'}</h1>
      </header>

      <form onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}>
        <label>
          Email
          <input
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Name
          <input
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <div className={styles.actions}>
          <button type="submit">Sign in</button>
          <button type="button" onClick={submit}>Create account</button>
        </div>
      </form>
    </section>
  )
}
