import { useState } from 'react'
import styles from './InviteMemberForm.module.scss'

type InviteMemberFormProps = {
  formId: string
  onInvite: (email: string) => void | Promise<void>
}

export const InviteMemberForm = ({ formId, onInvite }: InviteMemberFormProps) => {
  const [email, setEmail] = useState('')

  return (
    <form id={formId} className={styles.form} onSubmit={(event) => {
      event.preventDefault()
      void onInvite(email)
    }}>
      <label>
        Invite
        <input
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
    </form>
  )
}
