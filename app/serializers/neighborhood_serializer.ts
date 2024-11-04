import User from '#models/user'
import BaseSerializer, { Role, SerializerPermissions } from '#serializers/base_serializer'

export default class NeighborhoodSerializer extends BaseSerializer {
  static permissions: SerializerPermissions = {
    id: { guest: false, roles: '*' },
    city: { guest: false, roles: '*' },
    name: { guest: false, roles: '*' },
    state: { guest: false, roles: '*' },
    createdAt: { guest: false, roles: '*' },
    updatedAt: { guest: false, roles: '*' },
  }

  static getRole(authUser: User): Role {
    // Override getRole behavior here
    return super.getRole(authUser)
  }
}