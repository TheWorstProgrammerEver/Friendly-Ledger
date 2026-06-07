import { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLedger } from '../../state/LedgerContext'

export const useManageGroupsScreenViewModel = () => {
  const ledger = useLedger()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const creatingGroup = searchParams.get('dialog') === 'create-group'

  const closeCreateGroup = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const createGroup = useCallback((name: string, emails: string[]) => {
    const groupId = ledger.createGroup(name, emails)

    if (groupId) {
      closeCreateGroup()
      navigate(`/groups/${groupId}`)
    }
  }, [closeCreateGroup, ledger, navigate])

  const openCreateGroup = useCallback(() => {
    setSearchParams({ dialog: 'create-group' })
  }, [setSearchParams])

  return {
    closeCreateGroup,
    createGroup,
    creatingGroup,
    groups: ledger.state.groups,
    invitationViewModel: ledger,
    openCreateGroup
  }
}
