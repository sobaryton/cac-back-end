const mongoose = require('mongoose');
const RoundSchema = require('./round');
const PlayerSchema = require('./players');

const gameSchema = new mongoose.Schema({
  status: {type: String, required: true, default: 'waiting'},
  owner: {type: String, required: true},
  players: {type: [PlayerSchema], required: true},
  rounds: {type: [RoundSchema], required: true},
});

module.exports = mongoose.model('Game', gameSchema);
