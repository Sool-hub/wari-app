const { Sequelize } = require('sequelize')

let sequelize

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  })
} else {
  sequelize = new Sequelize(
    process.env.PGDATABASE || process.env.DB_NAME || 'wari_db',
    process.env.PGUSER || process.env.DB_USER || 'postgres',
    process.env.PGPASSWORD || process.env.DB_PASSWORD || 'wari2kadi',
    {
      host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
      port: process.env.PGPORT || process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: process.env.PGHOST ? {
        ssl: { require: true, rejectUnauthorized: false }
      } : {},
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    }
  )
}

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connexion a PostgreSQL reussie')
  } catch (error) {
    console.error('Erreur de connexion a PostgreSQL :', error.message)
    process.exit(1)
  }
}

module.exports = { sequelize, connectDB }
