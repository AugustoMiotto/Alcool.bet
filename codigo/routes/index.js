var express = require('express');
var router = express.Router();
const sequelize = require('/models/database');
const Usuario = require('/models/Usuario');

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
})
// GET pág senha
router.get('/esqueciSenha', function(req, res, next){
  res.render('esqueciSenha');
})

// get pagina de cadastro
router.get('/cadastro', (req, res) => {
  res.render('cadastro'); 
});

router.post('/cadastrar-usuario', (req, res) => {
  const usuario = req.body;
  console.log('Novo usuário:', usuario);
  // Aqui você salva no banco, etc.
  res.redirect('/compras');
});

// get pág usuario 
router.get('/usuario', async function(req, res, next) {
  try {
    // Verifica se o usuário está autenticado
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect('/login');
    }

    // Busca o usuário e inclui seus dados relacionados
    const usuario = await Usuario.findByPk(userId, {
      include: [
        { model: Endereco, as: 'address' },
        { model: Pedido, as: 'orders' }
      ]
    });

    if (!usuario) {
      return res.status(404).send('Usuário não encontrado');
    }

    // Prepara os dados para a view
    const userData = {
      name: usuario.nome,
      firstName: usuario.nome.split(' ')[0],
      email: usuario.email,
      phone: usuario.telefone,
      cpf: usuario.cpf,
      birthDate: usuario.data_nascimento,
      receiveOffers: usuario.ofertas === true,
      initials: usuario.nome.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase(),
      address: usuario.address ? {
        street: usuario.address.rua,
        number: usuario.address.numero,
        complement: usuario.address.complemento,
        neighborhood: usuario.address.bairro,
        city: usuario.address.cidade,
        state: usuario.address.estado,
        zipCode: usuario.address.cep
      } : null,
      orders: usuario.orders ? usuario.orders.map(pedido => ({
        number: pedido.id,
        status: pedido.status,
        date: pedido.data_pedido.toLocaleDateString('pt-BR'),
        total: pedido.total
      })) : []
    };

    res.render('usuario', { user: userData });

  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar os dados do usuário.');
  }
});

// get pag produtos
router.get('/produto', function(req, res, next){
  res.render('produto');
});