/**
 *  Product.js
 *
 *  Mongoose model for a product
 *
 */

var Mongoose = require('mongoose');

exports.ProductSchema = new Mongoose.Schema({
  name : String,
  price : {
    price : Number,
    currency : String
  },
  picture : String
});