'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Categoria extends Model {
    static associate(models) {
      // Uma Categoria tem muitos Produtos
      this.hasMany(models.Produto, { foreignKey: 'categoriaId' });
    }
  }
  
  Categoria.init({
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Categoria',
    tableName: 'Categorias',
    timestamps: false
  });

  return Categoria;
};