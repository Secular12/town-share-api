import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UserPhoneNumbersController = () => import('#controllers/user_phone_numbers_controller')

router
  .resource('user-phone-numbers', UserPhoneNumbersController)
  .apiOnly()
  .use('*', middleware.auth())
