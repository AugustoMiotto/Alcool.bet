'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Produto extends Model {
    static associate(models) {
      // Um Produto PODE ESTAR em muitos Itens de Pedido
      this.hasMany(models.ItemPedido, { foreignKey: 'produto_id' });

      // Associação com Categoria que já fizemos
      this.belongsTo(models.Categoria, { foreignKey: 'categoriaId', as: 'categoria' });
    }
  }
  

  Produto.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    preco: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      get() { // Mantendo o getter para evitar erros de .toFixed()
        const value = this.getDataValue('preco');
        return value === null ? null : parseFloat(value);
      }
    },
    imagem: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    categoriaId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Categorias',
        key: 'id'
      }
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0 
    }
  }, {
    sequelize,
    modelName: 'Produto',
    tableName: 'Produto',
    timestamps: false
  });

  return Produto;
};