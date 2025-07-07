var express = require('express');
var router = express.Router();
const sequelize = require('../models/database');
const { Usuario, Admin, Produto, Pedido } = require('../models/index'); 
const crypto = require('crypto');

const { Op } = require("sequelize"); 
const bcrypt = require('bcrypt'); 

sequelize.sync({ force: false }).then(() => {
  console.log("Tabelas sincronizadas com sucesso!");
}).catch((err) => {
  console.error("Erro ao sincronizar:", err);
});

module.exports = router;


// ----- ROTAS GET -----

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const todosOsProdutos = await Produto.findAll();
    
    console.log(todosOsProdutos);

    res.render('index', { 
      pageStyles: 'home', 
      produtos: todosOsProdutos 
    });

  } catch (err) {
    console.error("Erro ao buscar produtos para a homepage:", err);
    next(err); // Passa o erro para o error handler do Express
  }
});

// Controle de acesso a páginas restritas antes do login
const isAdmin = (req, res, next) => {
  if (req.session.userId && req.session.isAdmin === true) {
    return next(); 
  }
  
  // Nega o acesso para todos os outros
  res.status(403).send('Acesso negado. Você não tem permissão para acessar esta página.');
};

// GET PÁG LOGIN
router.get('/login',function(req, res, next){
  res.render('login');
  res.render('login', { errorMessage: null });
})

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await Usuario.findOne({ where: { email: email } });

    if (!user) {
      return res.render('login', { errorMessage: 'E-mail ou senha inválidos.' });
    }

    const passwordMatch = await bcrypt.compare(senha, user.senha);

    if (!passwordMatch) {
      return res.render('login', { errorMessage: 'E-mail ou senha inválidos.' });
    }

    const adminRecord = await Admin.findByPk(user.id);

    req.session.userId = user.id;

    req.session.isAdmin = !!adminRecord; 

    res.redirect('/');

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).send('Ocorreu um erro interno no servidor.');
  }
});


// GET pág senha
router.get('/esqueci-senha', function(req, res, next){
  res.render('esqueci-senha');
})

//GET CADASTRO
router.get('/cadastro', (req, res) => {
  res.render('cadastro', { 
    errorMessage: null 
  }); 
});

// get pág usuario 
router.get('/usuario/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Busca o usuário
    const usuario = await Usuario.findByPk(userId);

    if (!usuario) {
      return res.status(404).send('Usuário não encontrado');
    }

    // Busca os pedidos do usuário
    const pedidos = await Pedido.findAll({
      where: { usuario_id: userId },
      order: [['data', 'DESC']]
    });
    
    res.render('usuario', { 
        usuario: usuario,
        pedidos: pedidos
    });

  } catch (err) {
    console.error('Erro ao buscar perfil do usuário:', err);
    res.status(500).send('Erro ao carregar a página.');
  }
});

//ROTA GET Produto
router.get('/produto/:id', async (req, res, next) => {
  try {
    // 1. Captura o ID da URL
    const produtoId = req.params.id;

    // 2. Busca no banco de dados o produto com esse ID
    const produtoEncontrado = await Produto.findByPk(produtoId);

    // 3. Verifica se o produto foi encontrado
    if (!produtoEncontrado) {
      // Se não encontrou, envia para a página de erro 404
      return next(createError(404, 'Produto não encontrado'));
    }

    // 4. Se encontrou, renderiza a página 'produto.ejs', passando os dados
    //    do produto encontrado na variável 'product'.
    res.render('produto', {
      product: produtoEncontrado,
      // Dados de exemplo para as outras seções da sua página:
      relatedProducts: [], // Você pode implementar a busca por produtos relacionados depois
    });

  } catch (err) {
    console.error("Erro ao buscar detalhes do produto:", err);
    next(err);
  }
});

