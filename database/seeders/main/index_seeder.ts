import { Env } from '#types/env'
import app from '@adonisjs/core/services/app'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  private async seed(env: Env | 'main', seeders: string[]) {
    for await (const seeder of seeders) {
      const Seeder: { default: typeof BaseSeeder } = await import(
        `#database/seeders/${env}/${seeder}`
      )

      await new Seeder.default(this.client).run()
    }
  }

  async run() {
    if (app.inDev) {
      await this.seed('development', [
        'user_seeder',
        'pending_user_seeder',
        'admin_invitation_seeder',
        // 'neighborhood_seeder',
        // 'user_location_seeder',
        // 'organization_seeder',
        // 'organization_user_seeder',
        // 'organization_location_seeder',
        // 'organization_location_user_seeder',
      ])
    }

    if (app.inTest) {
      await this.seed('test', [
        'user_seeder',
        'neighborhood_seeder',
        'neighborhood_admin_seeder',
        'user_location_seeder',
        'organization_seeder',
        'organization_user_seeder',
        'organization_location_seeder',
        'organization_location_user_seeder',
      ])
    }

    if (app.inProduction) {
      await this.seed('production', ['user_seeder', 'organization_seeder'])
    }
  }
}
