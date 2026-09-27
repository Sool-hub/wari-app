const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  pin: {
    type: DataTypes.STRING,
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('actif', 'inactif', 'suspendu'),
    defaultValue: 'actif'
  },
  kyc_verifie: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date_naissance: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'utilisateurs',
  timestamps: true,
  createdAt: 'cree_le',
  updatedAt: 'modifie_le'
})

module.exports = Utilisateur
