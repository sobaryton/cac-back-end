const mongoose = require('mongoose');
const PlayerSchema = require('./players');
const VoteSchema = require('./vote');

module.exports = PlayedCardSchema = mongoose.Schema({
    playerId: {type:String, required: true},
    votes: {type:[VoteSchema], required: true},
    handCardId: {type:String, required: true}
});
