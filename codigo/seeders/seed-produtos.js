// ANTES DE EXECUTAR ESSE, PRECISA EXECUTAR O 'seed-categorias.js' 

'use strict';

// 1. Importa os modelos Produto e Categoria, e a conexão sequelize
const { Produto, Categoria, sequelize } = require('../models');

async function seedProdutos() {
  console.log('Iniciando o seed de produtos...');

  try {
    // 2. Busca todas as categorias existentes no banco de dados primeiro
    const categoriasDoBanco = await Categoria.findAll({ raw: true });

    // 3. Cria um "mapa" para facilitar a busca do ID pelo nome da categoria
    // Ex: { "Cerveja": 1, "Vinho": 2, "Whisky": 3, ... }
    const mapaCategorias = {};
    categoriasDoBanco.forEach(cat => {
      mapaCategorias[cat.nome] = cat.id;
    });

    // 4. Sua lista de produtos permanece a mesma
    const produtosParaCriar = [
      {
      nome: 'Cerveja Heineken 600ml',
      preco: 10.99,
      imagem: 'https://i.pinimg.com/474x/07/91/71/0791715e0de69ffe11e48f122ab5f470.jpg',
      descricao: 'Cerveja puro malte, refrescante e saborosa.',
      quantidade: 15,
      categoria: 'Cerveja'
    },
    {
      nome: 'Vinho Tinto Miolo Seleção 750ml',
      preco: 34.90,
      imagem: 'https://53662.cdn.simplo7.net/static/53662/sku/vinhos-vinho-tinto-suave-colonial-valdameri-serra-gaucha-p-1709654192591.jpg',
      descricao: 'Vinho tinto seco, ideal para acompanhar carnes.',
      quantidade: 15,
      categoria: 'Vinho'
    },
    {
      nome: 'Whisky Johnnie Walker Red Label 1L',
      preco: 99.90,
      imagem: 'https://static.wixstatic.com/media/46fa11_3eec38da800e42349167a4d58bb01eae~mv2.jpg/v1/fill/w_480,h_480,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/46fa11_3eec38da800e42349167a4d58bb01eae~mv2.jpg',
      descricao: 'Whisky escocês clássico, sabor marcante.',
      quantidade: 15,
      categoria: 'Whisky'
    },
    {
      nome: 'Cachaça 51 965ml',
      preco: 12.50,
      imagem: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-luqlsdike6w0a2',
      descricao: 'A tradicional cachaça brasileira.',
      quantidade: 15,
      categoria: 'Cachaça'
    },
    {
      nome: 'Espumante Chandon Réserve Brut 750ml',
      preco: 69.90,
      imagem: 'https://m.media-amazon.com/images/I/51MYsJkhjhL.jpg',
      descricao: 'Espumante leve, refrescante e elegante.',
      quantidade: 15,
      categoria: 'Espumante'
    },
    {
      nome: 'Licor Amarula 750ml',
      preco: 59.90,
      imagem: 'https://carrefourbrfood.vtexassets.com/arquivos/ids/107281595/licor-amarula-750-ml-1.jpg?v=638150850822270000',
      descricao: 'Licor cremoso de fruta africana marula.',
      quantidade: 15,
      categoria: 'Licor'
    },
    {
      nome: 'Rum Bacardi Carta Blanca 980ml',
      preco: 49.90,
      imagem: 'https://images.tcdn.com.br/img/img_prod/584235/rum_bacardi_carta_blanca_garrafa_980ml_438983646_1_dbbcca2b7f42d5fc047d1db5578bad5b_20250317122741.jpg',
      descricao: 'Rum branco clássico, perfeito para drinks.',
      quantidade: 15,
      categoria: 'Rum'
    },
    {
      nome: 'Saquê Azuma Kirin 740ml',
      preco: 29.90,
      imagem: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-eGiUrIx79M3AMNGWDx98__WK0-Vs3rm0nQ&s',
      descricao: 'Saquê tradicional japonês, suave e aromático.',
      quantidade: 15,
      categoria: 'Saquê'
    },
    {
      nome: 'Gin Tanqueray 750ml',
      preco: 89.90,
      imagem: 'https://www.imigrantesbebidas.com.br/bebida/images/products/full/9095-gin-tanqueray-dry-750ml.20230807092325.jpg',
      descricao: 'Gin clássico, ideal para gin tônica.',
      quantidade: 15,
      categoria: 'Gin'
    },
    {
      nome: 'CHEVROLET MONZA GLS 2.0 EFI 4P 1996',
      preco: 21.900,
      imagem: 'https://www.chavesnamao.com.br/imn/0400x0350/A/60/veiculos/340017/7475156/chevrolet-monza-em-curitiba-pr-bf632f76.jpg',
      descricao: 'Monza GLS 2.0 EFI 1996. Placa A; Direção hidráulica; Vidros elétricos nas 4 portas; Rodas de liga leve; Documento ok.',
      quantidade: 3,
      categoria: 'Vodka'
    }
  ];

    // 5. Mapeia os produtos para o formato final, substituindo o nome da categoria pelo ID
    const produtosComCategoriaId = produtosParaCriar.map(produtoData => {
      const { categoria, ...dadosDoProduto } = produtoData;
      const categoriaId = mapaCategorias[categoria]; // Busca o ID no mapa

      if (!categoriaId) {
        console.warn(`AVISO: Categoria "${categoria}" não encontrada no banco. O produto "${produtoData.nome}" não será inserido.`);
        return null; // Retorna nulo se a categoria não for encontrada
      }

      return {
        ...dadosDoProduto,
        categoriaId: categoriaId // Adiciona o campo 'categoriaId'
      };
    }).filter(p => p !== null); // Remove os produtos cuja categoria não foi encontrada

    // 6. Insere todos os produtos de uma vez no banco
    await Produto.bulkCreate(produtosComCategoriaId, { ignoreDuplicates: true });

    console.log('Seed de produtos finalizado com sucesso!');

  } catch (error) {
    console.error('Erro ao executar o seed de produtos:', error);
  } finally {
    await sequelize.close();
  }
}


seedProdutos();