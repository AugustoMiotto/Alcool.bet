'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {}
  
  Admin.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
      // A referência ao modelo Usuario será criada no index.js
    }
  }, {
    sequelize,
    modelName: 'Admin',
    tableName: 'Admin',
    timestamps: false
  });

  return Admin;
};