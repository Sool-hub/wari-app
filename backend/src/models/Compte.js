const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Compte = sequelize.define('Compte', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  numero_compte: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  solde: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  devise: {
    type: DataTypes.STRING,
    defaultValue: 'XOF'
  },
  statut: {
    type: DataTypes.ENUM('actif', 'bloque', 'ferme'),
    defaultValue: 'actif'
  },
  utilisateur_id: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'comptes',
  timestamps: true,
  createdAt: 'cree_le',
  updatedAt: 'modifie_le'
})

module.exports = Compte
