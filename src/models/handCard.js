const mongoose = require('mongoose');

module.exports = HandCardSchema = mongoose.Schema({
    text: {type:String, required: true},
    id: {type:Number, required: true}
});
