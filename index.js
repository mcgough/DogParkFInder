var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var session = require('express-session');
var flash = require('connect-flash');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
  secret: 'ksadjflkdjflkajsd',
  resave: false,
  saveUninitialized: true
}))
app.use(flash());
app.use(function(req,res,next){
  req.getUser = function(){
    return req.session.user || false;
  }
  next();
})
app.use(function(req,res,next){
  res.locals.alerts = req.flash();
  next();
})

app.set('view engine','ejs');

app.use('/parks',require('./controllers/parks.js'));
app.use('/favorites',require('./controllers/favorites.js'))
app.use('/auth',require('./controllers/auth.js'));


app.get('/',function(req,res){
  var user = req.getUser();
  res.render('index',{user:user})
})

app.listen(process.env.PORT || 3000);







