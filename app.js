const express = require('express');
const bodyParser = require('body-parser');
const Game = require('./src/models/game');
const mongoose = require ('mongoose');
const gameRoutes = require('./src/routes/game');

const app = express();

mongoose.connect('mongodb+srv://Solene:ErnAC6bJ95UzC8M4@cluster0-flsqa.mongodb.net/CardsAgainstCoronavirus?retryWrites=true&w=majority',  { useUnifiedTopology: true, useNewUrlParser: true })
.then(()=>{
    console.log('Successfully connected to Mongo DB Atlas');
})
.catch(error=>{
    console.log('Error when connecting to MongoDB');
    console.error(error);
});

app.use(bodyParser.json());

app.use('/game', gameRoutes);

module.exports = app;