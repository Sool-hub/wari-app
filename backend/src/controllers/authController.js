const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Utilisateur, Compte } = require('../models/index')
const { logSecurite } = require('../middleware/logger')

const JWT_SECRET = process.env.JWT_SECRET || 'wari_jwt_secret_key_change_en_production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
const JWT_REFRESH_EXPIRES_IN = '7d'

const genererTokens = (utilisateur) => {
  const accessToken = jwt.sign(
    { id: utilisateur.id, telephone: utilisateur.telephone },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
  const refreshToken = jwt.sign(
    { id: utilisateur.id },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  )
  return { accessToken, refreshToken }
}

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

    if (!/^[0-9]{8}$/.test(telephone)) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Le numero de telephone doit contenir 8 chiffres'
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

    const pinChiffre = await bcrypt.hash(pin, 12)

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

    const { accessToken, refreshToken } = genererTokens(utilisateur)

    await utilisateur.update({ refresh_token: refreshToken })

    logSecurite('INSCRIPTION', utilisateur.id, { telephone }, true)

    return res.status(201).json({
      status: 'succes',
      message: 'Compte cree avec succes',
      data: {
        accessToken,
        refreshToken,
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
      logSecurite('CONNEXION_ECHEC', null, { telephone }, false)
      return res.status(401).json({
        status: 'erreur',
        message: 'Numero de telephone ou PIN incorrect'
      })
    }

    if (utilisateur.bloque_jusqu_a && new Date() < new Date(utilisateur.bloque_jusqu_a)) {
      const minutesRestantes = Math.ceil(
        (new Date(utilisateur.bloque_jusqu_a) - new Date()) / 60000
      )
      return res.status(403).json({
        status: 'erreur',
        message: 'Compte temporairement bloque. Reessayez dans ' + minutesRestantes + ' minutes'
      })
    }

    if (utilisateur.statut === 'suspendu') {
      return res.status(403).json({
        status: 'erreur',
        message: 'Votre compte est suspendu. Contactez le support'
      })
    }

    const pinValide = await bcrypt.compare(pin, utilisateur.pin)

    if (!pinValide) {
      const tentatives = utilisateur.tentatives_pin + 1

      if (tentatives >= 3) {
        const bloqueJusqua = new Date(Date.now() + 30 * 60 * 1000)
        await utilisateur.update({
          tentatives_pin: 0,
          bloque_jusqu_a: bloqueJusqua
        })
        logSecurite('COMPTE_BLOQUE', utilisateur.id, { telephone }, false)
        return res.status(403).json({
          status: 'erreur',
          message: 'Trop de tentatives incorrectes. Compte bloque pendant 30 minutes'
        })
      }

      await utilisateur.update({ tentatives_pin: tentatives })
      logSecurite('PIN_INCORRECT', utilisateur.id, { tentatives }, false)

      return res.status(401).json({
        status: 'erreur',
        message: 'PIN incorrect. ' + (3 - tentatives) + ' tentative(s) restante(s)'
      })
    }

    await utilisateur.update({
      tentatives_pin: 0,
      bloque_jusqu_a: null
    })

    const { accessToken, refreshToken } = genererTokens(utilisateur)
    await utilisateur.update({ refresh_token: refreshToken })

    logSecurite('CONNEXION_REUSSIE', utilisateur.id, { telephone }, true)

    return res.status(200).json({
      status: 'succes',
      message: 'Connexion reussie',
      data: {
        accessToken,
        refreshToken,
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

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Refresh token manquant'
      })
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET)

    const utilisateur = await Utilisateur.findByPk(decoded.id)

    if (!utilisateur || utilisateur.refresh_token !== refreshToken) {
      return res.status(401).json({
        status: 'erreur',
        message: 'Refresh token invalide'
      })
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = genererTokens(utilisateur)
    await utilisateur.update({ refresh_token: newRefreshToken })

    return res.status(200).json({
      status: 'succes',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    })
  } catch (error) {
    return res.status(401).json({
      status: 'erreur',
      message: 'Refresh token invalide ou expire'
    })
  }
}

const deconnexion = async (req, res) => {
  try {
    await req.utilisateur.update({ refresh_token: null })
    logSecurite('DECONNEXION', req.utilisateur.id, {}, true)
    return res.status(200).json({
      status: 'succes',
      message: 'Deconnexion reussie'
    })
  } catch (error) {
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors de la deconnexion'
    })
  }
}

module.exports = { inscription, connexion, refreshToken, deconnexion }
