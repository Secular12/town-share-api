import { UserFactory } from '#database/factories/user_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const users = [
  // 1
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
  {
    email: 'user@test.com',
    firstName: 'Standard',
    isApplicationAdmin: false,
    lastName: 'User',
    middleName: 'Test',
    nameSuffix: 'Jr.',
    password: 'Secret123!',
  },
  // 3
  {
    email: 'user2@test.com',
    firstName: 'Marilyn',
    isApplicationAdmin: false,
    lastName: 'Castor',
    middleName: null,
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 4
  {
    email: 'north_hills_pitt_admin@test.com',
    firstName: 'Dave',
    isApplicationAdmin: false,
    lastName: 'Hallman',
    middleName: 'Roger',
    nameSuffix: 'III',
    password: 'Secret123!',
  },
  // 5
  {
    email: 'downtown_seattle_admin@test.com',
    firstName: 'Frank',
    isApplicationAdmin: true,
    lastName: 'Chartersmith',
    middleName: null,
    nameSuffix: 'Sr.',
    password: 'Secret123!',
  },
  // 6
  {
    email: 'downtown_seattle_admin2@test.com',
    firstName: 'Abby',
    isApplicationAdmin: false,
    lastName: 'Jones',
    middleName: 'Anne',
    nameSuffix: 'Esq.',
    password: 'Secret123!',
  },
  // 7
  {
    email: 'east_side_coop_admin@test.com',
    firstName: 'Danielle',
    isApplicationAdmin: false,
    lastName: 'Gale',
    middleName: null,
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 8
  {
    email: 'usa_share_admin@test.com',
    firstName: 'Herbert',
    lastName: 'James',
    isApplicationAdmin: false,
    middleName: null,
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 9
  {
    email: 'usa_share_admin2@test.com',
    firstName: 'Hannah',
    isApplicationAdmin: false,
    lastName: 'Morrow',
    middleName: 'Doe',
    nameSuffix: 'II',
    password: 'Secret123!',
  },
  // 10
  {
    email: 'usa_share_user@test.com',
    firstName: 'Danielle',
    isApplicationAdmin: false,
    lastName: 'Davies',
    middleName: 'Anne',
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 11
  {
    email: 'usa_share_user2@test.com',
    firstName: 'John',
    isApplicationAdmin: false,
    lastName: 'Smith',
    middleName: null,
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 12
  {
    email: 'seattle_share_admin@test.com',
    firstName: 'Jane',
    isApplicationAdmin: false,
    lastName: 'Doe',
    middleName: null,
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 13
  {
    email: 'seattle_share_user@test.com',
    firstName: 'John',
    isApplicationAdmin: false,
    lastName: 'Smith',
    middleName: null,
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 14
  {
    email: 'multi_org_admin@test.com',
    firstName: 'Jane',
    isApplicationAdmin: true,
    lastName: 'Doe',
    middleName: null,
    nameSuffix: null,
    password: 'Secret123!',
  },
  // 15
  {
    email: 'multi_org_admin2@test.com',
    firstName: 'Anabelle',
    isApplicationAdmin: false,
    lastName: 'Forest',
    middleName: 'Rose',
    nameSuffix: 'III',
    password: 'Secret123!',
  },
  // 16
  {
    email: 'multi_org_user@test.com',
    firstName: 'Frank',
    isApplicationAdmin: true,
    lastName: 'Jones',
    middleName: null,
    nameSuffix: 'Esq.',
    password: 'Secret123!',
  },
  // 17
  {
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