//ROTA GET EDITAR PRODUTO
router.get('/admin/produtos/editar/:id', isAdmin, async (req, res, next) => {
    try {
        const produtoId = req.params.id;
        const produto = await Produto.findByPk(produtoId);

        if (!produto) {
            return next(createError(404, 'Produto não encontrado para edição.'));
        }

        // Renderiza uma nova página de edição, passando os dados do produto
        res.render('admin/editar-produto', { produto: produto });

    } catch (err) {
        next(err);
    }
});

//ROTA GET CARRINHO
router.get('/carrinho', async function(req, res, next) {
    try {
        const carrinhoSessao = req.session.carrinho || [];
        const carrinhoCompleto = [];
        let subtotal = 0;

        // Para cada item no carrinho da sessão, busca os dados completos no banco
        for (const item of carrinhoSessao) {
            const produto = await Produto.findByPk(item.id);
            if (produto) {
                carrinhoCompleto.push({
                    ...item, // Mantém os dados do carrinho (como a quantidade escolhida)
                    estoqueDisponivel: produto.quantidade // Adiciona o estoque total do produto
                });
            }
        }
        
        // Recalcula os totais com base nos dados atualizados
        subtotal = carrinhoCompleto.reduce((total, produto) => total + (produto.preco * produto.quantidade), 0);
        const total = subtotal;

        res.render('carrinho', {
            carrinho: carrinhoCompleto,
            subtotal,
            total,
            frete: 0
        });
    } catch(err) {
        next(err);
    }
});

// Rota GET para exibir página com detalhes do pedido X
router.get('/pedidos/:id', async (req, res) => {
  try {
    const pedidoId = req.params.id;

    const pedido = await Pedido.findByPk(pedidoId, {
      include: {
        model: Usuario,
        as: 'usuario'
      }
    });

    if (!pedido) {
      return res.status(404).send('Pedido não encontrado.');
    }

    // Se quiser garantir que o pedido é do usuário logado
    if (req.session.userId && pedido.usuario_id != req.session.userId) {
      return res.status(403).send('Você não tem permissão para ver este pedido.');
    }

    res.render('pedido', { pedido }); // Crie uma view chamada detalhesPedido.ejs
  } catch (err) {
    console.error('Erro ao buscar detalhes do pedido:', err);
    res.status(500).send('Erro interno do servidor.');
  }
});

// Rota para EXIBIR o formulário de redefinição de senha
router.get('/redefinir-senha/:token', async (req, res, next) => {
  try {
    const usuario = await Usuario.findOne({
      where: {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { [Op.gt]: Date.now() } // Verifica se o token não expirou
      }
    });

    if (!usuario) {
      return res.send('Token para redefinição de senha é inválido ou expirou.');
    }

    res.render('redefinir-senha');
  } catch (err) {
    next(err);
  }
});

// Rota para adicionar um produto ao carrinho - Fabricio
router.get('/admin/cadastro-produto', isAdmin, (req, res) => {
  res.render('admin/cadastro-produto', { errorMessage: null, successMessage: null });
});

// ROTA PRODUTOS
router.get('/produtos', async (req, res) => {
  try {
    const produtos = await Produto.findAll();
    res.render('produtos', { produtos });
  } catch (err) {
    res.render('produtos', { produtos: [] });
  }
});

// GET LOGOUT
router.get('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Erro ao destruir a sessão:', err);
      return next(err);
    }
    
    res.clearCookie('connect.sid'); 
    
    res.redirect('/');
  });
});


// ----- ROTAS POST -----

