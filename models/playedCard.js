const mongoose = require('mongoose');
const PlayerSchema = require('./players');
const VoteSchema = require('./vote');

module.exports = PlayedCardSchema = mongoose.Schema({
    player: {type:PlayerSchema, required: true},
    votes: {type:[VoteSchema], required: true}
});
