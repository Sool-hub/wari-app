const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const authRoutes = require('./routes/auth')
const transactionRoutes = require('./routes/transactions')
const carteRoutes = require('./routes/cartes')
const transfertRoutes = require('./routes/transferts')
const kycRoutes = require('./routes/kyc')
const { limiterGeneral } = require('./middleware/rateLimiter')
const { middlewareLog } = require('./middleware/logger')

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(middlewareLog)
app.use(limiterGeneral)

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Serveur Wari operationnel',
    version: '1.0.0'
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/cartes', carteRoutes)
app.use('/api/transferts', transfertRoutes)
app.use('/api/kyc', kycRoutes)

app.use((req, res) => {
  res.status(404).json({
    status: 'erreur',
    message: 'Route introuvable'
  })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    status: 'erreur',
    message: 'Erreur interne du serveur'
  })
})

module.exports = app
