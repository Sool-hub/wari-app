const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Carte = sequelize.define('Carte', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  numero_masque: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date_expiration: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('virtuelle', 'physique'),
    defaultValue: 'virtuelle'
  },
  statut: {
    type: DataTypes.ENUM('active', 'bloquee', 'expiree'),
    defaultValue: 'active'
  },
  plafond_journalier: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 500000.00
  },
  compte_id: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'cartes',
  timestamps: true,
  createdAt: 'cree_le',
  updatedAt: 'modifie_le'
})

module.exports = Carte