// Rota POST para cadastrar o usuário 
router.post('/cadastrar-usuario', async (req, res) => {
  try {
    const { nome, cpf, data_nasc, email, senha, confirmarSenha } = req.body;

    if (senha !== confirmarSenha) {
      return res.render('cadastro', { errorMessage: 'As senhas não conferem. Por favor, tente novamente.' });
    }

    if (!nome || !cpf || !email || !senha || !data_nasc) {
      return res.render('cadastro', { errorMessage: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }
    const aniversario = new Date(data_nasc);
    const hoje = new Date();
    let idade = hoje.getFullYear() - aniversario.getFullYear();
    const difmes = hoje.getMonth() - aniversario.getMonth();

    if (aniversario > hoje) {
      return res.render('cadastro', { errorMessage: 'Data de nascimento incoerente!' });
    }
    if(difmes < 0 || (difmes === 0 && hoje.getDate() < aniversario.getDate())) {
      idade--;
    }

    if (idade <18) {
      return res.render('cadastro', { errorMessage: 'Você precisa ter 18 anos ou mais para se cadastrar.' });
    }
    
    const usuarioExistente = await Usuario.findOne({
      where: {
        [Op.or]: [{ email: email }, { cpf: cpf }]
      }
    });

    if (usuarioExistente) {
      return res.render('cadastro', { errorMessage: 'E-mail ou CPF já cadastrado.' });
    }

    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    await Usuario.create({
      nome,
      cpf,
      data_nasc,
      email,
      senha: senhaHash 
    });

    console.log(`Usuário ${nome} (${email}) cadastrado com sucesso!`);

    res.redirect('/login');

  } catch (err) {
    console.error('Erro no processo de cadastro:', err);
    res.render('cadastro', { errorMessage: 'Ocorreu um erro inesperado. Por favor, tente novamente.' });
  }
});

// Rota POST para EXCLUIR USUARIO
router.post('/usuario/:id/excluir', async (req, res) => {
  try {
    const { id } = req.params;

    // Confirma qual é o usuário.
    if (req.session.userId != id) {
      return res.status(403).send('Ação não permitida.');
    }

    await Usuario.destroy({ where: { id } });

    req.session.destroy(() => {
      return res.redirect('/');
    });

  } catch (err) {
    console.error('Erro ao excluir conta:', err);

    if (res.headersSent) return;

    res.status(500).render('usuario', { errorMessage: 'Erro ao excluir a conta. Tente novamente.' });
  }
});

//Rota POST para editar dados do perfil do usuário
router.post('/usuario/:id/editar', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    // Verifica qual o user
    if (parseInt(req.session.userId) !== parseInt(id)) {
      return res.status(403).send('Ação não permitida.');
    }

    if (!nome || nome.trim() === '') {
      const usuario = await Usuario.findByPk(id);
      const pedidos = await Pedido.findAll({ where: { usuario_id: id } });
      return res.render('usuario', {
        usuario,
        pedidos,
        errorMessage: 'O nome não pode estar vazio.'
      });
    }

    await Usuario.update({ nome }, { where: { id } });

    console.log(`Usuário ${id} teve o nome alterado para "${nome}"`);

    // Recarrega a página com os dados atualizados
    const usuarioAtualizado = await Usuario.findByPk(id);
    const pedidos = await Pedido.findAll({ where: { usuario_id: id } });

    console.log(`Usuário ${id} teve o nome alterado para "${nome}"`);
    res.render('usuario', {
      usuario: usuarioAtualizado,
      pedidos,
      successMessage: 'Nome atualizado com sucesso!'
    });

  } catch (err) {
    console.error('Erro ao editar nome do usuário:', err);
    const usuario = await Usuario.findByPk(req.params.id);
    const pedidos = await Pedido.findAll({ where: { usuario_id: req.params.id } });
    res.status(500).render('usuario', {
      usuario,
      pedidos,
      errorMessage: 'Erro ao salvar alterações. Tente novamente.'
    });
  }
});



// ROTA CADASTRAR PRODUTO
router.post('/admin/cadastro-produto', isAdmin, async (req, res, next) => {
  try {
    const { nome, preco, imagem, descricao, categoria, quantidade } = req.body;

    if (!nome || !preco || !imagem) {
      return res.render('admin/cadastro-produto', { 
        errorMessage: 'Nome, preço e link da imagem são obrigatórios.' 
      });
    }

    await Produto.create({ 
      nome, 
      preco, 
      imagem, 
      descricao, 
      categoria,
      quantidade 
    });

    res.redirect('/');

  } catch (err) {
    console.error("Erro ao cadastrar produto:", err);
    return next(err);
  }
});


