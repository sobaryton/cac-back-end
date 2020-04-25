const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const expect = chai.expect;
const Game = require('../../src/models/game');
const mongoose = require ('mongoose');
const chaiSubset = require('chai-subset');

before(() => {
    mongoose.connect('mongodb+srv://Solene:ErnAC6bJ95UzC8M4@cluster0-flsqa.mongodb.net/CardsAgainstCoronavirus?retryWrites=true&w=majority',  { useUnifiedTopology: true, useNewUrlParser: true })
    .then(()=>{
        console.log('Successfully connected to Mongo DB Atlas');
    })
    .catch(error=>{
        console.log('Error when connecting to MongoDB');
        console.error(error);
    });
});

after(() => {
    mongoose.disconnect(() => {
        mongoose.models = {};
        mongoose.modelSchemas = {};
        mongoose.connection.close();
    });
});

chai.use(chaiHttp);
chai.use(chaiSubset);

describe('UPDATE a game information /game/:id', () => { 
    describe ('Begin a game', () => {
        let game;
        let beganGame;
        beforeEach( async () => {

            game = new Game();
            await game.save();

            beganGame = new Game({
                status: 'in progress',
                rounds: [
                    {
                        roundStatus: 'in progress',
                        roundCard: {sentence: 'round card 1'},
                        playedCards: []
                    }
                ],
                players: [
                    { 
                        userID: 'soso',
                        playerCards:[]
                    },
                    { 
                        userID: 'nico',
                        playerCards:[]
                    }
                ]
            });
            await beganGame.save();

            startedGameSchema = {
                status: 'in progress',
                players: [
                    { 
                        userID: 'soso',
                        playerCards:[]
                    },
                    { 
                        userID: 'nico',
                        playerCards:[]
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

        it('should UPDATE a given game to have the status of in progress', async () => {
            const res = await chai.request(app)
            .put(`/game/${beganGame.id}`);
            expect(res.status).to.equal(200);
            expect(res.body.game.status).to.equal('in progress');
            
        });
        // xit('should contain the final list of players', async () => {
        //     const res = await chai.request(app)
            
        // });
        // xit('should contain the first round info', async () => {

        // });
        
    });
    
    describe ('When voting for a card', () => {
        let userId;
        let agent;
        let startedGame;
        let finishedGame;
        let startedGameNewRound;

        beforeEach( async () => {

            agent = chai.request.agent(app);
            const res = await agent
            .get(`/user`);
            userId = res.body.userId;
            console.log(userId);

            startedGame = new Game ({
                status: 'in progress',
                players: [
                    { 
                        userID: userId,
                        playerCards:['id2','id3','id4','id5']
                    },
                    { 
                        userID: 'nico',
                        playerCards:['id7','id8','id9','id10']
                    }
                ],
                rounds: [
                    {
                        roundStatus: 'finished',
                        roundCard: {sentence: 'blablabla'},
                        playedCards: [
                            {
                                playerId: userId,
                                votes: [{
                                    emotion: 'blabla',
                                    playerId: 'nico'
                                }],
                                handCardId: 'id1'
                            },
                            {
                                playerId: 'nico',
                                votes: [{
                                    emotion: 'blabla',
                                    playerId: userId
                                }],
                                handCardId: 'id6'
                            }
                        ]
                    }
                ]
            });
            await startedGame.save(); 

            startedGameNewRound = new Game ({
                status: 'in progress',
                players: [
                    { 
                        userID: userId,
                        playerCards:['id2','id3','id4','id5']
                    },
                    { 
                        userID: 'nico',
                        playerCards:['id7','id8','id9','id10']
                    }
                ],
                rounds: [
                    {
                        roundStatus: 'in progress',
                        roundCard: {sentence: 'blablabla'},
                        playedCards: [
                            {
                                playerId: userId,
                                votes: [{
                                    emotion: 'blabla',
                                    playerId: 'nico'
                                }],
                                handCardId: 'id1'
                            },
                            {
                                playerId: 'nico',
                                votes: [],
                                handCardId: 'id6'
                            }
                        ]
                    }
                ]
            });
            await startedGameNewRound.save(); 

            finishedGame = new Game ({
                status: 'finished',
                players: [
                    { 
                        userID: userId,
                        playerCards:['id1','id2','id3','id4','id5']
                    },
                    { 
                        userID: 'nico',
                        playerCards:['id6','id7','id8','id9','id10']
                    }
                ],
                rounds: [
                    {
                        roundStatus: 'finished',
                        roundCard: {sentence: 'blablabla1'},
                        playedCards: [
                            {
                                playerId: userId,
                                votes: [{
                                    emotion: 'blabla',
                                    playerId: 'nico'
                                }],
                                handCardId: 'id1'
                            },
                            {
                                playerId: 'nico',
                                votes: [{
                                    emotion: 'blaa',
                                    playerId: userId
                                }],
                                handCardId: 'id6'
                            }
                        ]
                    },
                    {
                        roundStatus: 'finished',
                        roundCard: {sentence: 'blablabla2'},
                        playedCards: [
                            {
                                playerId: userId,
                                votes: [{
                                    emotion: 'blabla',
                                    playerId: 'nico'
                                }],
                                handCardId: 'id2'
                            },
                            {
                                playerId: 'nico',
                                votes: [{
                                    emotion: 'blaa',
                                    playerId: userId
                                }],
                                handCardId: 'id7'
                            }
                        ]
                    },
                    {
                        roundStatus: 'finished',
                        roundCard: {sentence: 'blablabla3'},
                        playedCards: [
                            {
                                playerId: userId,
                                votes: [{
                                    emotion: 'blabla',
                                    playerId: 'nico'
                                }],
                                handCardId: 'id3'
                            },
                            {
                                playerId: 'nico',
                                votes: [{
                                    emotion: 'blaa',
                                    playerId: userId
                                }],
                                handCardId: 'id8'
                            }
                        ]
                    }, {
                        roundStatus: 'finished',
                        roundCard: {sentence: 'blablabla4'},
                        playedCards: [
                            {
                                playerId: userId,
                                votes: [{
                                    emotion: 'blabla',
                                    playerId: 'nico'
                                }],
                                handCardId: 'id4'
                            },
                            {
                                playerId: 'nico',
                                votes: [{
                                    emotion: 'blaa',
                                    playerId: userId
                                }],
                                handCardId: 'id9'
                            }
                        ]
                    },
                    {
                        roundStatus: 'finished',
                        roundCard: {sentence: 'blablabla5'},
                        playedCards: [
                            {
                                playerId: userId,
                                votes: [{
                                    emotion: 'blabla',
                                    playerId: 'nico'
                                }],
                                handCardId: 'id5'
                            },
                            {
                                playerId: 'nico',
                                votes: [{
                                    emotion: 'blaa',
                                    playerId: userId
                                }],
                                handCardId: 'id10'
                            }
                        ]
                    }
                ]
            });
            await finishedGame.save();
        });

        it('should update the status of the game to finished if the last player voted during the last round and should have 5 rounds finished', async () => {
            const res = await chai.request(app)
            .put(`/game/${finishedGame.id}/round/${finishedGame.rounds[4].id}/playedCards/${finishedGame.rounds[4].playedCards[1].id}`);
            expect(res.body.game.status).to.equal('finished');
            expect(res.body.game.rounds).to.have.length.lessThan(6);
            expect(res.body.game.rounds).to.have.length.above(4);
            expect(res.status).to.equal(200);
        });

        it('should update the round with the vote', async () => {
            const info = { emotion: 'emotion' }
            const res = await agent
            .put(`/game/${startedGameNewRound.id}/round/${startedGameNewRound.rounds[0].id}/playedCards/${startedGameNewRound.rounds[0].playedCards[1].id}`)
            .send(info);
            const pathToVote = res.body.game.rounds[0].playedCards[1].votes;
            expect(pathToVote[pathToVote.length-1].emotion).to.equal(info.emotion);
            expect(pathToVote[pathToVote.length-1].playerId).to.equal(userId);
        });
        xit('should be possible to vote only for the current round', async () => {

        });
        it('should not be possible to vote more than one time in the same round', async () => {
            const info = { emotion: 'emotion' }
            const res = await agent
            .put(`/game/${startedGame.id}/round/${startedGame.rounds[0].id}/playedCards/${startedGame.rounds[0].playedCards[1].id}`)
            .send(info);
            expect(res.status).to.equal(400);
        });
        it('should not be possible to vote for ourselves', async () => {
            const info = { emotion: 'emotion' }
            const res = await agent
            .put(`/game/${startedGame.id}/round/${startedGame.rounds[0].id}/playedCards/${startedGame.rounds[0].playedCards[0].id}`)
            .send(info);
            expect(res.status).to.equal(400);
        });
        it('should begin a new round when every player finished to vote', async () => {
            const info = { emotion: 'emotion' }
            const res = await agent
            .put(`/game/${startedGameNewRound.id}/round/${startedGameNewRound.rounds[0].id}/playedCards/${startedGameNewRound.rounds[0].playedCards[1].id}`)
            .send(info);
            const pathToRound = res.body.game.rounds;
            expect(pathToRound[pathToRound.length-1].roundStatus).to.equal('in progress');
            expect(pathToRound[pathToRound.length-2].roundStatus).to.equal('finished');
            expect(pathToRound[pathToRound.length-1].roundCard.sentence).to.have.length.above(0);
        });
        it('should have a new round card different from the previous ones when a new round is created', async () => {
            const info = { emotion: 'emotion' }
            const res = await agent
            .put(`/game/${startedGameNewRound.id}/round/${startedGameNewRound.rounds[0].id}/playedCards/${startedGameNewRound.rounds[0].playedCards[1].id}`)
            .send(info);

            const pathToRound = res.body.game.rounds;
            let existingRoundCards = startedGameNewRound.rounds.map( round => round.roundCard.sentence );
            let newRoundCard = pathToRound[pathToRound.length-1].roundCard.sentence;

            expect(existingRoundCards).not.to.include(newRoundCard);
        });
    });
});
