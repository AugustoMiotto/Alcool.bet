var express = require('express');
var router = express.Router();
const sequelize = require('../models/database');
const Usuario = require('../models/Usuario');
const { Op } = require("sequelize"); // <-- IMPORTAR O 'Op'
const bcrypt = require('bcrypt'); 

sequelize.sync({ force: false }).then(() => {
  console.log("Tabelas sincronizadas com sucesso!");
}).catch((err) => {
  console.error("Erro ao sincronizar:", err);
});

module.exports = router;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET PÁG LOGIN
router.get('/login',function(req, res, next){
  res.render('login');
  res.render('login', { errorMessage: null });
})

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // 1. Encontrar o usuário pelo e-mail no banco de dados
    const user = await Usuario.findOne({ where: { email: email } });

    // 2. Se o usuário não for encontrado, retorna para a tela de login com erro
    if (!user) {
      return res.render('login', { errorMessage: 'E-mail ou senha inválidos.' });
    }

    // 3. Compara a senha enviada com a senha criptografada (hash) no banco
    const passwordMatch = await bcrypt.compare(senha, user.senha);

    // 4. Se as senhas não baterem, retorna para a tela de login com erro
    if (!passwordMatch) {
      return res.render('login', { errorMessage: 'E-mail ou senha inválidos.' });
    }

    // 5. SE TUDO ESTIVER CORRETO: Login bem-sucedido!
    // Guardamos o ID do usuário na sessão. É isso que o mantém "logado".
    req.session.userId = user.id;

    // 6. Redireciona o usuário para sua página de perfil (ou outra página, como /compras)
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

// get pagina de cadastro
router.get('/cadastro', (req, res) => {
  res.render('cadastro'); 
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
router.get('/usuario/:id', async function(req, res) {
  try {
    // 1. Pega o ID que veio na URL (ex: /usuario/1, id será "1")
    const userId = req.params.id;

    // 2. Busca UM usuário no banco com esse ID
    const usuarioEncontrado = await Usuario.findByPk(userId);

    // 3. Verifica se o usuário foi realmente encontrado
    if (usuarioEncontrado) {
      // 4. Renderiza a página 'usuario' e passa o objeto encontrado
      //    com o nome de "user", que é o que o EJS espera.
      res.render('usuario', { user: usuarioEncontrado });
    } else {
      // Se não encontrar, envia uma página de erro 404
      res.status(404).send('Usuário não encontrado');
    }

  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).send('Erro ao carregar a página do usuário');
  }
});

// get pag produtos
router.get('/produto', function(req, res, next){
  res.render('produto');
});