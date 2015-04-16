"use strict";
module.exports = function(sequelize, DataTypes) {
  var parksusers = sequelize.define("parksusers", {
    parkId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here

      }
    }
  });
  return parksusers;
};