module.exports = (sequelize, DataTypes) => {
  const Pedido = sequelize.define("Pedido", {
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Pendente"
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0
    }
  }, {
    tableName: 'Pedidos',
    timestamps: false
  });

  Pedido.associate = (models) => {
    Pedido.belongsTo(models.Usuario, { 
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
  };
  return Pedido;
};