router.post('/admin/produtos/editar/:id', isAdmin, async (req, res, next) => {
    try {
        const produtoId = req.params.id;
        // Pega os dados atualizados do corpo do formulário
        const dadosAtualizados = req.body; 
        
        const produto = await Produto.findByPk(produtoId);

        if (produto) {
            // O método update do Sequelize salva as alterações
            await produto.update(dadosAtualizados);
            // Redireciona de volta para a página do produto para ver as alterações
            res.redirect(`/produto/${produtoId}`);
        } else {
            return res.status(404).send('Produto não encontrado para atualização.');
        }

    } catch (err) {
        next(err);
    }
});

// ROTA POST DELETAR PRODUTO
router.post('/admin/produtos/excluir/:id', isAdmin, async (req, res, next) => {
    try {
        const produtoId = req.params.id;
        const produto = await Produto.findByPk(produtoId);

        if (produto) {
            await produto.destroy(); // Comando do Sequelize para deletar o registro
            console.log(`Produto ${produtoId} excluído com sucesso.`);
            res.redirect('/'); // Redireciona para a homepage após a exclusão
        } else {
            return res.status(404).send('Produto não encontrado.');
        }

    } catch (err) {
        console.error("Erro ao excluir produto:", err);
        next(err);
    }
});


// ROTA POST Esqueci Senha
router.post('/esqueci-senha', async (req, res, next) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      // Mesmo se não encontrar o usuário, mostramos uma mensagem de sucesso
      // para não informar a um atacante se um e-mail existe ou não.
      return res.render('esqueci-senha', {
        message: 'Se um usuário com este e-mail existir em nosso sistema, um link de recuperação foi enviado.'
      });
    }

    // 1. Gerar um token seguro
    const token = crypto.randomBytes(20).toString('hex');

    // 2. Definir uma data de validade (ex: 1 hora a partir de agora)
    const expires = new Date(Date.now() + 3600000); // 1 hora em milissegundos

    // 3. Salvar o token e a data de validade no registro do usuário
    await usuario.update({
      resetPasswordToken: token,
      resetPasswordExpires: expires
    });

    // 4. (SIMULAÇÃO DE E-MAIL) Criar o link de redefinição
    const resetLink = `http://${req.headers.host}/redefinir-senha/${token}`;

    // 5. Exibir o link no console
    console.log('-----------------------------------');
    console.log('LINK PARA REDEFINIR SENHA (COPIE E COLE NO NAVEGADOR):');
    console.log(resetLink);
    console.log('-----------------------------------');

    res.render('esqueci-senha', {
      message: 'Se um usuário com este e-mail existir em nosso sistema, um link de recuperação foi enviado.'
    });

  } catch (err) {
    next(err);
  }
});


