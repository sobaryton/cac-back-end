const mongoose = require('mongoose');
const RoundCardSchema = require('./roundCard');
const PlayedCardSchema = require('./playedCard');

module.exports = roundSchema = mongoose.Schema({
    roundStatus: {type:String, required: true},
    roundCard: {type:RoundCardSchema, required: true},
    playedCards: {type:[PlayedCardSchema], required: true}
});
