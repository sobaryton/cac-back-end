const mongoose = require('mongoose');

module.exports = HandCardSchema = mongoose.Schema({
    word: {type:String, required: true}
});
