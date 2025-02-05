import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UsersController = () => import('#controllers/users_controller')

router
  .resource('users', UsersController)
  .apiOnly()
  .except(['destroy', 'store'])
  .use('*', middleware.auth())

router
  .group(() => {
    router.patch(':id/deactivate', [UsersController, 'deactivate'])
    router.patch(':id/demote-admin', [UsersController, 'demoteAdmin'])
  })
  .prefix('users')
  .use(middleware.auth())
