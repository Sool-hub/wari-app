const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const authRoutes = require('./routes/auth')
const transactionRoutes = require('./routes/transactions')

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Serveur Wari operationnel',
    version: '1.0.0'
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)

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
