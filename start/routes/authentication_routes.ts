import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AuthenticationController = () => import('#controllers/authentication_controller')

router
  .group(() => {
    router.post('forgot-password', [AuthenticationController, 'forgotPassword'])
    router.post('login', [AuthenticationController, 'login'])
    router.patch('reset-password', [AuthenticationController, 'resetPassword'])
  })
  .prefix('authentication')
  .use(middleware.guest())

router
  .group(() => {
    router.patch('change-password', [AuthenticationController, 'changePassword'])
    router.delete('logout', [AuthenticationController, 'logout'])
  })
  .prefix('authentication')
  .use(middleware.auth())
