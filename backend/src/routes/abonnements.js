const express = require('express')
const router = express.Router()
const { obtenirAbonnements, annulerAbonnement, ajouterAbonnementManuellement } = require('../controllers/abonnementController')
const { proteger } = require('../middleware/auth')

router.get('/', proteger, obtenirAbonnements)
router.post('/ajouter', proteger, ajouterAbonnementManuellement)
router.put('/annuler/:id', proteger, annulerAbonnement)

module.exports = router
