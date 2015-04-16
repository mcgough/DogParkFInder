"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    migration.addColumn('users','password' , DataTypes.STRING)
    // add altering commands here, calling 'done' when finished
    done();
  },
  down: function(migration, DataTypes, done) {
    migration.removeColumn('users','password' , DataTypes.STRING)
    // add reverting commands here, calling 'done' when finished
    done();
  }
};