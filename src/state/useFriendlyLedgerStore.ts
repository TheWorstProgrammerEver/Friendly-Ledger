import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadFriendlyLedgerState, saveFriendlyLedgerState } from '../data/localLedgerStore'
import { todayIso } from '../domain/date'
import { normalizeEmail, nameFromEmail } from '../domain/people'
import type { EntryShortcut, FriendlyLedgerState, LedgerEntry, RecurringFrequency } from '../types'
import { createId } from '../utils/id'

type EntryInput = {
  date: string
  description: string
  category: string
  amountCents: number
}

type RecurringInput = {
  title: string
  category: string
  amountCents: number
  frequency: RecurringFrequency
  startDate: string
  endDate?: string
}

type EntryShortcutInput = {
  label: string
  description: string
  category: string
  effect: 'positive' | 'negative'
}

export const useFriendlyLedgerStore = () => {
  const [state, setState] = useState(loadFriendlyLedgerState)

  useEffect(() => saveFriendlyLedgerState(state), [state])

  const currentAccount = useMemo(
    () => state.accounts.find((account) => account.id === state.currentAccountId),
    [state.accounts, state.currentAccountId]
  )

  const activeGroup = useMemo(
    () => state.groups.find((group) => group.id === state.activeGroupId) ?? state.groups[0],
    [state.activeGroupId, state.groups]
  )

  const signIn = useCallback((email: string, name: string) => {
    const normalizedEmail = normalizeEmail(email)
    const today = todayIso()

    setState((currentState) => {
      const existingAccount = currentState.accounts.find((account) => account.email === normalizedEmail)
      const account = existingAccount ?? {
        id: createId('account'),
        name: name.trim() || nameFromEmail(normalizedEmail),
        email: normalizedEmail,
        createdDate: today
      }

      return {
        ...currentState,
        accounts: existingAccount ? currentState.accounts : [...currentState.accounts, account],
        currentAccountId: account.id
      }
    })
  }, [])

  const signOut = useCallback(() => {
    setState((currentState) => ({ ...currentState, currentAccountId: undefined }))
  }, [])

  const createGroup = useCallback((name: string, inviteEmails: string[]) => {
    if (!currentAccount) {
      return undefined
    }

    const today = todayIso()
    const groupId = createId('group')
    const invitedEmails = Array.from(new Set(
      inviteEmails
        .map(normalizeEmail)
        .filter((email) => email && email !== currentAccount.email)
    ))

    setState((currentState) => ({
      ...currentState,
      groups: [
        ...currentState.groups,
        {
          id: groupId,
          name: name.trim() || 'House ledger',
          members: [
            {
              id: createId('member'),
              accountId: currentAccount.id,
              name: currentAccount.name,
              email: currentAccount.email,
              status: 'active'
            },
            ...invitedEmails.map((email) => ({
              id: createId('member'),
              name: nameFromEmail(email),
              email,
              status: 'invited' as const
            }))
          ],
          invitations: invitedEmails.map((email) => ({
            id: createId('invite'),
            groupId,
            email,
            status: 'pending' as const,
            invitedDate: today
          })),
          entries: [],
          entryShortcuts: [],
          recurringItems: [],
          createdDate: today
        }
      ],
      activeGroupId: groupId
    }))

    return groupId
  }, [currentAccount])

  const selectGroup = useCallback((groupId: string) => {
    setState((currentState) => (
      currentState.activeGroupId === groupId
        ? currentState
        : { ...currentState, activeGroupId: groupId }
    ))
  }, [])

  const inviteMemberToGroup = useCallback((groupId: string, email: string) => {
    if (!groupId) {
      return
    }

    const normalizedEmail = normalizeEmail(email)
    const today = todayIso()

    setState((currentState) => ({
      ...currentState,
      groups: currentState.groups.map((group) => {
        if (group.id !== groupId || !normalizedEmail) {
          return group
        }

        if (group.members.some((member) => member.email === normalizedEmail)) {
          return group
        }

        return {
          ...group,
          members: [
            ...group.members,
            { id: createId('member'), name: nameFromEmail(normalizedEmail), email: normalizedEmail, status: 'invited' }
          ],
          invitations: [
            ...group.invitations,
            { id: createId('invite'), groupId: group.id, email: normalizedEmail, status: 'pending', invitedDate: today }
          ]
        }
      })
    }))
  }, [])

  const inviteMember = useCallback((email: string) => {
    if (activeGroup) {
      inviteMemberToGroup(activeGroup.id, email)
    }
  }, [activeGroup, inviteMemberToGroup])

  const acceptInvitation = useCallback((invitationId: string) => {
    if (!currentAccount) {
      return
    }

    const today = todayIso()

    setState((currentState) => ({
      ...currentState,
      groups: currentState.groups.map((group) => ({
        ...group,
        members: group.invitations.some((invitation) => invitation.id === invitationId)
          ? group.members.map((member) => member.email === currentAccount.email
            ? { ...member, accountId: currentAccount.id, name: currentAccount.name, status: 'active' }
            : member)
          : group.members,
        invitations: group.invitations.map((invitation) => invitation.id === invitationId
          ? { ...invitation, status: 'accepted', acceptedDate: today, acceptedByAccountId: currentAccount.id }
          : invitation)
      })),
      activeGroupId: currentState.groups.find((group) => group.invitations.some((invitation) => invitation.id === invitationId))?.id
        ?? currentState.activeGroupId
    }))
  }, [currentAccount])

  const addEntryToGroup = useCallback((groupId: string, input: EntryInput) => {
    if (!groupId || input.amountCents === 0) {
      return
    }

    const entry: LedgerEntry = {
      id: createId('entry'),
      groupId,
      date: input.date,
      description: input.description.trim() || 'Ledger entry',
      category: input.category.trim() || 'General',
      amountCents: input.amountCents,
      source: 'manual',
      createdDate: todayIso()
    }

    setState((currentState) => ({
      ...currentState,
      groups: currentState.groups.map((group) => group.id === groupId
        ? { ...group, entries: [entry, ...group.entries] }
        : group)
    }))
  }, [])

  const addEntry = useCallback((input: EntryInput) => {
    if (activeGroup) {
      addEntryToGroup(activeGroup.id, input)
    }
  }, [activeGroup, addEntryToGroup])

  const addEntryShortcutToGroup = useCallback((groupId: string, input: EntryShortcutInput) => {
    if (!groupId) {
      return
    }

    const shortcut: EntryShortcut = {
      id: createId('shortcut'),
      groupId,
      label: input.label.trim() || input.description.trim() || 'Entry shortcut',
      description: input.description.trim() || input.label.trim() || 'Ledger entry',
      category: input.category.trim() || 'General',
      effect: input.effect,
      createdDate: todayIso()
    }

    setState((currentState) => ({
      ...currentState,
      groups: currentState.groups.map((group) => group.id === groupId
        ? { ...group, entryShortcuts: [shortcut, ...(group.entryShortcuts ?? [])] }
        : group)
    }))
  }, [])

  const addEntryShortcut = useCallback((input: EntryShortcutInput) => {
    if (activeGroup) {
      addEntryShortcutToGroup(activeGroup.id, input)
    }
  }, [activeGroup, addEntryShortcutToGroup])

  const addRecurringItemToGroup = useCallback((groupId: string, input: RecurringInput) => {
    if (!groupId || input.amountCents === 0) {
      return
    }

    setState((currentState) => ({
      ...currentState,
      groups: currentState.groups.map((group) => group.id === groupId
        ? {
          ...group,
          recurringItems: [
            {
              id: createId('recurring'),
              groupId,
              title: input.title.trim() || input.category.trim() || 'Recurring item',
              category: input.category.trim() || 'General',
              amountCents: input.amountCents,
              frequency: input.frequency,
              startDate: input.startDate,
              endDate: input.endDate,
              active: true,
              createdDate: todayIso()
            },
            ...group.recurringItems
          ]
        }
        : group)
    }))
  }, [])

  const addRecurringItem = useCallback((input: RecurringInput) => {
    if (activeGroup) {
      addRecurringItemToGroup(activeGroup.id, input)
    }
  }, [activeGroup, addRecurringItemToGroup])

  const updateRecurringItemInGroup = useCallback((groupId: string, itemId: string, input: RecurringInput) => {
    if (!groupId || !itemId || input.amountCents === 0) {
      return
    }

    setState((currentState) => ({
      ...currentState,
      groups: currentState.groups.map((group) => group.id === groupId
        ? {
          ...group,
          recurringItems: group.recurringItems.map((item) => item.id === itemId
            ? {
              ...item,
              title: input.title.trim() || input.category.trim() || 'Recurring item',
              category: input.category.trim() || 'General',
              amountCents: input.amountCents,
              frequency: input.frequency,
              startDate: input.startDate,
              endDate: input.endDate
            }
            : item)
        }
        : group)
    }))
  }, [])

  const updateRecurringItem = useCallback((itemId: string, input: RecurringInput) => {
    if (activeGroup) {
      updateRecurringItemInGroup(activeGroup.id, itemId, input)
    }
  }, [activeGroup, updateRecurringItemInGroup])

  const deleteEntryFromGroup = useCallback((groupId: string, entryId: string) => {
    if (!groupId) {
      return
    }

    setState((currentState) => ({
      ...currentState,
      groups: currentState.groups.map((group) => group.id === groupId
        ? { ...group, entries: group.entries.filter((entry) => entry.id !== entryId) }
        : group)
    }))
  }, [])

  const deleteEntry = useCallback((entryId: string) => {
    if (activeGroup) {
      deleteEntryFromGroup(activeGroup.id, entryId)
    }
  }, [activeGroup, deleteEntryFromGroup])

  const deleteEntryShortcutFromGroup = useCallback((groupId: string, shortcutId: string) => {
    if (!groupId) {
      return
    }

    setState((currentState) => ({
      ...currentState,
      groups: currentState.groups.map((group) => group.id === groupId
        ? { ...group, entryShortcuts: (group.entryShortcuts ?? []).filter((shortcut) => shortcut.id !== shortcutId) }
        : group)
    }))
  }, [])

  const deleteEntryShortcut = useCallback((shortcutId: string) => {
    if (activeGroup) {
      deleteEntryShortcutFromGroup(activeGroup.id, shortcutId)
    }
  }, [activeGroup, deleteEntryShortcutFromGroup])

  const deleteRecurringItemFromGroup = useCallback((groupId: string, itemId: string) => {
    if (!groupId) {
      return
    }

    setState((currentState) => ({
      ...currentState,
      groups: currentState.groups.map((group) => group.id === groupId
        ? { ...group, recurringItems: group.recurringItems.filter((item) => item.id !== itemId) }
        : group)
    }))
  }, [])

  const deleteRecurringItem = useCallback((itemId: string) => {
    if (activeGroup) {
      deleteRecurringItemFromGroup(activeGroup.id, itemId)
    }
  }, [activeGroup, deleteRecurringItemFromGroup])

  return {
    state,
    currentAccount,
    activeGroup,
    addEntry,
    addEntryShortcut,
    addEntryShortcutToGroup,
    addEntryToGroup,
    addRecurringItem,
    addRecurringItemToGroup,
    acceptInvitation,
    createGroup,
    deleteEntry,
    deleteEntryShortcut,
    deleteEntryShortcutFromGroup,
    deleteEntryFromGroup,
    deleteRecurringItem,
    deleteRecurringItemFromGroup,
    inviteMember,
    inviteMemberToGroup,
    selectGroup,
    signIn,
    signOut,
    updateRecurringItem,
    updateRecurringItemInGroup
  }
}
