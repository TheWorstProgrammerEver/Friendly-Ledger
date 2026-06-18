export type AuthenticationType = 'emailPassword' | 'magicLink' | 'otp'

export type SupportedAuthenticationTypes = Record<AuthenticationType, boolean>

const defaultSupportedAuthenticationTypes: SupportedAuthenticationTypes = {
  emailPassword: true,
  magicLink: false,
  otp: false
}

const authTypeOrder: AuthenticationType[] = ['emailPassword', 'otp', 'magicLink']

export const getSupportedAuthenticationTypes = (): SupportedAuthenticationTypes => {
  const configured = typeof window === 'undefined'
    ? undefined
    : window.config?.auth?.supportedTypes
  const supportedTypes = {
    ...defaultSupportedAuthenticationTypes,
    ...configured
  }

  if (authTypeOrder.some((type) => supportedTypes[type])) {
    return supportedTypes
  }

  return defaultSupportedAuthenticationTypes
}

export const getEnabledAuthenticationTypes = (supportedTypes: SupportedAuthenticationTypes) => (
  authTypeOrder.filter((type) => supportedTypes[type])
)

export const getDefaultAuthenticationType = (supportedTypes: SupportedAuthenticationTypes) => (
  getEnabledAuthenticationTypes(supportedTypes)[0] ?? 'emailPassword'
)
