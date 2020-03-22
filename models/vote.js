const mongoose = require('mongoose');

module.exports = VoteSchema = mongoose.Schema({
    emotion: {type:String, required: true},
    playerId: {type:String, required: true}
});
