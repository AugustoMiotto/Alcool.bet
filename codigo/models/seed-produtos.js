const { Produto } = require('./index');

async function seedProdutos() {
  const produtos = [
    {
      nome: 'Cerveja Heineken 600ml',
      preco: 10.99,
      imagem: 'https://i.pinimg.com/474x/07/91/71/0791715e0de69ffe11e48f122ab5f470.jpg',
      descricao: 'Cerveja puro malte, refrescante e saborosa.',
      categoria: 'Cerveja'
    },
    {
      nome: 'Vinho Tinto Miolo Seleção 750ml',
      preco: 34.90,
      imagem: 'https://53662.cdn.simplo7.net/static/53662/sku/vinhos-vinho-tinto-suave-colonial-valdameri-serra-gaucha-p-1709654192591.jpg',
      descricao: 'Vinho tinto seco, ideal para acompanhar carnes.',
      categoria: 'Vinho'
    },
    {
      nome: 'Whisky Johnnie Walker Red Label 1L',
      preco: 99.90,
      imagem: 'https://static.wixstatic.com/media/46fa11_3eec38da800e42349167a4d58bb01eae~mv2.jpg/v1/fill/w_480,h_480,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/46fa11_3eec38da800e42349167a4d58bb01eae~mv2.jpg',
      descricao: 'Whisky escocês clássico, sabor marcante.',
      categoria: 'Whisky'
    },
    {
      nome: 'Cachaça 51 965ml',
      preco: 12.50,
      imagem: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-luqlsdike6w0a2',
      descricao: 'A tradicional cachaça brasileira.',
      categoria: 'Cachaça'
    },
    {
      nome: 'Espumante Chandon Réserve Brut 750ml',
      preco: 69.90,
      imagem: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-luqlsdike6w0a2',
      descricao: 'Espumante leve, refrescante e elegante.',
      categoria: 'Espumante'
    },
    {
      nome: 'Licor Amarula 750ml',
      preco: 59.90,
      imagem: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-luqlsdike6w0a2',
      descricao: 'Licor cremoso de fruta africana marula.',
      categoria: 'Licor'
    },
    {
      nome: 'Rum Bacardi Carta Blanca 980ml',
      preco: 49.90,
      imagem: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-luqlsdike6w0a2',
      descricao: 'Rum branco clássico, perfeito para drinks.',
      categoria: 'Rum'
    },
    {
      nome: 'Saquê Azuma Kirin 740ml',
      preco: 29.90,
      imagem: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-luqlsdike6w0a2',
      descricao: 'Saquê tradicional japonês, suave e aromático.',
      categoria: 'Saquê'
    },
    {
      nome: 'Gin Tanqueray 750ml',
      preco: 89.90,
      imagem: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-luqlsdike6w0a2',
      descricao: 'Gin clássico, ideal para gin tônica.',
      categoria: 'Gin'
    }
  ];

  for (const produto of produtos) {
    await Produto.create(produto);
  }
  console.log('Seed de produtos finalizado!');
}

seedProdutos().then(() => process.exit()).catch(console.error);
