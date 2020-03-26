const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const expect = chai.expect;
const Game = require('../../models/game');
const mongoose = require ('mongoose');

mongoose.connect('mongodb+srv://Solene:ErnAC6bJ95UzC8M4@cluster0-flsqa.mongodb.net/CardsAgainstCoronavirus?retryWrites=true&w=majority')
.then(()=>{
    console.log('Successfully connected to Mongo DB Atlas');
})
.catch(error=>{
    console.log('Error when connecting to MongoDB');
    console.error(error);
});

chai.use(chaiHttp);

describe('Game API', () => {
    describe('GET a game information /game/:id', () => {
        let game;
        beforeEach(async () => {
            game = new Game();
            startedGame = new Game({
                status: 'in progress',
                players: [
                   { 
                        pseudo: 'soso',
                        playerCards:['id1','id2','id3','id4','id5']
                   },
                   { 
                        pseudo: 'nico',
                        playerCards:['id6','id7','id8','id9','id10']
                    }
                ],
                rounds: [
                    {
                        status: 'finished',
                        roundCard: {sentence: 'blablabla'},
                        playedCards: [
                            {
                                playerId: 'playerID',
                                votes: {
                                    emotion: 'blabla',
                                    playerId: 'playerID2'
                                },
                                handCardId: 'hand card1'
                            },
                            {
                                playerId: 'playerID2',
                                votes: {
                                    emotion: 'blaa',
                                    playerId: 'playerID'
                                },
                                handCardId: 'hand card2'
                            }
                        ]
                    },
                    {
                        status: 'in progress',
                        roundCard: {sentence: 'round card 2'},
                        playedCards: []
                    }
                ]
            });
            await game.save();
            await startedGame.save();
        });

        it('should return successful status 200', async () => {
            const res = await chai.request(app)
                .get(`/game/${game.id}`)
            expect(res.status).to.equal(200);
        });

        describe ('New game object structure', () => {
            it('should be an object', async () => {
                const res = await chai.request(app)
                    .get(`/game/${game.id}`)
                expect(res.body).to.be.an('object');
            });
            it('should contain the requested game id', async () => {
                const res = await chai.request(app)
                    .get(`/game/${game.id}`)
                expect(res.body.id).to.equal(game.id);
            });
            it('should have a status of "waiting"', async () => {
                const res = await chai.request(app)
                    .get(`/game/${game.id}`)
                expect(res.body.status).to.equal('waiting');
            });
            xit('should have a list of participants, containing the current user', async () => {
                const res = await chai.request(app)
                    .get(`/game/${game.id}`)
                expect(res.body.status).to.equal('waiting');
            });
            it('should have an empty list of rounds', async () => {
                const res = await chai.request(app)
                    .get(`/game/${game.id}`)
                expect(res.body.rounds).to.be.an('array');
            });
        });
    });
})
