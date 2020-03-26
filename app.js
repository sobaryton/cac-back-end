const express = require('express');
const bodyParser = require('body-parser');
const Game = require('./models/game');
const mongoose = require ('mongoose');

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

app.get('/game/:id', (req,res,next) => {
    Game.findOne({ _id: req.params.id})
    .then(
        (game) => {
            res.status(200).json(game);
        }
    )
    .catch(
        (err) => {
            res.status(400).json({ error: err });
        }
    )
    // res.json({
    //     id: req.params.id,
    //     status: 'waiting',
    //     rounds: [
    //         {
    //             roundStatus: '',
    //             roundCard: {sentence: ''},
    //             playedCards: [
    //                 {
    //                     playerId: '',
    //                     votes: {
    //                         emotion: '',
    //                         playerId: ''
    //                     },
    //                     handCardId: ''
    //                 },
    //                 {
    //                     playerId: '',
    //                     votes: {
    //                         emotion: '',
    //                         playerId: ''
    //                     },
    //                     handCardId: ''
    //                 }
    //             ]
    //         }
    //     ],
    //     players: [ { 
    //         pseudo: '',
    //         playerCards:[]
    //    }]
    // })
});

module.exports = app;