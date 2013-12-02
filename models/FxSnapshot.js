/**
 *  FxSnapshot.js
 *
 *  Mongoose model for storing exchange rate history
 *
 */

var Mongoose = require('mongoose');

exports.FxSnapshotSchema = new Mongoose.Schema({
  // The time that the snapshot was taken
  time : { type : Date, default : Date.now },
  // Means that 'rates' can be anything
  rates : Mongoose.Schema.Types.Mixed
});

// Make sure we have an index on the time of the snapshot
exports.FxSnapshotSchema.index({ 'time' : -1 });