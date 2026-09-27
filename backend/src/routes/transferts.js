const express = require('express')
const router = express.Router()
const { transferer } = require('../controllers/transfertController')
const { proteger } = require('../middleware/auth')

router.post('/', proteger, transferer)

module.exports = router
