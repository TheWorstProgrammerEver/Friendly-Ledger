import { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLoader } from '../../../lib/hooks/useLoader'
import { useLedgerContext } from '../../contexts/LedgerContext'

const createGroupFormId = 'create-group-form'

export const useManageGroupsScreenViewModel = () => {
  const ledger = useLedgerContext()
  const createGroupLoader = useLoader()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const creatingGroup = searchParams.get('dialog') === 'create-group'

  const closeCreateGroup = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const createGroup = useCallback(async (name: string, emails: string[]) => {
    await createGroupLoader.execute(async () => {
      const groupId = await ledger.createGroup(name, emails)

      if (groupId) {
        closeCreateGroup()
        navigate(`/groups/${groupId}`)
      }
    })
  }, [closeCreateGroup, createGroupLoader, ledger, navigate])

  const openCreateGroup = useCallback(() => {
    setSearchParams({ dialog: 'create-group' })
  }, [setSearchParams])

  return {
    closeCreateGroup,
    createGroup,
    createGroupFormId,
    createGroupLoader,
    creatingGroup,
    groups: ledger.state.groups,
    invitationViewModel: ledger,
    ledgerLoad: ledger.ledgerLoad,
    openCreateGroup
  }
}
