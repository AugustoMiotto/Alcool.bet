const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('alcool_bet', 'root', '1234', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false // define como true para ver os logs SQL
});

async function testarConexao() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados bem-sucedida!');
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
  }
}

testarConexao();

module.exports = sequelize;