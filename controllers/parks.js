var express = require('express');
var router = express.Router();
var request = require('request');
var db = require('../models');
var async = require('async');

var fourSq = process.env.FSquare_Client;
var fourSqSec = process.env.FSquare_Secret;



router.get('/:id',function(req,res){
  var user = req.getUser();
  var near = req.query.q;
  var url = 'https://api.foursquare.com/v2/venues/search?client_id=' + fourSq + '&client_secret=' + fourSqSec + '&v=20130815&near=' + near + '&radius=6000&query=dog park';
  request(url,function(error,response,data) {
    if(!error && response.statusCode === 200){
      // console.log(data);
      var locations = JSON.parse(data);
      var venues = locations.response;
      var favorites = [];
      var times = [];
      var parks = [];
      db.checkin.findAll().then(function(list){
      // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',list);
      list.forEach(function(time){
        times.push({time:Date.parse(time.createdAt),parkid:time.parkId,userid:time.userId});
      })
    }).then(function(){
      // res.send({times:times})
      db.park.findAll().then(function(park){
        park.forEach(function(item){
          parks.push({name:item.name,id:item.id});
        })
      }).then(function(){
      res.render('parks/show',{venues: venues, user: user,times:times,parks:parks})
      })
      // db.checkin.findAll({where:{parkId},include[db.parks]}).then(function(parks){
      //   res.send({parks:parks})
      //}).then(function(){
      //   res.send({venues:venues,user:user,times:times,parks:parks})
      // })
      // db.parksusers.findAll({where: {userId:user.id}}).then(function(joins){
      //   // res.send(joins);
      //   for(var i = 0; i < joins.length; i++){
      //     favorites.push(joins[i].parkId);
      //   }
      //   var dogParks = [];
      //   // res.send({favorites:favorites});
      //   async.each(favorites,function(favorite,callback){
      //     db.park.find({where: {id:favorite}}).then(function(park){
      //       dogParks.push(park);
      //       callback();
      //     }).catch(function(error){
      //       console.log('error',error);
      //     })
      //   },function(error){
      //     if(error){
      //       console.log(error);
      //     }else{
      //       res.render('parks/show',{venues: venues, user: user, dogParks:dogParks,times:times})
      //     }
      //   })
      // })
      })
    }else{
      res.redirect('/');
    }
  })
})







module.exports = router;