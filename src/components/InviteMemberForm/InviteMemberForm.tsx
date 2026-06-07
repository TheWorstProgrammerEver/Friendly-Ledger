import { useState } from 'react'
import styles from './InviteMemberForm.module.scss'

type InviteMemberFormProps = {
  onInvite: (email: string) => void
}

export const InviteMemberForm = ({ onInvite }: InviteMemberFormProps) => {
  const [email, setEmail] = useState('')

  return (
    <form className={styles.form} onSubmit={(event) => {
      event.preventDefault()
      onInvite(email)
      setEmail('')
    }}>
      <label>
        Invite
        <input
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <button type="submit">Invite</button>
    </form>
  )
}
