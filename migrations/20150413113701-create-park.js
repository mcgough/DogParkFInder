"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("parks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING
      },
      address: {
        type: DataTypes.STRING
      },
      lat: {
        type: DataTypes.FLOAT
      },
      long: {
        type: DataTypes.FLOAT
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }).done(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable("parks").done(done);
  }
};