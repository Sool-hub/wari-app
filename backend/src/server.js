const app = require('./app')
const { sequelize, connectDB } = require('./config/database')
require('./models/index')

const PORT = process.env.PORT || 3000

const start = async () => {
  await connectDB()
  await sequelize.sync({ alter: true })
  console.log('Tables synchronisees avec PostgreSQL')
  app.listen(PORT, () => {
    console.log('Serveur Wari demarre sur le port ' + PORT)
    console.log('Environnement : ' + process.env.NODE_ENV)
    console.log('Health check : http://localhost:' + PORT + '/health')
  })
}

start()