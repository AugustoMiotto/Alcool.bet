
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pedido extends Model {
    static associate(models) {
      // Um Pedido pertence a um Usuário
      this.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
      // Um Pedido tem muitos Itens de Pedido
      this.hasMany(models.ItemPedido, { foreignKey: 'pedido_id', as: 'itens' });
    }
  }

  Pedido.init({
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Pendente"
    },
    data: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    total: {
      type: DataTypes.DECIMAL(10, 2), // Mudei para DECIMAL para maior precisão de dinheiro
      allowNull: false,
      get() {
        const value = this.getDataValue('total');
        // Converte o valor para número antes de retorná-lo
        return value === null ? null : parseFloat(value);
      }
    }
  }, {
    sequelize,
    modelName: 'Pedido',
    tableName: 'Pedidos',
    timestamps: false
  });

  return Pedido;
};