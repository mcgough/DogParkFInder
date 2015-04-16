var express = require('express');
var router = express.Router();
var request = require('request');
var db = require('../models');
var bcrypt = require('bcrypt');


router.get('/register',function(req,res){
  var user = req.getUser();
  res.render('auth/register',{user:user});
});

router.post('/login',function(req,res){
  db.user.find({where:{email: req.body.email}}).then(function(user){
    if(user){
      bcrypt.compare(req.body.password, user.password, function(err,result){
        if(err){throw err; }
        if(result){
          req.session.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            parkid: user.parkid
          };
          req.flash('success',user.username + '! You are now logged in.')
          res.redirect('/');
        }else{
          req.flash('danger','Invalid password.');
          res.redirect('/');
        }
      })
    }else{
      var user = req.getUser();
      req.flash('danger','Unkown user, please sign up')
      res.redirect('/')
    }
  });
});

router.post('/register',function(req,res){
  var userQuery = {email:req.body.email};
  var userData = {
    email:req.body.email,
    username:req.body.username,
    password:req.body.password
  }
  db.user.findOrCreate({where: userQuery,defaults: userData}).spread(function(user,created){
    if(created){
      res.redirect('auth/login');
    }else{
      req.flash('danger','email already exists');
      res.redirect('/')
    }
  })
  .catch(function(error){
    console.log('error!',error);
    res.send(error);
  })
})

router.get('/login',function(req,res){
  var user = req.getUser();
  res.render('auth/login',{user:user});
})

router.get('/logout',function(req,res){
  delete req.session.user;
  req.flash('success','You are now logged out')
  res.redirect('/');
})


module.exports = router;