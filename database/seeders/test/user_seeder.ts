import { UserFactory } from '#database/factories/user_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const users = [
  // 1
  // userLocation neighborhood: null
  // organization: null
  // organizationLocation: null
  {
    email: 'admin@test.com',
    firstName: 'Admin',
    isApplicationAdmin: true,
    lastName: 'User',
    middleName: 'Test',
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 2
  // userLocation neighborhood: 1
  // organization: null
  // organizationLocation: null
  {
    sponsorId: 1,
    email: 'user@test.com',
    firstName: 'Standard',
    isApplicationAdmin: false,
    lastName: 'User',
    middleName: 'Test',
    nameSuffix: 'Jr.',
    password: 'Secret123!',
  },
  // 3
  // userLocation neighborhood: 1, 2
  // organization: null
  // organizationLocation: null
  {
    sponsorId: 1,
    email: 'user2@test.com',
    firstName: 'Marilyn',
    isApplicationAdmin: false,
    lastName: 'Castor',
    middleName: null,
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 4
  // userLocation neighborhood: null
  // organization: null
  // organizationLocation: null
  {
    sponsorId: 1,
    email: 'north_hills_pitt_admin@test.com',
    firstName: 'Dave',
    isApplicationAdmin: false,
    lastName: 'Hallman',
    middleName: 'Roger',
    nameSuffix: 'III',
    password: 'Secret123!',
  },
  // 5
  // userLocation neighborhood: null
  // organization: null
  // organizationLocation: null
  {
    sponsorId: 1,
    email: 'downtown_seattle_admin@test.com',
    firstName: 'Frank',
    isApplicationAdmin: true,
    lastName: 'Chartersmith',
    middleName: null,
    nameSuffix: 'Sr.',
    password: 'Secret123!',
  },
  // 6
  // userLocation neighborhood: 3 (x2)
  // organization: null
  // organizationLocation: null
  {
    sponsorId: 5,
    email: 'downtown_seattle_admin2@test.com',
    firstName: 'Abby',
    isApplicationAdmin: false,
    lastName: 'Jones',
    middleName: 'Anne',
    nameSuffix: 'Esq.',
    password: 'Secret123!',
  },
  // 7
  // userLocation neighborhood: null
  // organization: 1 (admin)
  // organizationLocation: 1
  {
    sponsorId: 1,
    email: 'east_side_coop_admin@test.com',
    firstName: 'Danielle',
    isApplicationAdmin: false,
    lastName: 'Gale',
    middleName: null,
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 8
  // userLocation neighborhood: null
  // organization: 2 (admin)
  // organizationLocation: 2
  {
    sponsorId: 1,
    email: 'usa_share_admin@test.com',
    firstName: 'Herbert',
    lastName: 'James',
    isApplicationAdmin: false,
    middleName: null,
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 9
  // userLocation neighborhood: 2
  // organization: 2 (admin)
  // organizationLocation: 2, 3
  {
    sponsorId: 4,
    email: 'usa_share_admin2@test.com',
    firstName: 'Hannah',
    isApplicationAdmin: false,
    lastName: 'Morrow',
    middleName: 'Doe',
    nameSuffix: 'II',
    password: 'Secret123!',
  },
  // 10
  // userLocation neighborhood: null
  // organization: 2
  // organizationLocation: 2
  {
    sponsorId: 9,
    email: 'usa_share_user@test.com',
    firstName: 'Danielle',
    isApplicationAdmin: false,
    lastName: 'Davies',
    middleName: 'Anne',
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 11
  // userLocation neighborhood: null
  // organization: 2
  // organizationLocation: 2, 3
  {
    sponsorId: 9,
    email: 'usa_share_user2@test.com',
    firstName: 'John',
    isApplicationAdmin: false,
    lastName: 'Smith',
    middleName: null,
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 12
  // userLocation neighborhood: 3 (x2)
  // organization: 3 (admin)
  // organizationLocation: 4, 5
  {
    sponsorId: 1,
    email: 'seattle_share_admin@test.com',
    firstName: 'Jane',
    isApplicationAdmin: false,
    lastName: 'Doe',
    middleName: null,
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 13
  // userLocation neighborhood: null
  // organization: 3
  // organizationLocation: 4, 5
  {
    sponsorId: 12,
    email: 'seattle_share_user@test.com',
    firstName: 'John',
    isApplicationAdmin: false,
    lastName: 'Smith',
    middleName: null,
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 14
  // userLocation neighborhood: null
  // organization: 2 (admin), 3 (admin)
  // organizationLocation: 2, 4
  {
    sponsorId: 7,
    email: 'multi_org_admin@test.com',
    firstName: 'Jane',
    isApplicationAdmin: true,
    lastName: 'Doe',
    middleName: null,
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 15
  // userLocation neighborhood: 2
  // organization: 1(admin), 2
  // organizationLocation: 1, 2, 3
  {
    sponsorId: 14,
    email: 'multi_org_admin2@test.com',
    firstName: 'Anabelle',
    isApplicationAdmin: false,
    lastName: 'Forest',
    middleName: 'Rose',
    nameSuffix: 'III',
    password: 'Secret123!',
  },
  // 16
  // userLocation neighborhood: 1, 2, 3
  // organization: 2, 3
  // organizationLocation: 2, 4, 5
  {
    sponsorId: 14,
    email: 'multi_org_user@test.com',
    firstName: 'Frank',
    isApplicationAdmin: true,
    lastName: 'Jones',
    middleName: null,
    nameSuffix: 'Esq.',
    password: 'Secret123!',
  },
  // 17
  // userLocation neighborhood: null
  // organization: 1, 2
  // organizationLocation: 1, 3
  {
    sponsorId: 14,
    email: 'multi_org_user2@test.com',
    firstName: 'Shawna',
    isApplicationAdmin: false,
    lastName: 'Jackson',
    middleName: 'Kara',
    nameSuffix: 'MD',
    password: 'Secret123!',
  },
]

export default class extends BaseSeeder {
  async run() {
    await UserFactory.merge(users).createMany(users.length)
  }
}
