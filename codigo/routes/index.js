var express = require('express');
var router = express.Router();
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
