const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Abonnement = sequelize.define('Abonnement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nom_service: {
    type: DataTypes.STRING,
    allowNull: false
  },
  montant: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  frequence: {
    type: DataTypes.ENUM('hebdomadaire', 'mensuel', 'annuel'),
    defaultValue: 'mensuel'
  },
  statut: {
    type: DataTypes.ENUM('actif', 'inactif', 'annule'),
    defaultValue: 'actif'
  },
  dernier_paiement: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  prochain_paiement: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  compte_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  detection_auto: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  nombre_paiements: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'abonnements',
  timestamps: true,
  createdAt: 'cree_le',
  updatedAt: 'modifie_le'
})

module.exports = Abonnement
