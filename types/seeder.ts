import { DateTime } from 'luxon'

export type AdminInvitationData = {
  id?: number
  inviterId: number
  message?: string | null
  createdAt?: DateTime
  revokedAt?: DateTime | null
  updatedAt?: DateTime | null
} & ({ acceptedAt?: DateTime } | { deniedAt?: DateTime })

export type AdminInvitationSeederData = AdminInvitationData &
  ({ pendingUserId: number } | { userId: number })

export type PendingUserData = {
  id?: number
  email?: string
  createdAt?: DateTime
  updatedAt?: DateTime
  receivedAdminInvitations?: AdminInvitationData[]
}

export type NeighborhoodData = {
  id?: number
  city?: string
  country?: string
  name?: string
  state?: string
  zip?: string | null
  createdAt?: DateTime
  updatedAt?: DateTime
  // adminIds?: number[]
  // userLocations?: NeighborhoodUserLocationData[]
}

export type NeighborhoodSeederData = NeighborhoodData

export type PendingUserSeederData = PendingUserData

export type UserData = {
  id?: number
  sponsorId?: number
  email?: string
  firstName?: string
  isApplicationAdmin?: boolean
  lastName?: string
  middleName?: string | null
  nameSuffix?: string | null
  password?: string
  createdAt?: DateTime
  deactivatedAt?: DateTime | null
  updatedAt?: DateTime
  receivedAdminInvitations?: AdminInvitationData[]
  phoneNumbers?: UserPhoneNumberData[]
}

export type UserSeederData = UserData

export type UserPhoneNumberData = {
  id?: number
  countryCode?: string
  extension?: string | null
  phone?: string
  createdAt?: DateTime
  updatedAt?: DateTime
}

export type UserPhoneNumberSeederData = UserPhoneNumberData & { userId: number }