// Rota para PROCESSAR a nova senha
router.post('/redefinir-senha/:token', async (req, res, next) => {
  try {
    const usuario = await Usuario.findOne({
      where: {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!usuario) {
      return res.send('Token para redefinição de senha é inválido ou expirou.');
    }

    if (req.body.senha !== req.body.confirmarSenha) {
      return res.send('As senhas não coincidem.');
    }

    // Criptografa a nova senha
    const senhaHash = await bcrypt.hash(req.body.senha, 10);

    // Atualiza a senha e limpa os campos de token
    await usuario.update({
      senha: senhaHash,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    // Redireciona para o login com uma mensagem de sucesso
    res.redirect('/login'); // Você pode adicionar uma mensagem de sucesso aqui se quiser

  } catch (err) {
    next(err);
  }
});

//ROTA POST ADICIONAR AO CARRINHO
router.post('/carrinho/adicionar', async (req, res, next) => {
    try {
        const produtoId = req.body.produtoId;
        const quantidadeAdicionar = parseInt(req.body.quantidade, 10);

        if (!req.session.carrinho) {
            req.session.carrinho = [];
        }

        const produto = await Produto.findByPk(produtoId);
        if (!produto) {
            return res.status(404).send('Produto não encontrado!');
        }

        // VERIFICAÇÃO DE ESTOQUE
        if (produto.quantidade < quantidadeAdicionar) {
            return res.redirect(`/produto/${produtoId}?erro=estoque_insuficiente`);
        }
        
        const itemExistente = req.session.carrinho.find(item => item.id === produtoId);
        if (itemExistente) {
            // Se o item já existe, verifica se a nova quantidade total não excede o estoque
            if (produto.quantidade < itemExistente.quantidade + quantidadeAdicionar) {
                return res.redirect('/carrinho?erro=limite_estoque_atingido');
            }
            itemExistente.quantidade += quantidadeAdicionar;
        } else {
            req.session.carrinho.push({
                id: produto.id,
                nome: produto.nome,
                preco: parseFloat(produto.preco),
                imagem: produto.imagem,
                quantidade: quantidadeAdicionar
            });
        }

        res.redirect('/carrinho');
    } catch (err) {
        next(err);
    }
});

//ROTA POST ATUALIZAR CARRINHO
router.post('/carrinho/atualizar/:id', async (req, res, next) => {
    try {
        const produtoId = parseInt(req.params.id, 10);
        const novaQuantidade = parseInt(req.body.quantidade, 10);
        let carrinho = req.session.carrinho || [];

        const produto = await Produto.findByPk(produtoId);
        if (!produto) {
            return res.status(404).json({ success: false, message: 'Produto não encontrado.'});
        }

        // VERIFICAÇÃO DE ESTOQUE
        if (novaQuantidade > produto.quantidade) {
            return res.status(400).json({ success: false, message: `Estoque máximo para este item é ${produto.quantidade}.` });
        }

        const itemParaAtualizar = carrinho.find(item => item.id === produtoId);
        if (itemParaAtualizar) {
            itemParaAtualizar.quantidade = novaQuantidade;
        }

        req.session.carrinho = carrinho;
        
        // O resto da lógica para recalcular e responder com JSON continua igual...
        // ... (código para calcular totais e enviar a resposta JSON) ...
    } catch (err) {
        next(err);
    }
});

//ROTA POST REMOVER DO CARRINHO
router.post('/carrinho/remover/:id', (req, res, next) => {
  try {
    // 1. Converte o ID da URL para um NÚMERO
    const produtoId = parseInt(req.params.id, 10);
    let carrinho = req.session.carrinho || [];

    console.log('--- Removendo Item ---');
    console.log('ID para remover:', produtoId, `(Tipo: ${typeof produtoId})`);
    console.log('Carrinho ANTES:', JSON.stringify(carrinho, null, 2));

    // 2. Filtra o carrinho, mantendo os itens cujo ID é DIFERENTE do que queremos remover
    const novoCarrinho = carrinho.filter(item => item.id !== produtoId);
    
    req.session.carrinho = novoCarrinho; // Atualizamos a sessão com o novo carrinho

    console.log('Carrinho DEPOIS:', JSON.stringify(req.session.carrinho, null, 2));

    // Recalcula os totais
    const subtotal = novoCarrinho.reduce((total, produto) => total + (produto.preco * produto.quantidade), 0);
    const total = subtotal;

    res.json({ success: true, novoTotal: total.toFixed(2), novoSubtotal: subtotal.toFixed(2), carrinhoVazio: novoCarrinho.length === 0 });

  } catch (err) {
    console.error("Erro ao remover item do carrinho:", err);
    res.status(500).json({ success: false, message: 'Erro ao remover item.' });
  }
});