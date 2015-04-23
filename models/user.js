"use strict";

var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define("user", {
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
        }
    },
    username: {
      type: DataTypes.STRING,
      validate: { notEmpty: true }
    },
    breed: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [8,200],
          msg: 'Password must be at least 8 characters long'
        }
      }
    },
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