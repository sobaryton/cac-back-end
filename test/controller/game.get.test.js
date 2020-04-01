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

describe('GET a game information /game/:id', () => {
    let game;
    let startedGame;
    let startedGameSchema;
    beforeEach(async () => {

        game = new Game();
        await game.save();

        startedGameSchema = {
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
                    roundStatus: 'finished',
                    roundCard: {sentence: 'blablabla'},
                    playedCards: [
                        {
                            playerId: 'playerID',
                            votes: [{
                                emotion: 'blabla',
                                playerId: 'playerID2'
                            }],
                            handCardId: 'hand card1'
                        },
                        {
                            playerId: 'playerID2',
                            votes: [{
                                emotion: 'blaa',
                                playerId: 'playerID'
                            }],
                            handCardId: 'hand card2'
                        }
                    ]
                },
                {
                    roundStatus: 'in progress',
                    roundCard: {sentence: 'round card 2'},
                    playedCards: []
                }
            ]
        };
        startedGame = new Game(startedGameSchema);
        await startedGame.save();

        
    });        

    describe ('New game object structure', () => {
        it('should return successful status 200', async () => {
            const res = await chai.request(app)
                .get(`/game/${game.id}`)
            expect(res.status).to.equal(200);
        });
        it('should be an object', async () => {
            const res = await chai.request(app)
                .get(`/game/${game.id}`)
            expect(res.body).to.be.an('object');
        });
        it('should contain the requested game id', async () => {
            const res = await chai.request(app)
                .get(`/game/${game.id}`)
            expect(res.body.game._id).to.equal(game.id);
        });
        it('should have a status of "waiting"', async () => {
            const res = await chai.request(app)
                .get(`/game/${game.id}`)
            expect(res.body.game.status).to.equal('waiting');
        });
        it('should have an empty list of rounds', async () => {
            const res = await chai.request(app)
                .get(`/game/${game.id}`)
            expect(res.body.game.rounds).to.be.an('array');
        });
        it('should return the same party when requested multiple times', async () => {
            const res1 = await chai.request(app)
                .get(`/game/${game.id}`);
            const res2 = await chai.request(app)
                .get(`/game/${game.id}`);
            expect(res1.body.game._id).to.equal(game.id);
            expect(res2.body.game._id).to.equal(game.id);
        });
    });

    describe('Join an existing game', () => {
        xit('should have a list of participants, containing the current user', async () => {
            const res = await chai.request(app)
                .get(`/game/${startedGame.id}`)
            expect(res.body.game.players).to.have.length.above(1);
        });
        xit('if the game already began, or finished, it should not be possible to join', async () => {
            
        });
    });

    describe('Existing Game structure', () => {
        it('should be an object with the same structure as started game', async () => {
            const res = await chai.request(app)
                .get(`/game/${startedGame.id}`);
            expect(res.body.game).to.containSubset(startedGameSchema);
        });
        it('should contain at least two players', async () => {
            const res = await chai.request(app)
                .get(`/game/${startedGame.id}`);
            expect(res.body.game.players).to.have.length.above(1);
        });
    });

    describe('Get back a begun game', () => {
        let finishedGame;
        beforeEach( async () => {
            finishedGame = new Game ({
                status: 'finished',
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
                        roundStatus: 'finished',
                        roundCard: {sentence: 'blablabla1'},
                        playedCards: [
                            {
                                playerId: 'playerID',
                                votes: [{
                                    emotion: 'blabla',
                                    playerId: 'playerID2'
                                }],
                                handCardId: 'hand card1'
                            },
                            {
                                playerId: 'playerID2',
                                votes: [{
                                    emotion: 'blaa',
                                    playerId: 'playerID'
                                }],
                                handCardId: 'hand card2'
                            }
                        ]
                    },
                    {
                        roundStatus: 'finished',
                        roundCard: {sentence: 'blablabla2'},
                        playedCards: [
                            {
                                playerId: 'playerID',
                                votes: [{
                                    emotion: 'blabla',
                                    playerId: 'playerID2'
                                }],
                                handCardId: 'hand card3'
                            },
                            {
                                playerId: 'playerID2',
                                votes: [{
                                    emotion: 'blaa',
                                    playerId: 'playerID'
                                }],
                                handCardId: 'hand card4'
                            }
                        ]
                    },
                    {
                        roundStatus: 'finished',
                        roundCard: {sentence: 'blablabla3'},
                        playedCards: [
                            {
                                playerId: 'playerID',
                                votes: [{
                                    emotion: 'blabla',
                                    playerId: 'playerID2'
                                }],
                                handCardId: 'hand card5'
                            },
                            {
                                playerId: 'playerID2',
                                votes: [{
                                    emotion: 'blaa',
                                    playerId: 'playerID'
                                }],
                                handCardId: 'hand card6'
                            }
                        ]
                    }, {
                        roundStatus: 'finished',
                        roundCard: {sentence: 'blablabla4'},
                        playedCards: [
                            {
                                playerId: 'playerID',
                                votes: [{
                                    emotion: 'blabla',
                                    playerId: 'playerID2'
                                }],
                                handCardId: 'hand card7'
                            },
                            {
                                playerId: 'playerID2',
                                votes: [{
                                    emotion: 'blaa',
                                    playerId: 'playerID'
                                }],
                                handCardId: 'hand card8'
                            }
                        ]
                    },
                    {
                        roundStatus: 'finished',
                        roundCard: {sentence: 'blablabla5'},
                        playedCards: [
                            {
                                playerId: 'playerID',
                                votes: [{
                                    emotion: 'blabla',
                                    playerId: 'playerID2'
                                }],
                                handCardId: 'hand card9'
                            },
                            {
                                playerId: 'playerID2',
                                votes: [{
                                    emotion: 'blaa',
                                    playerId: 'playerID'
                                }],
                                handCardId: 'hand card10'
                            }
                        ]
                    }
                ]
            });
            await finishedGame.save();
        });

        it('should have a round card', async () => {
            const res = await chai.request(app)
                .get(`/game/${startedGame.id}`)
            expect(res.body.game.rounds[res.body.game.rounds.length-1].roundCard.sentence).to.not.equal('');
        });

        it('should have a list per player of hand cards', async () => {
            const res = await chai.request(app)
            .get(`/game/${startedGame.id}`);

            expect(res.body.game.players).to.be.an('array');
            res.body.game.players.forEach( async player => {
                expect(player.playerCards).to.be.an('array');
                expect(player.playerCards).to.have.length.above(1);
            });
        });
        xit('should diplay the card of the actual player only', async () => {

        });
        it('if the game is in progress, should have only the last round in progress', async () => {
            const res = await chai.request(app)
            .get(`/game/${startedGame.id}`);

            expect(res.body.game.status).to.equal('in progress');
            expect(res.body.game.rounds[res.body.game.rounds.length-1].roundStatus).to.equal('in progress');
            for(let i = 0; i<res.body.game.rounds.length-1; i++){
                expect(res.body.game.rounds[i].roundStatus).to.equal('finished');
            }
        });
        it('if the game is finished, all five rounds are finished', async () => {
            const res = await chai.request(app)
            .get(`/game/${finishedGame.id}`);

            expect(res.body.game.status).to.equal('finished');
            res.body.game.rounds.forEach( async round => {
                expect(round.roundStatus).to.equal('finished');
            });
        });
    });
});
