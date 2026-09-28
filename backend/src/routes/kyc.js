const express = require('express')
const router = express.Router()
const { initialiserKYC, webhookKYC, statutKYC } = require('../controllers/kycController')
const { proteger } = require('../middleware/auth')

router.post('/initialiser', proteger, initialiserKYC)
router.get('/statut', proteger, statutKYC)
router.post('/webhook', webhookKYC)

module.exports = router
