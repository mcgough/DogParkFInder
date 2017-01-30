var express = require('express');
var router = express.Router();
var request = require('request');
var db = require('../models');
var async = require('async');
var _ = require('underscore');

var fourSq = process.env.FSquare_Client,
    fourSqSec = process.env.FSquare_Secret,
    geoCodeKey = process.env.geoCodeKey;

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function metresToMiles(int) {
     return int*0.000621371192;
}

router.get('/nearme', function(req,res) {
  var coords = JSON.parse(req.query.geo),
      user = req.getUser();
      url = 'https://api.foursquare.com/v2/venues/search?client_id=' + fourSq + '&client_secret=' + fourSqSec + '&v=20130815&ll=' + coords.lat + ',' + coords.lng + '&radius=2500&query=offleash dog park';
  request(url, function(err,response,data) {
    if (!err && response.statusCode === 200) {
      var results = JSON.parse(data),
          venues = results.response.venues.filter(function(venue) {
            if (venue.categories[0]) {
              return venue.categories[0].name === "Dog Run";
            }
          });
      venues.forEach(function(venue) {
        venue.location.distance = parseFloat(metresToMiles(venue.location.distance)).toFixed(1);
      })
      venues = venues.sort(function(a,b) {
        return a.location.distance - b.location.distance;
      });
      if (!user) {
        res.render('parks/show',{venues: venues, user: user,parks:[],times:[]});
      } else {
        var userID = user.id,
            dogParks = [],
            times = [];
        db.checkin.findAll()
          .then(function(response) {
            var checkins = response;
            checkins.forEach(function(checkin) {
              times.push({time:Date.parse(checkin.createdAt),parkid:checkin.parkId,userid:checkin.userId})
            })
            db.park.findAll()
              .then(function(response) {
                var parks = response;
                db.parksusers.findAll({where:{userId: userID}})
                  .then(function(response) {
                    var ids = response;
                    parks.forEach(function(park) {
                      if (_.findWhere(ids, {parkId: park.id})) {
                        dogParks.push(park);
                      }  
                    })
                    venues.forEach(function(venue) {
                      if (_.findWhere(dogParks,{name: venue.name})) {
                        venue.favorite = true;
                      }
                    })
                    res.render('parks/show',{venues:venues, user: user, parks:dogParks,times:times});
                  })
              })
          })
      }
    }
  })
})
        

router.get('/search',function(req,res){
  
  var user = req.getUser(),
      near = req.query.q,
      fourSquareUrl = 'https://api.foursquare.com/v2/venues/search?client_id=' + fourSq + '&client_secret=' + fourSqSec + '&v=20130815&near=' + near + '&radius=2500&query=offleash dog park',
      geoCodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + near + '&key=' + process.env.geoCodeKey;
  console.log(user);
  //Get locations from 4Square
  request(fourSquareUrl,function(error,response,data) {
    if(!error && response.statusCode === 200){
      var locations = JSON.parse(data),
          favorites = [],
          times = [],
          dogParks = [],
          userParkIds = [],
          venues = locations.response.venues.filter(function(venue) {
            if (venue.categories[0]) {
              return venue.categories[0].name === "Dog Run";
            }
          });
      db.checkin.findAll()
        .then(function(list){
          list.forEach(function(time){
            times.push({time:Date.parse(time.createdAt),parkid:time.parkId,userid:time.userId});
          })
        })
        .then(function(){
          db.park.findAll()
            .then(function(parks){
              db.parksusers.findAll({where: {userId: user.id}})
                .then(function(ids) {
                  parks.forEach(function(park){
                    if (_.findWhere(ids, {parkId: park.id})) {
                      dogParks.push(park);
                    }
                  })
                  venues.forEach(function(park) {
                    if (_.findWhere(dogParks,{name: park.name})) {
                      park.favorite = true;
                    }
                  })
                })
                .then(function(){
                  res.render('parks/show',{venues: venues, user: user,times:times,parks:dogParks})
                })
          })
        })
      //Get query coords from Google
      // request(geoCodeUrl, function(error,response,data) {
      //   if (!error && response.statusCode === 200) {
      //     var data = JSON.parse(data),
      //         queryCoords = data.results[0].geometry.location;
      //     // Set distance between dog park and query
      //     venues.forEach(function(venue) {
      //       venueCoords = {
      //         lat: venue.location.lat,
      //         lng: venue.location.lng
      //       };
      //       // venue.location.distance = parseFloat(distance(venueCoords.lat,venueCoords.lng,queryCoords.lat,queryCoords.lng)).toFixed(1);
      //     });
      //     Location list sort
      //     venues = venues.sort(function(a,b) {
      //       return a.location.distance - b.location.distance;
      //     });
      //     Database call for parks and checkins
        
      //   }
      // })
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