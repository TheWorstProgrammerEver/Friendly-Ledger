import { useState } from 'react'
import styles from './GroupCreator.module.scss'

type GroupCreatorProps = {
  formId: string
  onCreateGroup: (name: string, inviteEmails: string[]) => void
}

const splitEmails = (value: string) => value
  .split(/[\n,]/)
  .map((email) => email.trim())
  .filter(Boolean)

export const GroupCreator = ({ formId, onCreateGroup }: GroupCreatorProps) => {
  const [name, setName] = useState('')
  const [inviteEmails, setInviteEmails] = useState('')

  return (
    <form
      id={formId}
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        onCreateGroup(name, splitEmails(inviteEmails))
        setName('')
        setInviteEmails('')
      }}
    >
      <label>
        Group name
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <label>
        Invite emails
        <textarea
          rows={3}
          value={inviteEmails}
          onChange={(event) => setInviteEmails(event.target.value)}
        />
      </label>
    </form>
  )
}
