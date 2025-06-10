var express = require('express');
var router = express.Router();
const sequelize = require('../models/database');
const { Usuario, Admin } = require('../models/index'); 

const { Op } = require("sequelize"); 
const bcrypt = require('bcrypt'); 

sequelize.sync({ force: false }).then(() => {
  console.log("Tabelas sincronizadas com sucesso!");
}).catch((err) => {
  console.error("Erro ao sincronizar:", err);
});

module.exports = router;
/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    // Quando você tiver o modelo 'Produto', a linha real será esta:
    // const todosOsProdutos = await Produto.findAll();

    // Por enquanto, vamos usar dados de exemplo para o design funcionar:
    const todosOsProdutos = [
        {id: 1, nome: 'Cerveja Original 600ml', preco: '9.49', imagem: 'https://zaffari.vtexassets.com/arquivos/ids/251374/1017734-00.jpg?v=638560578016300000'},
        {id: 2, nome: 'Vinho Tinto Seco Pérgola 750 ml', preco: '24.90', imagem: 'https://www.vinicolacampestre.com.br/wp-content/uploads/2022/08/Bordo-Seco-750ml.png'},
        {id: 3, nome: 'Whisky Jack Daniel\'s', preco: '137.90', imagem: 'https://m.media-amazon.com/images/I/71osj33akML._AC_SX522_.jpg'}
        // ... e assim por diante
    ];

    res.render('index', { 
      pageStyles: 'home', // Para carregar o seu home.css
      produtos: todosOsProdutos 
    });

  } catch (err) {
    console.error("Erro ao buscar produtos para a homepage:", err);
    next(err); // Passa o erro para o error handler do Express
  }
});

const isAdmin = (req, res, next) => {
  // A condição agora é muito mais simples
  if (req.session.userId && req.session.isAdmin === true) {
    return next(); // Permite o acesso
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

    // --- LÓGICA DE ADMIN ATUALIZADA ---
    // 1. Verificamos se existe um registro na tabela Admin com o id do usuário
    const adminRecord = await Admin.findByPk(user.id);

    // 2. Guardamos o ID na sessão
    req.session.userId = user.id;

    // 3. Guardamos um booleano (true/false) na sessão indicando se é admin
    req.session.isAdmin = !!adminRecord; // '!!' converte o resultado (objeto ou null) para um booleano

    // Redireciona para a página do usuário
    res.redirect(`/usuario/${user.id}`);

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).send('Ocorreu um erro interno no servidor.');
  }
});

// GET pág senha
router.get('/esqueciSenha', function(req, res, next){
  res.render('esqueciSenha');
})

router.get('/cadastro', (req, res) => {
  res.render('cadastro', { 
    errorMessage: null 
  }); 
});

// Rota POST para cadastrar o usuário (com confirmação de senha)
router.post('/cadastrar-usuario', async (req, res) => {
  try {
    // 1. Capturar todos os dados do formulário, incluindo o novo campo
    const { nome, cpf, data_nasc, email, senha, confirmarSenha } = req.body;

    // 2. NOVA VALIDAÇÃO: Verificar se as senhas coincidem
    if (senha !== confirmarSenha) {
      // Se não coincidirem, renderiza a pág de cadastro novamente com uma msg de erro
      return res.render('cadastro', { errorMessage: 'As senhas não conferem. Por favor, tente novamente.' });
    }

    // O restante da validação continua igual...
    // 3. Validação de campos obrigatórios
    if (!nome || !cpf || !email || !senha) {
      return res.render('cadastro', { errorMessage: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }
    
    // 4. Verificar se o CPF ou E-mail já existem no banco
    const usuarioExistente = await Usuario.findOne({
      where: {
        [Op.or]: [{ email: email }, { cpf: cpf }]
      }
    });

    if (usuarioExistente) {
      return res.render('cadastro', { errorMessage: 'E-mail ou CPF já cadastrado.' });
    }

    // 5. Criptografar (hash) a senha antes de salvar
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // 6. Criar o novo usuário no banco de dados
    await Usuario.create({
      nome,
      cpf,
      data_nasc,
      email,
      senha: senhaHash 
    });

    console.log(`Usuário ${nome} (${email}) cadastrado com sucesso!`);

    // 7. Redirecionar para a página de login após o sucesso
    res.redirect('/login');

  } catch (err) {
    console.error('Erro no processo de cadastro:', err);
    res.render('cadastro', { errorMessage: 'Ocorreu um erro inesperado. Por favor, tente novamente.' });
  }
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

    // Passa ambos os objetos para a view
    res.render('usuario', { 
        usuario: usuario,
        pedidos: pedidos
    });

  } catch (err) {
    console.error('Erro ao buscar perfil do usuário:', err);
    res.status(500).send('Erro ao carregar a página.');
  }
});

router.get('/logout', (req, res, next) => {
  // O método destroy() é fornecido pelo express-session para limpar a sessão
  req.session.destroy(err => {
    if (err) {
      // Se houver um erro ao destruir a sessão, loga e passa para o error handler
      console.error('Erro ao destruir a sessão:', err);
      return next(err);
    }
    
    //limpa o cookie de sessão do navegador

    res.clearCookie('connect.sid'); 
    
    // Redireciona o usuário para a página principal após o logout
    res.redirect('/');
  });
});


// get pag produtos
router.get('/produto', function(req, res, next){
  res.render('produto');
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