import stringHelpers from '@adonisjs/core/helpers/string'

type PhoneInput = {
  countryCode: string
  phone: string
  extension?: string | null
}

const getPhoneFormats = (input: PhoneInput) => {
  return {
    dashed: toPhoneE164Format(input),
    href: toPhoneHrefFormat(input),
    nanp: toPhoneNanpFormat(input),
  }
}

const toPhoneE164Format = (input: PhoneInput) => {
  const phoneString = input.phone

  const formattedPhone =
    phoneString.length < 4
      ? phoneString
      : phoneString.length < 7
        ? `${phoneString.substring(0, 3)}-${phoneString.substring(3, 6)}`
        : phoneString.length === 7
          ? `${phoneString.substring(0, 3)}-${phoneString.substring(3, 7)}`
          : `${phoneString.substring(0, 3)}-${phoneString.substring(3, 6)}-${phoneString.substring(6, 10)}`
  return `+${input.countryCode}-${formattedPhone}${input.extension ? ` x${input.extension}` : ''}`
}

const toPhoneHrefFormat = (input: PhoneInput) => {
  return `+${input.countryCode}${input.phone}${input.extension ? `,${input.extension}` : ''}`
}

const toPhoneNanpFormat = (input: PhoneInput) => {
  const phoneString = input.phone

  const formattedPhone =
    phoneString.length === 0
      ? phoneString
      : phoneString.length < 4
        ? `(${phoneString}`
        : phoneString.length < 7
          ? `(${phoneString.substring(0, 3)}) ${phoneString.substring(3, 6)}`
          : phoneString.length === 7
            ? `${phoneString.substring(0, 3)}-${phoneString.substring(3, 7)}`
            : `(${phoneString.substring(0, 3)}) ${phoneString.substring(3, 6)}-${phoneString.substring(6, 10)}`

  return `+${input.countryCode} ${formattedPhone}${input.extension ? ` #${input.extension}` : ''}`
}

const wait = (prettyTime: string) =>
  new Promise((resolve) => setTimeout(resolve, stringHelpers.milliseconds.parse(prettyTime)))

export default {
  getPhoneFormats,
  toPhoneE164Format,
  toPhoneHrefFormat,
  toPhoneNanpFormat,
  wait,
}
