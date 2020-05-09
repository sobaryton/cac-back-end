const mongoose = require('mongoose');

module.exports = HandCardSchema = new mongoose.Schema({
  text: {type: String, required: true},
  id: {type: Number, required: true},
});
