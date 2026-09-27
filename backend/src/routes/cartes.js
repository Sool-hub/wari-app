const express = require('express')
const router = express.Router()
const { creerCarte, obtenirCarte, bloquerCarte, debloquerCarte } = require('../controllers/carteController')
const { proteger } = require('../middleware/auth')

router.post('/creer', proteger, creerCarte)
router.get('/', proteger, obtenirCarte)
router.put('/bloquer', proteger, bloquerCarte)
router.put('/debloquer', proteger, debloquerCarte)

module.exports = router
