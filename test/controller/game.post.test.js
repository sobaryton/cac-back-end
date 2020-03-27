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

describe('POST a game information /game/:id', () => {     

    describe ('Create a new game', () => {
        it('should return successful status 200', async () => {
            const res = await chai.request(app)
            .post('/game');
            expect(res.status).to.equal(200);
        });

        it('should POST an object game with properties status = waiting, rounds and players', async () => {
            const res = await chai.request(app)
            .post('/game');
            expect(res.body.game).to.be.an('object');
            expect(res.body.game).to.have.property('status');
            expect(res.body.game.status).to.equal('waiting');
            expect(res.body.game).to.have.property('rounds');
            expect(res.body.game).to.have.property('players');
        });

        it('should return a different id when post called multiple times', async () => {
            const res1 = await chai.request(app)
            .post('/game');
            const res2 = await chai.request(app)
            .post('/game');
            expect(res1.body.game._id).not.equal(res2.body.game._id);
        });
    });
});
