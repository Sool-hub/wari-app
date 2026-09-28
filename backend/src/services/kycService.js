const axios = require('axios')

const creerSessionKYC = async (utilisateur_id) => {
  try {
    const response = await axios.post(
      process.env.DIDIT_API_URL + '/v3/session/',
      {
        workflow_id: process.env.DIDIT_WORKFLOW_ID,
        vendor_data: utilisateur_id,
        callback: 'https://wari-app.com/webhook/kyc'
      },
      {
        headers: {
          'x-api-key': process.env.DIDIT_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )
    return {
      succes: true,
      session_id: response.data.session_id,
      url_verification: response.data.url
    }
  } catch (error) {
    console.error('Erreur creation session KYC :', error.response?.data || error.message)
    return {
      succes: false,
      message: 'Erreur lors de la creation de la session KYC'
    }
  }
}

const verifierStatutKYC = async (session_id) => {
  try {
    const response = await axios.get(
      process.env.DIDIT_API_URL + '/v3/session/' + session_id + '/decision/',
      {
        headers: {
          'x-api-key': process.env.DIDIT_API_KEY
        }
      }
    )
    return {
      succes: true,
      statut: response.data.status,
      decision: response.data.decision
    }
  } catch (error) {
    console.error('Erreur verification statut KYC :', error.response?.data || error.message)
    return {
      succes: false,
      message: 'Erreur lors de la verification du statut KYC'
    }
  }
}

module.exports = { creerSessionKYC, verifierStatutKYC }
