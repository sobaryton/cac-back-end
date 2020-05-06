const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const expect = chai.expect;
const Game = require('../../src/models/game');
const mongoose = require ('mongoose');
const chaiSubset = require('chai-subset');

before((done) => {
    mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(()=>{
        console.log('Successfully connected to Mongo DB Atlas');
        done()
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

describe('GET a game information /game/:id', () => {
    let game;
    let startedGame;
    let startedGameSchema;
    let agent;
    let pseudo;
    let userId;
    let waitingGameStart;
    let startedGame2;
    let gameWith6Players;
    beforeEach(async () => {

        agent = chai.request.agent(app);
        const res = await agent
        .get(`/user`);
        userId = res.body.userId;
        pseudo = res.body.pseudo;

        game = new Game({
            owner: userId
        });
        await game.save();

        waitingGameStart = new Game({
            status: 'waiting',
            owner: 'nico',
            players: [
                { 
                    userID: 'nico',
                    pseudo: 'niKKo',
                    playerCards:[]
                }
            ]
        });
        await waitingGameStart.save();

        startedGameSchema = {
            status: 'in progress',
            owner: userId,
            players: [
                { 
                    userID: userId,
                    pseudo: pseudo,
                    playerCards:[{text: "id1", id: 0}, {text: "id2", id: 1},{text: "id3", id: 2},{text: "id4", id: 3},{text: "id5", id: 4}]
                },
                { 
                    userID: 'nico',
                    pseudo: 'niKKo',
                    playerCards:[{text: "id6", id: 5}, {text: "id7", id: 6},{text: "id8", id: 7},{text: "id9", id: 8},{text: "id10", id: 9}]
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
                                emotion: 'cute',
                                playerId: 'nico'
                            }],
                            handCardId: 'id1'
                        },
                        {
                            playerId: 'playerID2',
                            votes: [{
                                emotion: 'cute',
                                playerId: userId
                            }],
                            handCardId: 'id2'
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

        startedGame2 = new Game({
            status: 'in progress',
            owner: 'nico',
            players: [
                { 
                    userID: 'nico',
                    pseudo: 'niKKo',
                    playerCards:[{text: "id6", id: 5}, {text: "id7", id: 6},{text: "id8", id: 7},{text: "id9", id: 8},{text: "id10", id: 9}]
                },
                { 
                    userID: 'blablateur',
                    pseudo: 'bbee',
                    playerCards:[{text: "id1", id: 0}, {text: "id2", id: 1},{text: "id3", id: 2},{text: "id4", id: 3},{text: "id5", id: 4}]
                }
            ]
        });
        await startedGame2.save();

        gameWith6Players = new Game({
            status: 'waiting',
            owner: 'nico',
            players: [
                { 
                    userID: 'nico',
                    pseudo: 'niKKo',
                    playerCards:[]
                },
                { 
                    userID: 'blablateur',
                    pseudo: 'bbee',
                    playerCards:[]
                },
                { 
                    userID: 'blablaafwcwteur',
                    pseudo: 'aclndlc',
                    playerCards:[]
                },
                { 
                    userID: 'blablsdfwvateur',
                    pseudo: 'alkc',
                    playerCards:[]
                },
                { 
                    userID: 'blablatedsfegur',
                    pseudo: 'lnclwjcn',
                    playerCards:[]
                },
                { 
                    userID: 'blabldsateur',
                    pseudo: 'sldncln',
                    playerCards:[]
                }
            ]
        });
        await gameWith6Players.save();
        
    });        

    describe ('New game object structure', () => {
        it('should return successful status 200', async () => {
            const res = await agent
                .get(`/game/${game.id}`);
            expect(res.status).to.equal(200);
        });
        it('should be an object', async () => {
            const res = await agent
                .get(`/game/${game.id}`)
            expect(res.body).to.be.an('object');
        });
        it('should contain the requested game id', async () => {
            const res = await agent
                .get(`/game/${game.id}`)
            expect(res.body.game._id).to.equal(game.id);
        });
        it('should have a status of "waiting"', async () => {
            const res = await agent
                .get(`/game/${game.id}`)
            expect(res.body.game.status).to.equal('waiting');
        });
        it('should have an empty list of rounds', async () => {
            const res = await agent
                .get(`/game/${game.id}`)
            expect(res.body.game.rounds).to.be.an('array');
        });
        it('should return the same party when requested multiple times', async () => {
            const res1 = await agent
                .get(`/game/${game.id}`);
            const res2 = await agent
                .get(`/game/${game.id}`);
            expect(res1.body.game._id).to.equal(game.id);
            expect(res2.body.game._id).to.equal(game.id);
        });
    });

    describe('Join an existing game', () => {

        it('should have a list of participants, containing the current user', async () => {
            const res = await agent
                .get(`/game/${game.id}`)
            let player = res.body.game.players.filter( p => p.userID === userId )[0];
            expect(player.userID).to.equal(userId);
        });
        it('should add the new player in the game', async () => {
            const res = await agent
                .get(`/game/${waitingGameStart.id}`)
            
            let player = res.body.game.players.filter( p => p.userID === userId )[0];
            expect(player.userID).to.equal(userId);
            expect(player.pseudo).to.equal(pseudo);
        });
        it('if the game already began, or finished, it should not be possible to join', async () => {
            const res = await agent
            .get(`/game/${startedGame2.id}`);
            expect(res.status).to.equal(400);
        });
        // it('should not accept more than 6 players', async () => {
        //     const res = await agent
        //     .get(`/game/${gameWith6Players.id}`);
        //     expect(res.status).to.equal(400);
        // });
    });

    describe('Existing Game structure', () => {
        it('should be an object with the same structure as started game', async () => {
            const res = await agent
                .get(`/game/${startedGame.id}`);
            expect(res.body.game).to.containSubset(startedGameSchema);
        });
        it('should contain at least two players', async () => {
            const res = await agent
                .get(`/game/${startedGame.id}`);
            expect(res.body.game.players).to.have.length.above(1);
        });
    });

    describe('Get back a begun game', () => {
        let finishedGame;
        beforeEach( async () => {
            finishedGame = new Game ({
                status: 'finished',
                owner: 'nico',
                players: [
                    { 
                        userID: userId,
                        pseudo: pseudo,
                        playerCards:[{text: "id1", id: 0}, {text: "id2", id: 1},{text: "id3", id: 2},{text: "id4", id: 3},{text: "id5", id: 4}]
                    },
                    { 
                        userID: 'nico',
                        pseudo: 'niKKo',
                        playerCards:[{text: "id6", id: 5}, {text: "id7", id: 6},{text: "id8", id: 7},{text: "id9", id: 8},{text: "id10", id: 9}]
                    }
                ],
                rounds: [
                    {
                        roundStatus: 'finished',
                        roundCard: {sentence: 'blablabla1'},
                        playedCards: [
                            {
                                playerId: 'nico',
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
            const res = await agent
                .get(`/game/${startedGame.id}`)
            expect(res.body.game.rounds[res.body.game.rounds.length-1].roundCard.sentence).to.not.equal('');
        });

        it('should have a list per player of hand cards', async () => {
            const res = await agent
            .get(`/game/${startedGame.id}`);

            expect(res.body.game.players).to.be.an('array');
            res.body.game.players.forEach( async player => {
                expect(player.playerCards).to.be.an('array');
                expect(player.playerCards).to.have.length.above(1);
            });
        });
        xit('should display the card of the actual player only', async () => {

        });
        it('if the game is in progress, should have only the last round in progress', async () => {
            const res = await agent
            .get(`/game/${startedGame.id}`);

            expect(res.body.game.status).to.equal('in progress');
            expect(res.body.game.rounds[res.body.game.rounds.length-1].roundStatus).to.equal('in progress');
            for(let i = 0; i<res.body.game.rounds.length-1; i++){
                expect(res.body.game.rounds[i].roundStatus).to.equal('finished');
            }
        });
        it('if the game is finished, all five rounds are finished', async () => {
            const res = await agent
            .get(`/game/${finishedGame.id}`);
            expect(res.status).to.equal(200);
            expect(res.body.game.status).to.equal('finished');
            res.body.game.rounds.forEach( async round => {
                expect(round.roundStatus).to.equal('finished');
            });
        });
    });
});
