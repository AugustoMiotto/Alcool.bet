const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true
  },
  data_nasc: {
    type: DataTypes.DATE,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'Usuario',
  timestamps: false
});

module.exports = Usuario;
