'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {}
  
  Usuario.init({
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
    type: DataTypes.DATEONLY,
    allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    senha: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuario',
    timestamps: false
  });

  Usuario.associate = (models) => {
    Usuario.hasMany(models.Pedido, {
      foreignKey: 'usuario_id',
      as: 'pedidos'
    });
  };
  return Usuario;
};