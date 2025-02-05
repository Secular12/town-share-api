import { faker } from '@faker-js/faker'

const phoneNumber = (format?: string) => {
  const phoneFormat =
    format ?? faker.helpers.arrayElement(['###-###-####', '(###) ###-####', '###.###.####'])

  return phoneFormat.replace(/#+/g, (m) => faker.string.numeric(m.length))
}

const randomCall = <T extends (...args: any) => any>(fakerFunction: T, chance: number = 0.5) => {
  return faker.datatype.boolean(chance) ? fakerFunction() : null
}

const randomOrDefault = <T extends (...args: any) => any>(
  fakerFunction: T,
  defaultValue: ReturnType<T>,
  chance: number = 0.5
) => {
  return faker.datatype.boolean(chance) ? fakerFunction() : defaultValue
}

export default {
  phoneNumber,
  randomCall,
  randomOrDefault,
}
