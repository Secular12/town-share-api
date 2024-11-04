import User from '#models/user'
import BaseSerializer, { Role, SerializerPermissions } from '#serializers/base_serializer'

export default class UserSerializer extends BaseSerializer {
  static permissions: SerializerPermissions = {
    id: { guest: false, roles: '*' },
    email: { guest: false, roles: '*' },
    firstName: { guest: false, roles: '*' },
    isApplicationAdmin: { guest: false, roles: '*' },
    lastName: { guest: false, roles: '*' },
    middleName: { guest: false, roles: '*' },
    nameSuffix: { guest: false, roles: '*' },
    createdAt: { guest: false, roles: '*' },
    updatedAt: { guest: false, roles: '*' },
    locationsCount: { guest: false, roles: '*' },
    organizationLocationsCount: { guest: false, roles: '*' },
    organizationsCount: { guest: false, roles: '*' },
    isOrganizationAdmin: { guest: false, roles: '*' },
  }

  static getRole(authUser: User): Role {
    return super.getRole(authUser)
  }
}
