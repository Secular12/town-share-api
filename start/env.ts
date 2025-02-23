/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'
import stringHelpers from '@adonisjs/core/helpers/string'
import app from '@adonisjs/core/services/app'

const customSchema = {
  prettyMsTime(name: string, value?: string) {
    if (!value) {
      throw new Error(`Value for ${name} is required`)
    }

    if (!stringHelpers.milliseconds.parse(value)) {
      throw new Error(
        `Value for ${name} must be a number of milliseconds or a pretty time, See https://docs.adonisjs.com/guides/references/helpers#milliseconds`
      )
    }

    return value
  },
}

export default await Env.create(new URL('../', import.meta.url), {
  /*
  |----------------------------------------------------------
  | Variables for base app configuration
  |----------------------------------------------------------
  */
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  TZ: Env.schema.enum(['UTC'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_DATABASE: Env.schema.string(),
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  MAIL_FROM_NOTIFICATIONS_DEFAULT_EMAIL: Env.schema.string({ format: 'email' }),
  MAIL_NO_REPLY_EMAIL: Env.schema.string({ format: 'email' }),
  MAIL_TO_OVERRIDE_EMAIL: app.inProduction
    ? Env.schema.string.optional({ format: 'email' })
    : Env.schema.string({ format: 'email' }),
  SMTP_HOST: Env.schema.string({ format: 'host' }),
  SMTP_PASSWORD: Env.schema.string(),
  SMTP_PORT: Env.schema.string(),
  SMTP_USERNAME: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring seeders
  |----------------------------------------------------------
  */
  SEEDER_NOTIFICATION_UI_URL:
    Env.schema.string.optional({ format: 'url' }) ?? 'http://townshare.dev',

  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring tokens
  |----------------------------------------------------------
  */
  TOKEN_INVITATION_EXPIRATION: customSchema.prettyMsTime,
  TOKEN_RESET_PASSWORD_EXPIRATION: customSchema.prettyMsTime,
})
