import { BaseCommand, args } from '@adonisjs/core/ace'
import { generators } from '@adonisjs/core/app'
import string from '@adonisjs/core/helpers/string'
import { CommandOptions } from '@adonisjs/core/types/ace'

const STUBS_ROOT = new URL('../stubs/', import.meta.url)

export default class Serializer extends BaseCommand {
  static commandName = 'make:serializer'
  static description = 'Create a new set of read and write persmissions on model properties.'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
    staysAlive: false,
  }

  @args.string({
    argumentName: 'model-name',
    description: 'Name of the model class',
    parse(value) {
      return value ? string.singular(string.pascalCase(value)) : value
    },
  })
  declare name: string

  async run() {
    const codemods = await this.createCodemods()

    await codemods.makeUsingStub(STUBS_ROOT.toString(), '/make/serializer/main.stub', {
      entity: generators.createEntity(this.name),
    })
  }
}
