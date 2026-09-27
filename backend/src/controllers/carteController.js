const { v4: uuidv4 } = require('uuid')
const { Carte, Compte } = require('../models/index')

const genererNumeroCarte = () => {
  const groupes = []
  for (let i = 0; i < 4; i++) {
    groupes.push(Math.floor(1000 + Math.random() * 9000))
  }
  return groupes.join(' ')
}

const genererCVV = () => {
  return Math.floor(100 + Math.random() * 900).toString()
}

const genererDateExpiration = () => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 3)
  const mois = String(date.getMonth() + 1).padStart(2, '0')
  const annee = String(date.getFullYear()).slice(-2)
  return mois + '/' + annee
}

const creerCarte = async (req, res) => {
  try {
    const utilisateur_id = req.utilisateur.id

    const compte = await Compte.findOne({ where: { utilisateur_id } })

    if (!compte) {
      return res.status(404).json({
        status: 'erreur',
        message: 'Compte introuvable'
      })
    }

    const carteExistante = await Carte.findOne({
      where: { compte_id: compte.id, statut: 'active' }
    })

    if (carteExistante) {
      return res.status(409).json({
        status: 'erreur',
        message: 'Vous avez deja une carte virtuelle active'
      })
    }

    const numeroCarte = genererNumeroCarte()
    const cvv = genererCVV()
    const dateExpiration = genererDateExpiration()

    const numeroMasque = '**** **** **** ' + numeroCarte.split(' ')[3]

    const dateParts = dateExpiration.split('/')
    const dateExpirationComplete = '20' + dateParts[1] + '-' + dateParts[0] + '-01'

    const carte = await Carte.create({
      numero_masque: numeroMasque,
      date_expiration: dateExpirationComplete,
      type: 'virtuelle',
      statut: 'active',
      plafond_journalier: 500000.00,
      compte_id: compte.id
    })

    return res.status(201).json({
      status: 'succes',
      message: 'Carte virtuelle creee avec succes',
      data: {
        id: carte.id,
        numero: numeroCarte,
        numero_masque: carte.numero_masque,
        cvv,
        date_expiration: dateExpiration,
        type: carte.type,
        statut: carte.statut,
        plafond_journalier: carte.plafond_journalier,
        titulaire: req.utilisateur.prenom + ' ' + req.utilisateur.nom
      }
    })
  } catch (error) {
    console.error('Erreur creation carte :', error)
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors de la creation de la carte'
    })
  }
}

const obtenirCarte = async (req, res) => {
  try {
    const utilisateur_id = req.utilisateur.id

    const compte = await Compte.findOne({ where: { utilisateur_id } })

    if (!compte) {
      return res.status(404).json({
        status: 'erreur',
        message: 'Compte introuvable'
      })
    }

    const carte = await Carte.findOne({
      where: { compte_id: compte.id, statut: 'active' }
    })

    if (!carte) {
      return res.status(404).json({
        status: 'erreur',
        message: 'Aucune carte virtuelle active'
      })
    }

    const dateExp = new Date(carte.date_expiration)
    const mois = String(dateExp.getMonth() + 1).padStart(2, '0')
    const annee = String(dateExp.getFullYear()).slice(-2)

    return res.status(200).json({
      status: 'succes',
      data: {
        id: carte.id,
        numero_masque: carte.numero_masque,
        date_expiration: mois + '/' + annee,
        type: carte.type,
        statut: carte.statut,
        plafond_journalier: carte.plafond_journalier,
        titulaire: req.utilisateur.prenom + ' ' + req.utilisateur.nom
      }
    })
  } catch (error) {
    console.error('Erreur obtenir carte :', error)
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors de la recuperation de la carte'
    })
  }
}

const bloquerCarte = async (req, res) => {
  try {
    const utilisateur_id = req.utilisateur.id

    const compte = await Compte.findOne({ where: { utilisateur_id } })
    const carte = await Carte.findOne({
      where: { compte_id: compte.id, statut: 'active' }
    })

    if (!carte) {
      return res.status(404).json({
        status: 'erreur',
        message: 'Aucune carte active a bloquer'
      })
    }

    await carte.update({ statut: 'bloquee' })

    return res.status(200).json({
      status: 'succes',
      message: 'Carte bloquee avec succes'
    })
  } catch (error) {
    console.error('Erreur bloquer carte :', error)
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors du blocage de la carte'
    })
  }
}

const debloquerCarte = async (req, res) => {
  try {
    const utilisateur_id = req.utilisateur.id

    const compte = await Compte.findOne({ where: { utilisateur_id } })
    const carte = await Carte.findOne({
      where: { compte_id: compte.id, statut: 'bloquee' }
    })

    if (!carte) {
      return res.status(404).json({
        status: 'erreur',
        message: 'Aucune carte bloquee a debloquer'
      })
    }

    await carte.update({ statut: 'active' })

    return res.status(200).json({
      status: 'succes',
      message: 'Carte debloquee avec succes'
    })
  } catch (error) {
    console.error('Erreur debloquer carte :', error)
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors du deblocage de la carte'
    })
  }
}

module.exports = { creerCarte, obtenirCarte, bloquerCarte, debloquerCarte }
