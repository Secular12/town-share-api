import { faker } from '@faker-js/faker'

export const phoneNumber = (format?: string) => {
  const phoneFormat =
    format ?? faker.helpers.arrayElement(['###-###-####', '(###) ###-####', '###.###.####'])

  return phoneFormat.replace(/#+/g, (m) => faker.string.numeric(m.length))
}

export const randomCall = (fakerFunction: Function, chance: number = 0.5) => {
  return faker.datatype.boolean(chance) ? fakerFunction() : null
}
