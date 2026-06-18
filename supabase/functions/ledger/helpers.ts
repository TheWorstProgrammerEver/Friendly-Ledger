export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const nameFromEmail = (email: string) => {
  const [name] = email.split('@')

  return name || 'Friend'
}

export const todayIso = () => new Date().toISOString().slice(0, 10)

export const trimOrDefault = (value: string | undefined, fallback: string) => {
  const trimmed = value?.trim()

  return trimmed || fallback
}

export const uniqueEmails = (emails: string[], currentEmail: string) => Array.from(new Set(
  emails
    .map(normalizeEmail)
    .filter((email) => email && email !== currentEmail)
))

export const selectRows = async <T>(promise: PromiseLike<{ data: T[] | null; error: unknown }>) => {
  const { data, error } = await promise

  if (error) {
    throw error
  }

  return data ?? []
}

export const errorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error) {
    const candidate = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown }
    const parts = [candidate.message, candidate.details, candidate.hint, candidate.code]
      .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)

    if (parts.length > 0) {
      return parts.join(' ')
    }
  }

  return 'Ledger request failed.'
}
