const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM(
      'recharge',
      'retrait',
      'transfert',
      'paiement_facture',
      'paiement_marchand'
    ),
    allowNull: false
  },
  montant: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  frais: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'reussi', 'echoue', 'annule'),
    defaultValue: 'en_attente'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  operateur: {
    type: DataTypes.ENUM('orange_money', 'wave', 'moov', 'wari'),
    allowNull: true
  },
  compte_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  telephone_expediteur: {
    type: DataTypes.STRING,
    allowNull: true
  },
  telephone_destinataire: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'cree_le',
  updatedAt: 'modifie_le'
})

module.exports = Transaction
