var express = require('express');
var router = express.Router();
const sequelize = require('../models/database');
const { Usuario, Admin, Produto } = require('../models/index'); 
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

    // Busca os pedidos daquele usuário (exemplo)
    // NOTA: Você precisará de um modelo 'Pedido' e uma associação
    const pedidos = []; 

    if (!usuario) {
      return res.status(404).send('Usuário não encontrado');
    }

    
    res.render('usuario', { 
        usuario: usuario,
        pedidos: pedidos
    });

  } catch (err) {
    console.error('Erro ao buscar perfil do usuário:', err);
    res.status(500).send('Erro ao carregar a página.');
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

    if (!nome || !cpf || !email || !senha) {
      return res.render('cadastro', { errorMessage: 'Todos os campos obrigatórios devem ser preenchidos.' });
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


// post rastrear pedidos
router.post('/pedidos/rastrear', async (req, res) => {
  try {
    const codigoPedido = req.body.codigo_pedido;

    // AINDA NÃO TEMOS O MODELO 'PEDIDO', ENTÃO É UMA SIMULAÇÃO
    console.log(`Buscando pedido com o código: ${codigoPedido}`);


    res.send(`Página para exibir os detalhes do pedido ${codigoPedido}. Rota a ser implementada!`);

  } catch (err) {
    console.error("Erro ao rastrear pedido:", err);
    res.status(500).send("Erro interno ao tentar rastrear o pedido.");
  }
});

router.get('/carrinho', function(req, res, next) {
  // Vamos buscar os itens do carrinho da sessão do usuário.
  // Se não houver carrinho, usamos uma lista vazia.
  const carrinho = req.session.carrinho || [];

  // --- CÁLCULO DOS TOTAIS ---
  let subtotal = 0;
  if (carrinho.length > 0) {
    // Usamos o método 'reduce' para somar o (preço * quantidade) de cada item.
    subtotal = carrinho.reduce((total, produto) => {
      return total + (produto.preco * produto.quantidade);
    }, 0);
  }

  // Supondo frete grátis por enquanto
  const frete = 0;
  const total = subtotal + frete;
  // --- FIM DO CÁLCULO ---

  // Renderizamos a página, passando os itens e os totais já calculados.
  res.render('carrinho', {
    carrinho: carrinho,
    subtotal: subtotal,
    total: total,
    frete: frete
  });
});

// ROTA CADASTRAR PRODUTO
router.post('/admin/cadastro-produto', isAdmin, async (req, res, next) => {
  try {
    const { nome, preco, imagem, descricao, categoria } = req.body;

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
      categoria 
    });

    res.redirect('/');

  } catch (err) {
    console.error("Erro ao cadastrar produto:", err);
    return next(err);
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