const express = require('express')
const router = express.Router()
const { recharger, obtenirSolde, obtenirHistorique } = require('../controllers/transactionController')
const { proteger } = require('../middleware/auth')

router.get('/solde', proteger, obtenirSolde)
router.post('/recharger', proteger, recharger)
router.get('/historique', proteger, obtenirHistorique)

module.exports = router
