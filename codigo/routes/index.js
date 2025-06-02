var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
// get pagina de cadastro
router.get('/cadastro', (req, res) => {
  res.render('cadastro'); // busca cadastro.ejs dentro da pasta "views"
});

router.post('/cadastrar-usuario', (req, res) => {
  const usuario = req.body;
  console.log('Novo usuário:', usuario);
  // Aqui você salva no banco, etc.
  res.redirect('/compras');
});
