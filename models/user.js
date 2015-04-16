"use strict";

var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define("user", {
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    breed: DataTypes.STRING,
    password: DataTypes.STRING,
    parkId: DataTypes.INTEGER
  }, {
    hooks: {
      beforeCreate: function(user,options,sendback){
        bcrypt.hash(user.password,10,function(err,hash){
          if(err){throw err;}
          user.password = hash;
          sendback(null,user);
        })
      }
    },
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.user.hasMany(models.checkin);
        models.user.belongsToMany(models.park,{through:'parksusers'})
      }
    }
  });
  return user;
};