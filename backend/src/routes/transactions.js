const express = require('express')
const router = express.Router()
const { recharger, obtenirSolde, obtenirHistorique } = require('../controllers/transactionController')
const { proteger } = require('../middleware/auth')
const { valider, reglesRecharge } = require('../middleware/validation')

router.get('/solde', proteger, obtenirSolde)
router.get('/historique', proteger, obtenirHistorique)
router.post('/recharger', proteger, reglesRecharge, valider, recharger)

module.exports = router
