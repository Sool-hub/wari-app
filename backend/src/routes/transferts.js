const express = require('express')
const router = express.Router()
const { transferer } = require('../controllers/transfertController')
const { proteger } = require('../middleware/auth')
const { valider, reglesTransfert } = require('../middleware/validation')

router.post('/', proteger, reglesTransfert, valider, transferer)

module.exports = router
