const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Utilisateur, Compte } = require('../models/index')

const genererNumeroCompte = () => {
  return 'WR' + Date.now() + Math.floor(Math.random() * 1000)
}

const inscription = async (req, res) => {
  try {
    const { nom, prenom, telephone, pin, date_naissance } = req.body

    if (!nom || !prenom || !telephone || !pin) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Nom, prenom, telephone et PIN sont obligatoires'
      })
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Le PIN doit contenir exactement 4 chiffres'
      })
    }

    const utilisateurExistant = await Utilisateur.findOne({
      where: { telephone }
    })

    if (utilisateurExistant) {
      return res.status(409).json({
        status: 'erreur',
        message: 'Ce numero de telephone est deja utilise'
      })
    }

    const pinChiffre = await bcrypt.hash(pin, 10)

    const utilisateur = await Utilisateur.create({
      nom,
      prenom,
      telephone,
      pin: pinChiffre,
      date_naissance: date_naissance || null
    })

    const compte = await Compte.create({
      numero_compte: genererNumeroCompte(),
      solde: 0.00,
      utilisateur_id: utilisateur.id
    })

    const token = jwt.sign(
      { id: utilisateur.id, telephone: utilisateur.telephone },
      process.env.JWT_SECRET || 'wari_jwt_secret_key_change_en_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    return res.status(201).json({
      status: 'succes',
      message: 'Compte cree avec succes',
      data: {
        token,
        utilisateur: {
          id: utilisateur.id,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          telephone: utilisateur.telephone,
          statut: utilisateur.statut
        },
        compte: {
          id: compte.id,
          numero_compte: compte.numero_compte,
          solde: compte.solde,
          devise: compte.devise
        }
      }
    })
  } catch (error) {
    console.error('Erreur inscription :', error)
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors de la creation du compte'
    })
  }
}

const connexion = async (req, res) => {
  try {
    const { telephone, pin } = req.body

    if (!telephone || !pin) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Telephone et PIN sont obligatoires'
      })
    }

    const utilisateur = await Utilisateur.findOne({
      where: { telephone },
      include: [{ association: 'compte' }]
    })

    if (!utilisateur) {
      return res.status(401).json({
        status: 'erreur',
        message: 'Numero de telephone ou PIN incorrect'
      })
    }

    if (utilisateur.statut === 'suspendu') {
      return res.status(403).json({
        status: 'erreur',
        message: 'Votre compte est suspendu'
      })
    }

    const pinValide = await bcrypt.compare(pin, utilisateur.pin)

    if (!pinValide) {
      return res.status(401).json({
        status: 'erreur',
        message: 'Numero de telephone ou PIN incorrect'
      })
    }

    const token = jwt.sign(
      { id: utilisateur.id, telephone: utilisateur.telephone },
      process.env.JWT_SECRET || 'wari_jwt_secret_key_change_en_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    return res.status(200).json({
      status: 'succes',
      message: 'Connexion reussie',
      data: {
        token,
        utilisateur: {
          id: utilisateur.id,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          telephone: utilisateur.telephone,
          statut: utilisateur.statut
        },
        compte: {
          id: utilisateur.compte.id,
          numero_compte: utilisateur.compte.numero_compte,
          solde: utilisateur.compte.solde,
          devise: utilisateur.compte.devise
        }
      }
    })
  } catch (error) {
    console.error('Erreur connexion :', error)
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors de la connexion'
    })
  }
}

module.exports = { inscription, connexion }
