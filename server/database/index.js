const fs = require('fs')
const path = require('path')
const util = require('util')
const Sequelize = require('sequelize')
const config = require('../../config/index')
const { pgSetTypeParsers } = require('pg-safe-numbers')

// Setup parsers for unsafe numbers.
pgSetTypeParsers({
  // Handle unsafe integers, ie. >= Math.pow(2, 53)
  unsafeInt(parsed, text) {
    console.error(`Unsafe int ${util.inspect(text)}) parse to ${util.inspect(parsed)}.\n${new Error().stack}`)
    return parsed
  },
  // Handle unsafe floats.
  unsafeFloat(parsed, text) {
    console.error(`Unsafe float ${util.inspect(text)}) parse to ${util.inspect(parsed)}.\n${new Error().stack}`)
    return parsed
  },
})

const sequelize = new Sequelize(config.database.connectionString, config.database.options)
const db = {}

function importModels(modelsPath) {
  fs.readdirSync(modelsPath) // eslint-disable-line no-sync, max-len
    .filter(file => file.indexOf('.') !== 0)
    .forEach(file => {
      const model = sequelize.import(path.join(modelsPath, file))
      db[model.name] = model
    })
}

// Import common models
importModels(`${__dirname}/models`)
// Import game specific models
const gamesDir = path.normalize(`${__dirname}/../../games/`)
fs.readdirSync(gamesDir)
  .filter(folder => folder.indexOf('.') !== 0)
  .forEach(gameFolder => {
    const gamePath = path.join(gamesDir, gameFolder)
    const gameConfig = require(path.join(gamePath, './config.json')) // eslint-disable-line global-require, max-len

    importModels(path.join(gamePath, gameConfig.common.databaseModels))
  })

// Load relations between models
Object.keys(db).forEach(modelName => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize
db.Op = Sequelize.Op

module.exports = db