const Utilisateur = require('./Utilisateur')
const Compte = require('./Compte')
const Transaction = require('./Transaction')
const Carte = require('./Carte')

Utilisateur.hasOne(Compte, { foreignKey: 'utilisateur_id', as: 'compte' })
Compte.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id', as: 'utilisateur' })

Compte.hasMany(Transaction, { foreignKey: 'compte_id', as: 'transactions' })
Transaction.belongsTo(Compte, { foreignKey: 'compte_id', as: 'compte' })

Compte.hasMany(Carte, { foreignKey: 'compte_id', as: 'cartes' })
Carte.belongsTo(Compte, { foreignKey: 'compte_id', as: 'compte' })

module.exports = { Utilisateur, Compte, Transaction, Carte }
