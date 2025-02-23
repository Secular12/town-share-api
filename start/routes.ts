/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import '#start/routes/admin_invitation_routes'
import '#start/routes/authentication_routes'
import '#start/routes/neighborhood_routes'
import '#start/routes/neighborhood_admin_invitation_routes'
import '#start/routes/pending_user_routes'
import '#start/routes/user_routes'
import '#start/routes/user_phone_number_routes'
import router from '@adonisjs/core/services/router'

router.where('id', router.matchers.number())
