const express = require('express')
const router = express.Router()
const { inscription, connexion, refreshToken, deconnexion } = require('../controllers/authController')
const { limiterConnexion } = require('../middleware/rateLimiter')
const { proteger } = require('../middleware/auth')

router.post('/inscription', inscription)
router.post('/connexion', limiterConnexion, connexion)
router.post('/refresh', refreshToken)
router.post('/deconnexion', proteger, deconnexion)

module.exports = router
