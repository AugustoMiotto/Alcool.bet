'use strict';

// Importam apenas o modelo Categoria e a conexão sequelize do index
const { Categoria, sequelize } = require('../models/index');

async function seedCategorias() {
  console.log('Iniciando o seed de categorias...');

  const categorias = [
    { nome: 'Cerveja' },
    { nome: 'Vinho' },
    { nome: 'Whisky' },
    { nome: 'Vodka' },
    { nome: 'Gin' },
    { nome: 'Rum' },
    { nome: 'Tequila' },
    { nome: 'Cachaça' },
    { nome: 'Licor' },
    { nome: 'Espumante' },
    { nome: 'Saquê' },
    { nome: 'Conhaque' }
  ];

  try {
    
    await Categoria.bulkCreate(categorias, { ignoreDuplicates: true });

    console.log('Seed de categorias finalizado com sucesso!');
  } catch (error) {
    console.error('Erro ao executar o seed de categorias:', error);
  } finally {
    // Fecha a conexão com o banco de dados
    await sequelize.close();
  }
}

// Executa a função
seedCategorias();