const { body, param, validationResult } = require('express-validator')

const valider = (req, res, next) => {
  const erreurs = validationResult(req)
  if (!erreurs.isEmpty()) {
    return res.status(400).json({
      status: 'erreur',
      message: 'Donnees invalides',
      erreurs: erreurs.array().map(e => ({
        champ: e.path,
        message: e.msg
      }))
    })
  }
  next()
}

const reglesInscription = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est obligatoire')
    .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/).withMessage('Le nom contient des caracteres invalides'),

  body('prenom')
    .trim()
    .notEmpty().withMessage('Le prenom est obligatoire')
    .isLength({ min: 2, max: 50 }).withMessage('Le prenom doit contenir entre 2 et 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/).withMessage('Le prenom contient des caracteres invalides'),

  body('telephone')
    .trim()
    .notEmpty().withMessage('Le telephone est obligatoire')
    .matches(/^[0-9]{8}$/).withMessage('Le telephone doit contenir exactement 8 chiffres'),

  body('pin')
    .notEmpty().withMessage('Le PIN est obligatoire')
    .matches(/^\d{4}$/).withMessage('Le PIN doit contenir exactement 4 chiffres'),

  body('date_naissance')
    .optional()
    .isDate().withMessage('La date de naissance est invalide')
    .custom(val => {
      const age = (new Date() - new Date(val)) / (365.25 * 24 * 60 * 60 * 1000)
      if (age < 18) throw new Error('Vous devez avoir au moins 18 ans')
      return true
    })
]

const reglesConnexion = [
  body('telephone')
    .trim()
    .notEmpty().withMessage('Le telephone est obligatoire')
    .matches(/^[0-9]{8}$/).withMessage('Format de telephone invalide'),

  body('pin')
    .notEmpty().withMessage('Le PIN est obligatoire')
    .matches(/^\d{4}$/).withMessage('Format de PIN invalide')
]

const reglesRecharge = [
  body('montant')
    .notEmpty().withMessage('Le montant est obligatoire')
    .isFloat({ min: 500, max: 1000000 }).withMessage('Le montant doit etre entre 500 et 1 000 000 XOF'),

  body('operateur')
    .notEmpty().withMessage('L operateur est obligatoire')
    .isIn(['orange_money', 'wave', 'moov']).withMessage('Operateur invalide'),

  body('telephone_mobile_money')
    .trim()
    .notEmpty().withMessage('Le numero Mobile Money est obligatoire')
    .matches(/^[0-9]{8}$/).withMessage('Format de numero invalide')
]

const reglesTransfert = [
  body('telephone_destinataire')
    .trim()
    .notEmpty().withMessage('Le telephone destinataire est obligatoire')
    .matches(/^[0-9]{8}$/).withMessage('Format de telephone invalide'),

  body('montant')
    .notEmpty().withMessage('Le montant est obligatoire')
    .isFloat({ min: 100, max: 5000000 }).withMessage('Le montant doit etre entre 100 et 5 000 000 XOF'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La description ne peut pas depasser 200 caracteres')
    .escape()
]

const reglesAbonnement = [
  body('nom_service')
    .trim()
    .notEmpty().withMessage('Le nom du service est obligatoire')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caracteres')
    .escape(),

  body('montant')
    .notEmpty().withMessage('Le montant est obligatoire')
    .isFloat({ min: 100, max: 1000000 }).withMessage('Le montant doit etre entre 100 et 1 000 000 XOF'),

  body('frequence')
    .optional()
    .isIn(['hebdomadaire', 'mensuel', 'annuel']).withMessage('Frequence invalide'),

  body('prochain_paiement')
    .notEmpty().withMessage('La date du prochain paiement est obligatoire')
    .isDate().withMessage('Format de date invalide')
    .custom(val => {
      if (new Date(val) <= new Date()) {
        throw new Error('La date doit etre dans le futur')
      }
      return true
    })
]

const reglesAnnulerAbonnement = [
  param('id')
    .isUUID().withMessage('ID abonnement invalide')
]

module.exports = {
  valider,
  reglesInscription,
  reglesConnexion,
  reglesRecharge,
  reglesTransfert,
  reglesAbonnement,
  reglesAnnulerAbonnement
}
