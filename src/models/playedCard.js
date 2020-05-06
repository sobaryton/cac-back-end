const mongoose = require('mongoose');
const VoteSchema = require('./vote');
const HandCardSchema = require('./handCard');

module.exports = PlayedCardSchema = mongoose.Schema({
    playerId: {type:String, required: true},
    votes: {type:[VoteSchema], required: true},
    handCard: {type:HandCardSchema, required: true}
});
