const { Abonnement, Compte } = require('../models/index')
const { calculerProchainPaiement } = require('../services/abonnementService')

const obtenirAbonnements = async (req, res) => {
  try {
    const utilisateur_id = req.utilisateur.id
    const compte = await Compte.findOne({ where: { utilisateur_id } })

    if (!compte) {
      return res.status(404).json({
        status: 'erreur',
        message: 'Compte introuvable'
      })
    }

    const abonnements = await Abonnement.findAll({
      where: { compte_id: compte.id, statut: 'actif' },
      order: [['prochain_paiement', 'ASC']]
    })

    const totalMensuel = abonnements.reduce((total, ab) => {
      if (ab.frequence === 'mensuel') return total + parseFloat(ab.montant)
      if (ab.frequence === 'hebdomadaire') return total + parseFloat(ab.montant) * 4
      if (ab.frequence === 'annuel') return total + parseFloat(ab.montant) / 12
      return total
    }, 0)

    return res.status(200).json({
      status: 'succes',
      data: {
        abonnements,
        total_mensuel: totalMensuel.toFixed(2),
        devise: 'XOF',
        nombre: abonnements.length
      }
    })
  } catch (error) {
    console.error('Erreur obtenir abonnements :', error)
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors de la recuperation des abonnements'
    })
  }
}

const annulerAbonnement = async (req, res) => {
  try {
    const { id } = req.params
    const utilisateur_id = req.utilisateur.id

    const compte = await Compte.findOne({ where: { utilisateur_id } })

    const abonnement = await Abonnement.findOne({
      where: { id, compte_id: compte.id }
    })

    if (!abonnement) {
      return res.status(404).json({
        status: 'erreur',
        message: 'Abonnement introuvable'
      })
    }

    await abonnement.update({ statut: 'annule' })

    return res.status(200).json({
      status: 'succes',
      message: 'Abonnement annule avec succes'
    })
  } catch (error) {
    console.error('Erreur annuler abonnement :', error)
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors de l annulation de l abonnement'
    })
  }
}

const ajouterAbonnementManuellement = async (req, res) => {
  try {
    const { nom_service, montant, frequence, prochain_paiement } = req.body
    const utilisateur_id = req.utilisateur.id

    if (!nom_service || !montant || !prochain_paiement) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Nom du service, montant et prochain paiement sont obligatoires'
      })
    }

    const compte = await Compte.findOne({ where: { utilisateur_id } })

    const abonnement = await Abonnement.create({
      nom_service,
      montant,
      frequence: frequence || 'mensuel',
      prochain_paiement,
      compte_id: compte.id,
      detection_auto: false,
      nombre_paiements: 0
    })

    return res.status(201).json({
      status: 'succes',
      message: 'Abonnement ajoute avec succes',
      data: abonnement
    })
  } catch (error) {
    console.error('Erreur ajout abonnement :', error)
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors de l ajout de l abonnement'
    })
  }
}

module.exports = { obtenirAbonnements, annulerAbonnement, ajouterAbonnementManuellement }
