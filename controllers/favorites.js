var express = require('express');
var router = express.Router();
var request = require('request');
var db = require('../models');
var async = require('async');
var _ = require('underscore');

function withInHourCheck(time) {
  return (new Date().getTime() / 1000 / 3600 * 60) - (Date.parse(time) / 1000 / 3600 * 60) <= 60
}

router.get('/index',function(req,res){
  var user = req.getUser();
  if(req.getUser()){
    var times = [],
        checkedInDogParks = [];
    db.checkin.findAll()
      .then(function(checkins){
        checkins.forEach(function(time){
          if (withInHourCheck(time.createdAt)) {
            times.push({time:Date.parse(time.createdAt),parkid:time.parkId,userid:time.userId,withInHour: withInHourCheck(time.createdAt)});
          }
        })
      })
      .then(function(){
        db.parksusers.findAll({where: {userId: req.session.user.id}})
          .then(function(data){
            var userParks = data,
                parkids = [],
                dogParks = [];
            userParks.forEach(function(park) {
              parkids.push(park.parkId);
            })
            async.each(parkids,function(parkid,callback){
              db.park.find({where:{id:parkid}})
                .then(function(park){
                  var dogPark = {
                    name: park.name,
                    id: park.id,
                    location: {
                      formattedAddress: park.address,
                      lat: park.lat,
                      lng: park.long
                    },
                    favorite: true,
                    createdAt: park.createdAt,
                    updatedAt: park.updatedAt
                  }
                  if (_.findWhere(times,{parkid:park.id})) {
                    dogPark.checkInCount = _.where(times,{parkid:park.id}).length;
                  } else {
                    dogPark.checkInCount = 0;
                  }
                  dogParks.push(dogPark);
                  callback();
                })
                .catch(function(error){
                  callback(error);
                })
              },function(error){
                if(error){
                  console.log('error',error);
                }else{
                  res.render('parks/show',{venues:dogParks,user:user,times:times,parks:{}})
                }
              })
        })
      })
  }else{
    res.redirect('/');
  }
})

router.post('/add',function(req,res){
  console.log('***********************user.id = ',req.session.user.id)
  db.user.find({where:{id:req.session.user.id}}).then(function(user){
    db.park.findOrCreate({where:{name:req.body.name,lat:req.body.lat,long:req.body.long,address:req.body.address}}).spread(function(favorite,created){
        favorite.addUser(user).then(function(join){
        res.send({add:true})
        })
      })
    })
  })

router.post('/checkin',function(req,res){
  var park = parseInt(req.body.parkid);
  var id = parseInt(req.body.userid);
  console.log('...!!!!!!!',park,id)
  db.checkin.create({parkId:park,userId:id}).then(function(check){
    res.redirect('/favorites/index');
  }).catch(function(err){
    throw err;
    res.send(err);
  })
})

router.post('/checkout',function(req,res){
  var park = parseInt(req.body.parkid);
  var id = parseInt(req.body.userid);
  console.log('...!!!!!!!',park,id)
  db.checkin.destroy({where:{userId:id}}).then(function(){
    res.redirect('/favorites/index');
  })
})

router.post('/remove',function(req,res){
  var park = parseInt(req.body.parkid);
  var id = parseInt(req.body.userid);
  console.log('...!!!!!!!',park,id);
  db.parksusers.destroy({where:{parkId:park,userId:id}}).then(function(){
    res.send({deleted:true});
  })
})

router.get('/:id',function(req,res){
  var user = req.getUser();
  var id = req.params.id;
  var parkid = id.slice(1);
  var checkin = {};
  // var peopleIds = []
  var dogs = {};
  var parkName = [];
  // console.log('!!!!!!!',typeof parkid, parseInt(parkid));
  db.park.find({where:{id:parkid}}).then(function(name){
    parkName.push(name)
  }).then(function(){
  db.checkin.findAll({where:{parkId: parkid}}).then(function(park){
    park.forEach(function(item){
      checkin[item.userId] = item.createdAt;
      // peopleIds.push(item.userId);
    })
      console.log(checkin)
  }).then(function(){
    db.user.findAll().then(function(person){
      person.forEach(function(item){
        dogs[item.id] = item.username
      })
        console.log(dogs)
    }).then(function(){
    res.render('favorites/list',{checkin:checkin,dogs:dogs,user:user,parkName:parkName})
  }).catch(function(err){
    console.log(err)
  })
})
})
})









module.exports = router;