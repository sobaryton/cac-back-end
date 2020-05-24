const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  pseudo: {type: String, required: true},
  token: {type: String, required: true},
});

module.exports = mongoose.model('User', userSchema);
