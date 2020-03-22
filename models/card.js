const mongoose = require('mongoose');

module.exports = CardSchema = mongoose.Schema({
    word: {type:String, required: true}
});
