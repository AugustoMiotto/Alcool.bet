
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ItemPedido extends Model {
    static associate(models) {
      // Um Item de Pedido pertence a um Pedido
      this.belongsTo(models.Pedido, { foreignKey: 'pedido_id' });
      // Um Item de Pedido pertence a um Produto
      this.belongsTo(models.Produto, { foreignKey: 'produto_id' });
    }
  }
  
  ItemPedido.init({
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    precoUnitario: {
      type: DataTypes.DECIMAL(10, 2), // Mudei para DECIMAL
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ItemPedido',
    tableName: 'ItensPedido',
    timestamps: false
  });

  return ItemPedido;
};