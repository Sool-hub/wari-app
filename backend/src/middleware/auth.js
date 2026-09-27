const jwt = require('jsonwebtoken')
const { Utilisateur } = require('../models/index')

const proteger = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'erreur',
        message: 'Acces non autorise. Token manquant'
      })
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'wari_jwt_secret_key_change_en_production'
    )

    const utilisateur = await Utilisateur.findByPk(decoded.id)

    if (!utilisateur) {
      return res.status(401).json({
        status: 'erreur',
        message: 'Utilisateur introuvable'
      })
    }

    if (utilisateur.statut === 'suspendu') {
      return res.status(403).json({
        status: 'erreur',
        message: 'Votre compte est suspendu'
      })
    }

    req.utilisateur = utilisateur
    next()
  } catch (error) {
    return res.status(401).json({
      status: 'erreur',
      message: 'Token invalide ou expire'
    })
  }
}

module.exports = { proteger }
