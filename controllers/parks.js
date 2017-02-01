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

function withInHourCheck(time) {
  return (new Date().getTime() / 1000 / 3600 * 60) - (Date.parse(time) / 1000 / 3600 * 60) <= 60
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
            checkedInDogParks = [],
            times = [],
            userHerePark = undefined;
        db.checkin.findAll()
          .then(function(response) {
            var checkins = response;
            checkins.forEach(function(time){
              if (withInHourCheck(time.createdAt)) {
                var timeObj = {
                  time:Date.parse(time.createdAt),
                  parkid:time.parkId,
                  userid:time.userId,
                  withInHour: withInHourCheck(time.createdAt),
                  userHere: false                  
                };
                if (userID === time.userId) {
                  timeObj.userHere = true;
                  userHerePark = timeObj;
                }
                times.push(timeObj);
              }
            })
            db.park.findAll()
              .then(function(parks){
                db.parksusers.findAll({where: {userId: user.id}})
                  .then(function(ids) {
                    parks.forEach(function(park){
                      if (_.findWhere(ids, {parkId: park.id})) {
                        dogParks.push(park);
                      }
                      if (_.findWhere(times,{parkid:park.id})) {
                        var timeObj = _.findWhere(times,{parkid:park.id});
                        var checkedInPark = {
                          name: park.name,
                          parkId: park.id,
                          count: _.where(times,{parkid:park.id}).length,
                          userHere: timeObj.userHere
                        }
                        checkedInDogParks.push(checkedInPark);

                      }
                    })
                    venues.forEach(function(park) {
                      if (_.findWhere(dogParks,{name: park.name})) {
                        park.favorite = true;
                      }
                      if (_.findWhere(checkedInDogParks, {name: park.name})) {
                        park.checkInCount = _.findWhere(checkedInDogParks, {name: park.name}).count;
                      } else {
                        park.checkInCount = 0;
                      }
                      if (_.findWhere(checkedInDogParks, {userHere: true})) {
                        park.userHere = true;
                      } else {
                        park.userHere = false;
                      }
                    })
                    res.render('parks/show',{venues:venues, user: user, userHerePark});
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
  //Get locations from 4Square
  request(fourSquareUrl,function(error,response,data) {
    if(!error && response.statusCode === 200){
      var locations = JSON.parse(data),
          favorites = [],
          times = [],
          dogParks = [],
          checkedInDogParks = [],
          userParkIds = [],
          userHerePark = undefined,
          venues = locations.response.venues.filter(function(venue) {
            if (venue.categories[0]) {
              return venue.categories[0].name === "Dog Run";
            }
          });
      db.checkin.findAll()
        .then(function(list){
          list.forEach(function(time){
            if (withInHourCheck(time.createdAt)) {
              var timeObj = {
                time:Date.parse(time.createdAt),
                parkid:time.parkId,
                userid:time.userId,
                withInHour: withInHourCheck(time.createdAt),
                userHere: false                  
              };
              if (user.id === time.userId) {
                timeObj.userHere = true;
                userHerePark = timeObj;
              }
              times.push(timeObj);
            }
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
                    if (_.findWhere(times,{parkid:park.id})) {
                      var timeObj = _.findWhere(times,{parkid:park.id});
                      var checkedInPark = {
                        name: park.name,
                        parkId: park.id,
                        count: _.where(times,{parkid:park.id}).length,
                        userHere: timeObj.userHere
                      }
                      checkedInDogParks.push(checkedInPark);

                    }
                  })
                  venues.forEach(function(park) {
                    if (_.findWhere(dogParks,{name: park.name})) {
                      park.favorite = true;
                    }
                    if (_.findWhere(checkedInDogParks, {name: park.name})) {
                      park.checkInCount = _.findWhere(checkedInDogParks, {name: park.name}).count;
                      park.appParkId = _.findWhere(checkedInDogParks, {name: park.name}).parkId;
                    } else {
                      park.checkInCount = 0;
                    }
                    if (_.findWhere(checkedInDogParks, {userHere: true})) {
                      park.userHere = true;
                    } else {
                      park.userHere = false;
                    }
                  })
                })
                .then(function(){
                  res.render('parks/show',{venues: venues, user: user,userHerePark})
                })
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