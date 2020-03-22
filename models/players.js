const mongoose = require('mongoose');
const CardSchema = require('./card');

module.exports =  playersSchema = mongoose.Schema({
    pseudo:{type:String, required: true},
    playerCards:{type: [CardSchema], required: true}
});
