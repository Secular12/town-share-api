import AdminInvitation from '#models/admin_invitation'
import Neighborhood from '#models/neighborhood'
import NeighborhoodAdminInvitation from '#models/neighborhood_admin_invitation'
import PendingUser from '#models/pending_user'
import User from '#models/user'
import UserPhoneNumber from '#models/user_phone_number'
import { ModelAttributes } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'

export type AdminInvitationData = {
  data: Omit<Partial<ModelAttributes<AdminInvitation>>, 'acceptedAt' | 'deniedAt'> & {
    inviterId: number
  } & ({ acceptedAt?: DateTime } | { deniedAt?: DateTime })
}

export type AdminInvitationSeederData = AdminInvitationData & {
  data: { pendingUserId: number } | { userId: number }
}

export type NeighborhoodAdminInvitationData = {
  data: Omit<Partial<ModelAttributes<NeighborhoodAdminInvitation>>, 'acceptedAt' | 'deniedAt'> & {
    inviterId: number
  } & ({ acceptedAt?: DateTime } | { deniedAt?: DateTime })
}

export type NeighborhoodAdminInvitationSeederData = NeighborhoodAdminInvitationData & {
  data: { neighborhoodId: number } & ({ pendingUserId: number } | { userId: number })
}

export type NeighborhoodData = {
  data: Partial<ModelAttributes<Neighborhood>>
  adminInvitations?: (NeighborhoodAdminInvitationData & {
    data: { pendingUserId: number } | { userId: number }
  })[]
  users?: (NeighborhoodUserData & { data: { user_id: number } })[]
  // userLocations?: NeighborhoodUserLocationData[]
}

export type NeighborhoodUserData = {
  data: {
    neighborhood_id?: number
    user_id?: number
    is_neighborhood_admin: boolean
    neighborhood_user_deactivated_at?: DateTime | null
  }
}

export type NeighborhoodUserSeederData = NeighborhoodUserData & {
  data: {
    neighborhood_id: number
    user_id: number
  }
}

export type NeighborhoodSeederData = NeighborhoodData

export type PendingUserData = {
  data: Partial<ModelAttributes<PendingUser>>
  receivedAdminInvitations?: AdminInvitationData[]
  receivedNeighborhoodAdminInvitations?: (NeighborhoodAdminInvitationData & {
    data: { neighborhoodId: number }
  })[]
}

export type PendingUserSeederData = PendingUserData

export type UserData = {
  data: Partial<ModelAttributes<User>>
  neighborhoods?: (NeighborhoodUserData & { data: { neighborhood_id: number } })[]
  phoneNumbers?: UserPhoneNumberData[]
  receivedAdminInvitations?: AdminInvitationData[]
  receivedNeighborhoodAdminInvitations?: (NeighborhoodAdminInvitationData & {
    data: { neighborhoodId: number }
  })[]
}

export type UserSeederData = UserData

export type UserPhoneNumberData = {
  data: Omit<Partial<ModelAttributes<UserPhoneNumber>>, 'userId'>
}

export type UserPhoneNumberSeederData = UserPhoneNumberData & { data: { userId: number } }
