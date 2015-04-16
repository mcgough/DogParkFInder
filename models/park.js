"use strict";
module.exports = function(sequelize, DataTypes) {
  var park = sequelize.define("park", {
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    lat: DataTypes.FLOAT,
    long: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.park.hasMany(models.checkin);
        models.park.belongsToMany(models.user,{through: 'parksusers'})
      }
    }
  });
  return park;
};