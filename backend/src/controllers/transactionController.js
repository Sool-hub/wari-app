const { v4: uuidv4 } = require('uuid')
const { Compte, Transaction } = require('../models/index')
const { simulerPaiementOrangeMoney, simulerPaiementWave } = require('../services/mobileMoneyService')

const recharger = async (req, res) => {
  try {
    const { montant, operateur, telephone_mobile_money } = req.body
    const utilisateur_id = req.utilisateur.id

    if (!montant || !operateur || !telephone_mobile_money) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Montant, operateur et telephone sont obligatoires'
      })
    }

    if (!['orange_money', 'wave', 'moov'].includes(operateur)) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Operateur invalide. Choisir orange_money, wave ou moov'
      })
    }

    if (montant < 500) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Le montant minimum de recharge est 500 XOF'
      })
    }

    if (montant > 1000000) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Le montant maximum de recharge est 1 000 000 XOF'
      })
    }

    const compte = await Compte.findOne({ where: { utilisateur_id } })

    if (!compte) {
      return res.status(404).json({
        status: 'erreur',
        message: 'Compte introuvable'
      })
    }

    const reference = 'WR-RCH-' + uuidv4().substring(0, 8).toUpperCase()

    const transaction = await Transaction.create({
      reference,
      type: 'recharge',
      montant,
      frais: 0,
      statut: 'en_attente',
      operateur,
      compte_id: compte.id,
      telephone_expediteur: telephone_mobile_money,
      description: 'Recharge via ' + operateur
    })

    let resultat
    if (operateur === 'orange_money') {
      resultat = await simulerPaiementOrangeMoney(telephone_mobile_money, montant, reference)
    } else if (operateur === 'wave') {
      resultat = await simulerPaiementWave(telephone_mobile_money, montant, reference)
    } else {
      resultat = { statut: 'echoue', message: 'Operateur non encore integre' }
    }

    if (resultat.statut === 'reussi') {
      await transaction.update({ statut: 'reussi' })
      await compte.update({ solde: parseFloat(compte.solde) + parseFloat(montant) })

      const compteActualise = await Compte.findByPk(compte.id)

      return res.status(200).json({
        status: 'succes',
        message: 'Recharge effectuee avec succes',
        data: {
          reference,
          montant,
          operateur,
          nouveau_solde: compteActualise.solde,
          devise: 'XOF'
        }
      })
    } else {
      await transaction.update({ statut: 'echoue' })

      return res.status(400).json({
        status: 'erreur',
        message: resultat.message
      })
    }
  } catch (error) {
    console.error('Erreur recharge :', error)
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors de la recharge'
    })
  }
}

const obtenirSolde = async (req, res) => {
  try {
    const utilisateur_id = req.utilisateur.id

    const compte = await Compte.findOne({
      where: { utilisateur_id },
      include: [{
        association: 'transactions',
        limit: 5,
        order: [['cree_le', 'DESC']]
      }]
    })

    if (!compte) {
      return res.status(404).json({
        status: 'erreur',
        message: 'Compte introuvable'
      })
    }

    return res.status(200).json({
      status: 'succes',
      data: {
        numero_compte: compte.numero_compte,
        solde: compte.solde,
        devise: compte.devise,
        dernieres_transactions: compte.transactions
      }
    })
  } catch (error) {
    console.error('Erreur solde :', error)
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors de la recuperation du solde'
    })
  }
}

const obtenirHistorique = async (req, res) => {
  try {
    const utilisateur_id = req.utilisateur.id
    const { page = 1, limite = 20 } = req.query

    const compte = await Compte.findOne({ where: { utilisateur_id } })

    if (!compte) {
      return res.status(404).json({
        status: 'erreur',
        message: 'Compte introuvable'
      })
    }

    const transactions = await Transaction.findAndCountAll({
      where: { compte_id: compte.id },
      order: [['cree_le', 'DESC']],
      limit: parseInt(limite),
      offset: (parseInt(page) - 1) * parseInt(limite)
    })

    return res.status(200).json({
      status: 'succes',
      data: {
        transactions: transactions.rows,
        total: transactions.count,
        page: parseInt(page),
        pages: Math.ceil(transactions.count / parseInt(limite))
      }
    })
  } catch (error) {
    console.error('Erreur historique :', error)
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors de la recuperation de l historique'
    })
  }
}

module.exports = { recharger, obtenirSolde, obtenirHistorique }
