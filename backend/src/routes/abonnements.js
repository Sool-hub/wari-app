const express = require('express')
const router = express.Router()
const { obtenirAbonnements, annulerAbonnement, ajouterAbonnementManuellement } = require('../controllers/abonnementController')
const { proteger } = require('../middleware/auth')
const { valider, reglesAbonnement, reglesAnnulerAbonnement } = require('../middleware/validation')

router.get('/', proteger, obtenirAbonnements)
router.post('/ajouter', proteger, reglesAbonnement, valider, ajouterAbonnementManuellement)
router.put('/annuler/:id', proteger, reglesAnnulerAbonnement, valider, annulerAbonnement)

module.exports = router
