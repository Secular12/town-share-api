import User from '#models/user'
import { ModelObject } from '@adonisjs/lucid/types/model'

const permissableRoles = [
  'application_admin',
  'neighborhood_admin',
  'organization_admin',
  'user',
] as const

const roles = [...permissableRoles, 'guest'] as const

type Attribute = string

export type PermissableRole = (typeof permissableRoles)[number]
export type Role = (typeof roles)[number]

type AttributesByRole = {
  [x in Role]: Attribute[]
}

type Serializer = typeof BaseSerializer

type RelatedSerializers = {
  [x in Attribute]: Serializer
}

export type SerializerPermissions = {
  [x: Attribute]: {
    guest: boolean
    roles: '*' | PermissableRole[]
  }
}

export default class BaseSerializer {
  static permissions: SerializerPermissions = {}

  static roles = permissableRoles

  static get attributesByRole(): AttributesByRole {
    return this.roles.reduce(
      (acc, role) => {
        const test = {
          ...acc,
          [role]: Object.entries(this.permissions).reduce(
            (attributes: string[], [attribute, permission]) => {
              if (permission.roles === '*' || permission.roles.includes(role)) {
                attributes.push(attribute)
              }

              return attributes
            },
            []
          ),
        }

        return test
      },
      {
        guest: Object.entries(this.permissions).reduce(
          (attributes: string[], [attribute, permission]) => {
            if (permission.guest) {
              attributes.push(attribute)
            }

            return attributes
          },
          []
        ),
      } as AttributesByRole
    )
  }

  static getRole(authUser?: User | null): Role {
    if (!authUser) return 'guest'

    if (authUser.isApplicationAdmin) return 'application_admin'

    return 'user'
  }

  static serializeData(
    data: any,
    role: Role,
    relatedSerializers: RelatedSerializers = {},
    dataPath = ''
  ): ModelObject | ModelObject[] {
    if (Array.isArray(data))
      return data.map((x: any) => this.serializeData(x, role, relatedSerializers, dataPath))

    return Object.entries(data).reduce((acc, [key, value]) => {
      const keyPath = `${dataPath}${key}`

      if (
        value !== undefined &&
        (this.attributesByRole[role].includes(key) || keyPath in relatedSerializers)
      ) {
        acc[key] =
          key in relatedSerializers
            ? relatedSerializers[key].serializeData(value, role, relatedSerializers, `${keyPath}.`)
            : value
      }

      return acc
    }, {} as any)
  }

  static serialize<T extends ModelObject>(
    modelData: T | T[],
    meta: {
      authUser?: User | null
      relatedSerializers?: RelatedSerializers
    }
  ) {
    const data = Array.isArray(modelData)
      ? 'serialize' in modelData
        ? (modelData as T).serialize()
        : modelData.map((x) => x.serialize())
      : (modelData as T).serialize()

    const role = this.getRole(meta.authUser)

    return Array.isArray(modelData) && 'serialize' in modelData
      ? {
          ...data,
          data: this.serializeData(data.data, role, meta.relatedSerializers),
        }
      : this.serializeData(data, role, meta.relatedSerializers)
  }
}
