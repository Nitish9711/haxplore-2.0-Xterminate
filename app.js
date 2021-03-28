const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const multer = require('multer');
const passport = require('passport');
const PassportLocal = require('passport-local');
const app = express();


const Client = require('./models/Client');
const Lawyer = require('./models/Lawyer');
const authentication = require('./middleware/authentication');
const clientsRouter = require('./routes/clients');
const lawyersRouter = require('./routes/lawyers');
const errorController  = require('./controllers/error');

const authorization = require('./middleware/authorization');

mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');

const databaseUrl = "mongodb+srv://nitish_kumar:1234567890@cluster0.xt7ds.mongodb.net/advoc?retryWrites=true&w=majority";
mongoose
  .connect(
    databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));



app.use(express.static(path.join(__dirname,'public')));
app.use("/images",  express.static(path.join("images")));



app.use(session({
    name: 'session',
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000*60*60*24*7
    }
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use('clientLocal',new PassportLocal(Client.authenticate()));
passport.use('lawyerLocal',new PassportLocal(Lawyer.authenticate()));
passport.serializeUser(function(user,done){
  done(null,user);
});
passport.deserializeUser(function(user,done){
  if(user) done(null,user);
})

app.get('/',authorization.identifyUserType,(req,res) => {
  const local = {
    user: req.user
  }
  if(req.find && req.find.type) local.type = req.find.type;
  res.render('landing',local);
})

app.get('/pricing',authorization.identifyUserType,(req,res) => {
  const local = {
    user: req.user
  }
  if(req.find && req.find.type) local.type = req.find.type;
  res.render('pricing',local);
})

app.get('/about',authorization.identifyUserType,(req,res) => {
  const local = {
    user: req.user
  }
  if(req.find && req.find.type) local.type = req.find.type;
  res.render('about',local);
})
app.get('/contact',authorization.identifyUserType,(req,res) => {
  const local = {
    user: req.user
  }
  if(req.find && req.find.type) local.type = req.find.type;
  res.render('contact',local);
})


app.use(authorization.identifyUserType,(req,res,next) => {
  if(req.user){
    res.locals.type = req.find.type;
  }
  next();
});


app.use('/clients',clientsRouter);
app.use('/lawyers',lawyersRouter);
app.post('/logout',authentication.ensureLogin,(req,res) => {
  req.logout();
  res.redirect('/');
})

app.get('/500', errorController.get500);
app.use(errorController.get404);
app.get('*', errorController.get500);

module.exports = app;