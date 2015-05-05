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
  // res.send('working')
  request(url,function(error,response,data) {
    if(!error && response.statusCode === 200){
      var locations = JSON.parse(data);
      var venues = locations.response;
      var favorites = [];
      var times = [];
      var parks = [];
      db.checkin.findAll().then(function(list){
      list.forEach(function(time){
        times.push({time:Date.parse(time.createdAt),parkid:time.parkId,userid:time.userId});
      })
    }).then(function(){
      db.park.findAll().then(function(park){
        park.forEach(function(item){
          parks.push({name:item.name,id:item.id});
        })
      }).then(function(){
          res.render('parks/show',{venues: venues, user: user,times:times,parks:parks})
        })
      })
    }else{
      if(error){
        console.log('error',error)
      }else{
      res.redirect('/');
      }
    }
  })
})








module.exports = router;