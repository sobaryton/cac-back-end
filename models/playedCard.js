const mongoose = require('mongoose');
const PlayerSchema = require('./players');
const VoteSchema = require('./vote');

module.exports = PlayedCardSchema = mongoose.Schema({
    players: {type:{PlayerSchema}, required: true},
    votes: {type:{VoteSchema}, required: true}
});
