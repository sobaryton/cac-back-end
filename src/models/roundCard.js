const mongoose = require('mongoose');

module.exports = RoundCardSchema = new mongoose.Schema({
  sentence: {type: String, required: true},
});
