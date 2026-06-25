import { useState } from 'react'
import { FormGrid } from '../../../lib/ui/FormGrid/FormGrid'

type InviteMemberFormProps = {
  formId: string
  onInvite: (email: string) => void | Promise<void>
}

export const InviteMemberForm = ({ formId, onInvite }: InviteMemberFormProps) => {
  const [email, setEmail] = useState('')

  return (
    <FormGrid id={formId} singleColumn onSubmit={(event) => {
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
    </FormGrid>
  )
}
