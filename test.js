var db = require("./models");

// db.checkin.findAll({Sinclude[db.user]}).then(function(items){
//   console.log(items);
// })

// db.checkin.create({parkId:1,userId:1}).then(function(check){
//   console.log(check.get());
// }).catch(function(err){
//   console.log('err',err);
// })

/*

{
  where:{},
  include:[db.park]
}

*/
var checkins = [];
db.checkin
  .findAll({
    include: [{ model: db.park, include: [db.user] }, db.user]
  })
  .then(function(checks) {
    checks.forEach(function(check) {
      checkins.push(check);
      // console.log(check.updatedAt);
      // console.log(check.park.name)
      // console.log(check.park) //park data
      // console.log(check.user)  //user data of user that checked in
      // console.log(check.park.users)   //list of users who favorited this park
    });
    // res.render('whatever',{checkins:checks});
    console.log(checkins);
  });

// db.park.findAll({
//   include:[db.user,db.checkin]
// }).then(function(parks){

//   //parks.users   users who favorited
//   //parks.checkins    list of checkins at this park

// })
