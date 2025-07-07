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
    precoUnitario: { // Guarda o preço no momento da compra
      type: DataTypes.FLOAT,
      allowNull: false
    }
    // Os IDs de pedido e produto virão das associações
  }, {
    sequelize,
    modelName: 'ItemPedido',
    tableName: 'ItensPedido',
    timestamps: false
  });

  return ItemPedido;
};