const mongoose = require ('mongoose');
const Game = require('./models/game');

mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING)
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