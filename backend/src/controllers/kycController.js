const { Utilisateur } = require('../models/index')
const { creerSessionKYC, verifierStatutKYC } = require('../services/kycService')
const { logSecurite } = require('../middleware/logger')

const initialiserKYC = async (req, res) => {
  try {
    const utilisateur = req.utilisateur

    if (utilisateur.kyc_verifie) {
      return res.status(400).json({
        status: 'erreur',
        message: 'Votre identite est deja verifiee'
      })
    }

    const session = await creerSessionKYC(utilisateur.id)

    if (!session.succes) {
      return res.status(500).json({
        status: 'erreur',
        message: 'Impossible de creer la session de verification'
      })
    }

    await utilisateur.update({ kyc_session_id: session.session_id })

    logSecurite('KYC_INITIALISE', utilisateur.id, { session_id: session.session_id }, true)

    return res.status(200).json({
      status: 'succes',
      message: 'Session KYC creee avec succes',
      data: {
        session_id: session.session_id,
        url_verification: session.url_verification,
        instructions: 'Ouvrez ce lien pour verifier votre identite avec votre CNI et un selfie'
      }
    })
  } catch (error) {
    console.error('Erreur initialisation KYC :', error)
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors de l initialisation du KYC'
    })
  }
}

const webhookKYC = async (req, res) => {
  try {
    const { session_id, status, vendor_data } = req.body

    console.log('[KYC WEBHOOK]', JSON.stringify(req.body))

    const utilisateur = await Utilisateur.findByPk(vendor_data)

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' })
    }

    if (status === 'Approved') {
      await utilisateur.update({ kyc_verifie: true })
      logSecurite('KYC_APPROUVE', utilisateur.id, { session_id }, true)
    } else if (status === 'Declined') {
      logSecurite('KYC_REFUSE', utilisateur.id, { session_id, status }, false)
    }

    return res.status(200).json({ message: 'Webhook recu' })
  } catch (error) {
    console.error('Erreur webhook KYC :', error)
    return res.status(500).json({ message: 'Erreur webhook' })
  }
}

const statutKYC = async (req, res) => {
  try {
    const utilisateur = req.utilisateur

    return res.status(200).json({
      status: 'succes',
      data: {
        kyc_verifie: utilisateur.kyc_verifie,
        statut: utilisateur.kyc_verifie ? 'verifie' : 'non_verifie'
      }
    })
  } catch (error) {
    return res.status(500).json({
      status: 'erreur',
      message: 'Erreur lors de la verification du statut KYC'
    })
  }
}

module.exports = { initialiserKYC, webhookKYC, statutKYC }
