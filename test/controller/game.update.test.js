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

describe('UPDATE a game information /game/:id', () => { 
    beforeEach((done) => {

        Game.deleteMany({}, () => { 
            done();           
         }); 
    });   

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
                        pseudo: 'soso',
                        playerCards:['id1','id2','id3','id4','id5']
                    },
                    { 
                        pseudo: 'nico',
                        playerCards:['id6','id7','id8','id9','id10']
                    }
                ]
            });
            await beganGame.save();

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

        it('should UPDATE a given game to have the status of in progress', async () => {
            const res = await chai.request(app)
            .put(`/game/${beganGame.id}`);
            expect(res.body.game.status).to.equal('in progress');
            expect(res.status).to.equal(200);
        });
        // xit('should contain the final list of players', async () => {
        //     const res = await chai.request(app)
            
        // });
        // xit('should contain the first round info', async () => {

        // });
        
    });
    describe ('When playing a hand card', () => {
        xit('should remove the card from the hand and put it in the round', async () => {

        });
        xit('should be only possible to play one of your cards', async () => {

        });
    });
    describe ('When voting for a card', () => {
        
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

        it('should update the status of the game to finished if the last player voted during the last round and should have 5 rounds finished', async () => {
            const res = await chai.request(app)
            .put(`/game/${finishedGame.id}/round/${finishedGame.rounds[4].id}/playedCards/${finishedGame.rounds[4].playedCards[1].id}`);
            expect(res.body.game.status).to.equal('finished');
            expect(res.body.game.rounds).to.have.length.lessThan(6);
            expect(res.body.game.rounds).to.have.length.above(4);
            expect(res.status).to.equal(200);
        });

        xit('should update the round with the vote', async () => {

        });
        xit('should be possible to vote only for the current round', async () => {

        });
        xit('should be possible to vote only one time', async () => {

        });
        xit('should not be possible to vote for ourselves', async () => {

        });
        xit('should begin a new round when every player finished to vote', async () => {

        });
        
    });
});
