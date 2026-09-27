const simulerPaiementOrangeMoney = async (telephone, montant, reference) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const succes = Math.random() > 0.1
  if (succes) {
    return {
      statut: 'reussi',
      reference_operateur: 'OM' + Date.now(),
      telephone,
      montant,
      reference,
      message: 'Paiement Orange Money reussi'
    }
  } else {
    return {
      statut: 'echoue',
      reference_operateur: null,
      telephone,
      montant,
      reference,
      message: 'Solde Orange Money insuffisant'
    }
  }
}

const simulerPaiementWave = async (telephone, montant, reference) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  const succes = Math.random() > 0.1
  if (succes) {
    return {
      statut: 'reussi',
      reference_operateur: 'WV' + Date.now(),
      telephone,
      montant,
      reference,
      message: 'Paiement Wave reussi'
    }
  } else {
    return {
      statut: 'echoue',
      reference_operateur: null,
      telephone,
      montant,
      reference,
      message: 'Solde Wave insuffisant'
    }
  }
}

module.exports = { simulerPaiementOrangeMoney, simulerPaiementWave }
