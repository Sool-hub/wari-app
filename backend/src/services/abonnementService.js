const { Op } = require('sequelize')
const { Transaction, Abonnement, Compte } = require('../models/index')

const calculerProchainPaiement = (date, frequence) => {
  const prochaine = new Date(date)
  if (frequence === 'mensuel') {
    prochaine.setMonth(prochaine.getMonth() + 1)
  } else if (frequence === 'hebdomadaire') {
    prochaine.setDate(prochaine.getDate() + 7)
  } else if (frequence === 'annuel') {
    prochaine.setFullYear(prochaine.getFullYear() + 1)
  }
  return prochaine.toISOString().split('T')[0]
}

const detecterAbonnements = async () => {
  try {
    console.log('[ABONNEMENTS] Debut de la detection automatique')

    const comptes = await Compte.findAll()

    for (const compte of comptes) {
      const transactions = await Transaction.findAll({
        where: {
          compte_id: compte.id,
          type: 'paiement_marchand',
          statut: 'reussi',
          cree_le: {
            [Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          }
        },
        order: [['cree_le', 'DESC']]
      })

      const groupes = {}
      for (const tx of transactions) {
        const cle = tx.description + '_' + parseFloat(tx.montant)
        if (!groupes[cle]) {
          groupes[cle] = []
        }
        groupes[cle].push(tx)
      }

      for (const cle in groupes) {
        const txs = groupes[cle]
        if (txs.length >= 2) {
          const nomService = txs[0].description
          const montant = parseFloat(txs[0].montant)
          const dernierPaiement = new Date(txs[0].cree_le).toISOString().split('T')[0]

          const abonnementExistant = await Abonnement.findOne({
            where: {
              compte_id: compte.id,
              nom_service: nomService,
              montant,
              statut: { [Op.ne]: 'annule' }
            }
          })

          if (!abonnementExistant) {
            const diffJours = Math.abs(
              new Date(txs[0].cree_le) - new Date(txs[1].cree_le)
            ) / (1000 * 60 * 60 * 24)

            let frequence = 'mensuel'
            if (diffJours <= 10) frequence = 'hebdomadaire'
            else if (diffJours >= 300) frequence = 'annuel'

            await Abonnement.create({
              nom_service: nomService,
              montant,
              frequence,
              dernier_paiement: dernierPaiement,
              prochain_paiement: calculerProchainPaiement(dernierPaiement, frequence),
              compte_id: compte.id,
              detection_auto: true,
              nombre_paiements: txs.length
            })

            console.log('[ABONNEMENTS] Nouvel abonnement detecte :', nomService, montant, 'XOF')
          } else {
            await abonnementExistant.update({
              dernier_paiement: dernierPaiement,
              prochain_paiement: calculerProchainPaiement(dernierPaiement, abonnementExistant.frequence),
              nombre_paiements: txs.length
            })
          }
        }
      }
    }

    console.log('[ABONNEMENTS] Detection terminee')
  } catch (error) {
    console.error('[ABONNEMENTS] Erreur detection :', error.message)
  }
}

module.exports = { detecterAbonnements, calculerProchainPaiement }
