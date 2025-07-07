// models/ItemPedido.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ItemPedido extends Model {}
  ItemPedido.init({
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    precoUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
    // IDs de pedido e produto virão das associações
  }, {
    sequelize,
    modelName: 'ItemPedido',
    tableName: 'ItensPedido'
  });
  return ItemPedido;
};