import { useState } from 'react'
import { FormGrid } from '../../../lib/ui/FormGrid/FormGrid'

type GroupCreatorProps = {
  formId: string
  onCreateGroup: (name: string, inviteEmails: string[]) => void | Promise<void>
}

const splitEmails = (value: string) => value
  .split(/[\n,]/)
  .map((email) => email.trim())
  .filter(Boolean)

export const GroupCreator = ({ formId, onCreateGroup }: GroupCreatorProps) => {
  const [name, setName] = useState('')
  const [inviteEmails, setInviteEmails] = useState('')

  return (
    <FormGrid
      id={formId}
      singleColumn
      onSubmit={(event) => {
        event.preventDefault()
        void onCreateGroup(name, splitEmails(inviteEmails))
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
    </FormGrid>
  )
}
