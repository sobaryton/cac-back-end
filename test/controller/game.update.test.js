const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const expect = chai.expect;
const Game = require('../../src/models/game');
const mongoose = require ('mongoose');
const chaiSubset = require('chai-subset');

mongoose.connect('mongodb+srv://Solene:ErnAC6bJ95UzC8M4@cluster0-flsqa.mongodb.net/CardsAgainstCoronavirus?retryWrites=true&w=majority',  { useUnifiedTopology: true, useNewUrlParser: true })
.then(()=>{
    console.log('Successfully connected to Mongo DB Atlas');
})
.catch(error=>{
    console.log('Error when connecting to MongoDB');
    console.error(error);
});

chai.use(chaiHttp);
chai.use(chaiSubset);

// describe('UPDATE a game information /game/:id', () => {    

//     describe ('Begin a game', () => {
//         xit('should UPDATE a given game to have the status of in progress', async () => {
//             let newGame = {
//                 status: 'in progress',
//                 rounds: [],
//                 players: []
//             }
//             newGame.save().then(
//                 () => {
//                     const res = await chai.request(app)
//                     .put(`/game/${game.id}`)
//                     .send(newGame);
//                     expect(res.body.status).to.equal('in progress');
//                 }
//             )
            
//         });
        
//     });
// });
