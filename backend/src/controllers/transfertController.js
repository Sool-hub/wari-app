const { v4: uuidv4 } = require('uuid')
const { Compte, Transaction, Utilisateur } = require('../models/index')

const transferer = async (req, res) => {
  try {
    const { telephone_destinataire, montant, description } = req.body
    const utilisateur_id = req.utilisateur.id

    if (!telephone_destinataire || !montant) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Telephone destinataire et montant sont obligatoires'
      })
    }

    if (montant < 100) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Le montant minimum de transfert est 100 XOF'
      })
    }

    if (req.utilisateur.telephone === telephone_destinataire) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Vous ne pouvez pas vous transferer de l argent a vous meme'
      })
    }

    const compteExpediteur = await Compte.findOne({
      where: { utilisateur_id }
    })

    if (!compteExpediteur) {
      return res.status(404).json({
        status: 'erreur',
        message: 'Compte expediteur introuvable'
      })
    }

    if (parseFloat(compteExpediteur.solde) < parseFloat(montant)) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Solde insuffisant'
      })
    }

    const utilisateurDestinataire = await Utilisateur.findOne({
      where: { telephone: telephone_destinataire }
    })

    if (!utilisateurDestinataire) {
      return res.status(404).json({
        status: 'erreur',
        message: 'Aucun compte Wari trouve pour ce numero de telephone'
      })
    }

    const compteDestinataire = await Compte.findOne({
      where: { utilisateur_id: utilisateurDestinataire.id }
    })

    if (!compteDestinataire) {
      return res.status(404).json({
        status: 'erreur',
        message: 'Compte destinataire introuvable'
      })
    }

    const reference = 'WR-TRF-' + uuidv4().substring(0, 8).toUpperCase()

    await compteExpediteur.update({
      solde: parseFloat(compteExpediteur.solde) - parseFloat(montant)
    })

    await compteDestinataire.update({
      solde: parseFloat(compteDestinataire.solde) + parseFloat(montant)
    })

    await Transaction.create({
      reference,
      type: 'transfert',
      montant,
      frais: 0,
      statut: 'reussi',
      operateur: 'wari',
      compte_id: compteExpediteur.id,
      telephone_expediteur: req.utilisateur.telephone,
      telephone_destinataire,
      description: description || 'Transfert Wari'
    })

    const compteActualise = await Compte.findByPk(compteExpediteur.id)

    return res.status(200).json({
      status: 'succes',
      message: 'Transfert effectue avec succes',
      data: {
        reference,
        montant,
        destinataire: {
          nom: utilisateurDestinataire.nom,
          prenom: utilisateurDestinataire.prenom,
          telephone: telephone_destinataire
        },
        nouveau_solde: compteActualise.solde,
        devise: 'XOF'
      }
    })
  } catch (error) {
    console.error('Erreur transfert :', error)
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors du transfert'
    })
  }
}

module.exports = { transferer }
