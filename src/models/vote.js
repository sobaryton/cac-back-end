const mongoose = require('mongoose');

module.exports = VoteSchema = new mongoose.Schema({
  emotion: {type: String, required: true},
  playerId: {type: String, required: true},
});
