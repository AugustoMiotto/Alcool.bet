
require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

// --- PASSO 1: IMPORTAR AS NOVAS DEPENDÊNCIAS ---
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./models'); // Importa a conexão do Sequelize

const indexRouter = require('./routes/index');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// MIDDLEWARES PRINCIPAIS
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); 

// SESSÕES NO BANCO DE DADOS
const sessionStore = new SequelizeStore({
  db: sequelize,
});

//CONFIGURAÇÃO DA SESSÃO
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,   
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000 // A sessão dura por 7 dias
  } 
}));

// SINCRONIZAR O BANCO PARA CRIAR A TABELA 'Sessions' 
sessionStore.sync();


// MIDDLEWARE PARA VARIÁVEIS LOCAIS 
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.userId;
  if (req.session.userId) {
    res.locals.userId = req.session.userId;
    res.locals.isAdmin = req.session.isAdmin; 
  }
  next();
});

// ROTA 
app.use('/', indexRouter);

// TRATAMENTO DE ERRO 404 
app.use(function(req, res, next) {
  next(createError(404));
});

// ERROR HANDLER FINAL 
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;