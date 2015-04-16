"use strict";
module.exports = function(sequelize, DataTypes) {
  var checkin = sequelize.define("checkin", {
    userId: DataTypes.INTEGER,
    parkId: DataTypes.INTEGER
  }, {
    hooks: {
      // beforeCreate: function(checkin,options,sendback){

      // }
    },
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.checkin.belongsTo(models.user);
        models.checkin.belongsTo(models.park);
      }
    }
  });
  return checkin;
};