import { DateTime } from 'luxon'

export const now = DateTime.utc()
export const appStart = now.minus({ days: 100 })
export const inviteAuburnNeighborhoodAdmin = appStart.plus({ days: 1 })
export const joinedAuburnNeighborhoodAdmin = inviteAuburnNeighborhoodAdmin.plus({ hours: 2 })
export const invitePendingApplicationAdmin = appStart.plus({ hours: 2 })
