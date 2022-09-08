const createError = require('http-errors');
const express = require('express');
const path = require('path');
// const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const passport = require('passport')
const authenticate = require('./authenticate')
require('dotenv').config()

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter')
const promotionRouter = require('./routes/promotionRouter')
const partnerRouter = require('./routes/partnerRouter')

const mongoose = require('mongoose');
const { application } = require('express');

const url = process.env.STATUS === 'dev' ? process.env.DB_DEV  : process.env.DB_PROD

const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// alternative to using then/catch (needed when chaining)
connect.then(() => console.log('Connected correctly to server'),
  err => console.log(err)
)



const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use(cookieParser(process.env.SC_KEY));
app.use(session({
  name: 'session-id',
  secret: process.env.SEC_KEY,
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth(req, res, next) {
  console.log(req.user)

  if (!req.user) {
    const err = new Error('You are not authenticated!')
    err.status = 401
    return next(err)
  } else {
      return next();
  }
}

app.use(auth)

app.use(express.static(path.join(__dirname, 'public')));

app.use('/campsites', campsiteRouter)
app.use('/promotions', promotionRouter)
app.use('/partners', partnerRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
