const mongoose = require ('mongoose');
const Game = require('./models/game');

mongoose.connect('mongodb+srv://Solene:ErnAC6bJ95UzC8M4@cluster0-flsqa.mongodb.net/CardsAgainstCoronavirus?retryWrites=true&w=majority')
.then(()=>{
    console.log('Successfully connected to Mongo DB Atlas');
})
.catch(error=>{
    console.log('Error when connecting to MongoDB');
    console.error(error);
});

const soso ={
    userID:'Soso',
    playerCards:[]
};

const game = new Game({
    status: 'waiting',
    token: 'token',
    players: [
        soso
    ],
    rounds: []
});

game.save().then(
    () => {
        console.log('SAVED')
    }
).catch(
    (error) => {
        console.error(error)
    }
);