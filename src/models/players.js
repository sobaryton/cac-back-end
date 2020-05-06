const mongoose = require('mongoose');
const HandCardSchema = require('./handCard');

module.exports =  playersSchema = mongoose.Schema({
    userID:{type:String, required: true},
    pseudo: {type:String, required: true},
    playerCards:{type: [HandCardSchema], required: true}
});
