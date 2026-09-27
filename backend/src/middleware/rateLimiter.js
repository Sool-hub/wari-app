const rateLimit = require('express-rate-limit')

const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'erreur',
    message: 'Trop de requetes. Reessayez dans 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
})

const limiterConnexion = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 'erreur',
    message: 'Trop de tentatives de connexion. Reessayez dans 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
})

const limiterTransaction = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    status: 'erreur',
    message: 'Trop de transactions en peu de temps. Reessayez dans 1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
})

module.exports = { limiterGeneral, limiterConnexion, limiterTransaction }
