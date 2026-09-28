const express = require('express')
const router = express.Router()
const { inscription, connexion, refreshToken, deconnexion } = require('../controllers/authController')
const { limiterConnexion } = require('../middleware/rateLimiter')
const { proteger } = require('../middleware/auth')
const { valider, reglesInscription, reglesConnexion } = require('../middleware/validation')

router.post('/inscription', reglesInscription, valider, inscription)
router.post('/connexion', limiterConnexion, reglesConnexion, valider, connexion)
router.post('/refresh', refreshToken)
router.post('/deconnexion', proteger, deconnexion)

module.exports = router
