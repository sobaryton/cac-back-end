const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const expect = chai.expect;
const Game = require('../../src/models/game');
const mongoose = require ('mongoose');
const chaiSubset = require('chai-subset');

before(() => {
    mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING, { useUnifiedTopology: true, useNewUrlParser: true })
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

describe('POST a game information /game/:id', () => {  
    let beganGame;
    let startedGame;
    let gameWith2Rounds;
    let userId;
    let pseudo;
    let agent;
    beforeEach( async () => {

        agent = chai.request.agent(app);
        const res = await agent
        .get(`/user`);
        userId = res.body.userId;
        pseudo = res.body.pseudo;
        console.log(userId, ' ', pseudo);

        beganGame = new Game({
            status: 'in progress',
            owner: 'nico',
            rounds: [
                {
                    roundStatus: 'in progress',
                    roundCard: {sentence: 'round card 1'},
                    playedCards: []
                }
            ],
            players: [
                { 
                    userID: userId,
                    pseudo: pseudo,
                    playerCards:['id1','id2','id3','id4','id5']
                },
                { 
                    userID: 'nico',
                    pseudo: 'niKKo',
                    playerCards:['id6','id7','id8','id9','id10']
                }
            ]
        });
        await beganGame.save();

        startedGame = new Game ({
            status: 'in progress',
            owner: 'nico',
            players: [
                { 
                    userID: userId,
                    pseudo: pseudo,
                    playerCards:['id2','id3','id4','id5']
                },
                { 
                    userID: 'nico',
                    pseudo: 'niKKo',
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
                            votes: [],
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
        await startedGame.save(); 

        gameWith2Rounds = new Game ({
            status: 'in progress',
            owner: 'nico',
            players: [
                { 
                    userID: userId,
                    pseudo: pseudo,
                    playerCards:['id2','id3','id4','id5']
                },
                { 
                    userID: 'nico',
                    pseudo: 'niKKo',
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
                                emotion: 'funny',
                                playerId: 'nico'
                            }],
                            handCardId: 'id1'
                        },
                        {
                            playerId: 'nico',
                            votes: [{
                                emotion: 'funny',
                                playerId: userId
                            }],
                            handCardId: 'id6'
                        }
                    ]
                },
                {
                    roundStatus: 'in progress',
                    roundCard: {sentence: 'blablabla'},
                    playedCards: [
                        {
                            playerId: 'nico',
                            votes: [],
                            handCardId: 'id6'
                        }
                    ]
                }
            ]
        });
        await gameWith2Rounds.save();

    });

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
        it('should create a player with our userId and pseudo and the game should have an owner', async () => {
            const res = await agent
            .post('/game');
            let player = res.body.game.players.filter( p => p.userID === userId )[0];
            expect(player.userID).to.equal(userId);
            expect(player.pseudo).to.equal(pseudo);
            expect(res.body.game.owner).to.equal(userId);
        });
        it('should have no hand card for the creator of the game, as it will be generated when pressing start', async () => {
            const res = await agent 
            .post('/game');
            let cardsNb = res.body.game.players[0].playerCards.length;
            expect(cardsNb).to.equal(0);
        });
    });
    describe ('Play a card', () => {
        it('should return successful status 200', async () => {
            const res = await agent
            .post(`/game/${beganGame.id}/round/${beganGame.rounds[0].id}`)
            .send({card:'id2'});
            expect(res.status).to.equal(200);
        });

        it('should remove the card from the hand and put it in the round', async () => {
            const newInfo = {card:'id2'};
            const res = await agent
            .post(`/game/${beganGame.id}/round/${beganGame.rounds[0].id}`)
            .send(newInfo);

            //check if the card is in the board
            const lastRoundPlayedIndex = res.body.game.rounds.length-1; 
            const lastPlayedCardIndex = res.body.game.rounds[lastRoundPlayedIndex].playedCards.length-1;
            expect(res.body.game.rounds[lastRoundPlayedIndex].playedCards[lastPlayedCardIndex].handCardId).to.equal(newInfo.card);

            //check if the card has been removed from the hand
            //expect(res.body.game.players.toString().indexOf(newInfo.card)).to.equal(-1);
            expect(res.body.game.players.flatMap(player => player.playerCards)).not.to.include(newInfo.card);
        });

        it('should not be possible to play a card that is not in your hand', async () => {
            const res = await agent
            .post(`/game/${beganGame.id}/round/${beganGame.rounds[0].id}`)
            .send({card:'testCard'});
            expect(res.status).to.equal(400);
        });

        it('only a player of the game can play a card', async () => {
            const res = await chai.request(app)
            .post(`/game/${beganGame.id}/round/${beganGame.rounds[0].id}`)
            .send({card:'id2'});
            expect(res.status).to.equal(400);
        });

        it('is only possible to play one card per round', async () => {
            const res = await agent
            .post(`/game/${startedGame.id}/round/${startedGame.rounds[0].id}`)
            .send({card:'id2'});
            expect(res.status).to.equal(400);
        });
        it('should not be possible to play a card in a finished round', async () => {
            const res = await agent
            .post(`/game/${gameWith2Rounds.id}/round/${gameWith2Rounds.rounds[0].id}`)
            .send({card:'id2'});
            expect(res.status).to.equal(400);
        });
        it('should not be possible to play a card in a non-exisiting round', async () => {
            const res = await agent
            .post(`/game/${startedGame.id}/round/fakeID`)
            .send({card:'id2'});
            expect(res.status).to.equal(400);
        });
    });
});
