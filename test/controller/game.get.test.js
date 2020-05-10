const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const expect = chai.expect;
const Game = require('../../src/models/game');
const mongoose = require('mongoose');
const chaiSubset = require('chai-subset');

before((done) => {
  mongoose.connect(
    process.env.MONGO_DB_CONNECTION_STRING,
    {useUnifiedTopology: true, useNewUrlParser: true}
  ).then(() => {
    console.log('Successfully connected to Mongo DB Atlas');
    done();
  }) .catch((error) => {
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
      owner: userId,
    });
    await game.save();

    waitingGameStart = new Game({
      status: 'waiting',
      owner: 'nico',
      players: [
        {
          userID: 'nico',
          pseudo: 'niKKo',
          playerCards: [],
        },
      ],
    });
    await waitingGameStart.save();

    startedGameSchema = {
      status: 'in progress',
      owner: userId,
      players: [
        {
          userID: userId,
          pseudo: pseudo,
          playerCards: [
            {text: 'id1', id: 0},
            {text: 'id2', id: 1},
            {text: 'id3', id: 2},
            {text: 'id4', id: 3},
            {text: 'id5', id: 4},
          ],
        },
        {
          userID: 'nico',
          pseudo: 'niKKo',
          playerCards: [
            {text: 'id6', id: 5},
            {text: 'id7', id: 6},
            {text: 'id8', id: 7},
            {text: 'id9', id: 8},
            {text: 'id10', id: 9},
          ],
        },
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
                playerId: 'nico',
              }],
              handCard: {id: 0, text: 'id1'},
            },
            {
              playerId: 'playerID2',
              votes: [{
                emotion: 'cute',
                playerId: userId,
              }],
              handCard: {id: 1, text: 'id2'},
            },
          ],
        },
        {
          roundStatus: 'in progress',
          roundCard: {sentence: 'round card 2'},
          playedCards: [],
        },
      ],
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
          playerCards: [
            {text: 'id6', id: 5},
            {text: 'id7', id: 6},
            {text: 'id8', id: 7},
            {text: 'id9', id: 8},
            {text: 'id10', id: 9},
          ],
        },
        {
          userID: 'blablateur',
          pseudo: 'bbee',
          playerCards: [
            {text: 'id1', id: 0},
            {text: 'id2', id: 1},
            {text: 'id3', id: 2},
            {text: 'id4', id: 3},
            {text: 'id5', id: 4},
          ],
        },
      ],
    });
    await startedGame2.save();

    gameWith6Players = new Game({
      status: 'waiting',
      owner: 'nico',
      players: [
        {
          userID: 'nico',
          pseudo: 'niKKo',
          playerCards: [],
        },
        {
          userID: 'blablateur',
          pseudo: 'bbee',
          playerCards: [],
        },
        {
          userID: 'blablaafwcwteur',
          pseudo: 'aclndlc',
          playerCards: [],
        },
        {
          userID: 'blablsdfwvateur',
          pseudo: 'alkc',
          playerCards: [],
        },
        {
          userID: 'blablatedsfegur',
          pseudo: 'lnclwjcn',
          playerCards: [],
        },
        {
          userID: 'blabldsateur',
          pseudo: 'sldncln',
          playerCards: [],
        },
      ],
    });
    await gameWith6Players.save();
  });

  describe('New game object structure', () => {
    it('should return successful status 200', async () => {
      const res = await agent
        .get(`/game/${game.id}`);
      expect(res.status).to.equal(200);
    });
    it('should be an object', async () => {
      const res = await agent
        .get(`/game/${game.id}`);
      expect(res.body).to.be.an('object');
    });
    it('should contain the requested game id', async () => {
      const res = await agent
        .get(`/game/${game.id}`);
      expect(res.body.game._id).to.equal(game.id);
    });
    it('should have a status of "waiting"', async () => {
      const res = await agent
        .get(`/game/${game.id}`);
      expect(res.body.game.status).to.equal('waiting');
    });
    it('should have an empty list of rounds', async () => {
      const res = await agent
        .get(`/game/${game.id}`);
      expect(res.body.game.rounds).to.be.an('array');
    });
    it('returns the same game when requested multiple times', async () => {
      const res1 = await agent
        .get(`/game/${game.id}`);
      const res2 = await agent
        .get(`/game/${game.id}`);
      expect(res1.body.game._id).to.equal(game.id);
      expect(res2.body.game._id).to.equal(game.id);
    });
  });

  describe('Existing Game structure', () => {
    it('is an object with the same structure as started game', async () => {
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
    let startedGameNotJoined;
    let finishedGameNotJoined;
    beforeEach( async () => {
      finishedGame = new Game({
        status: 'finished',
        owner: 'nico',
        players: [
          {
            userID: userId,
            pseudo: pseudo,
            playerCards: [
              {text: 'id1', id: 0},
              {text: 'id2', id: 1},
              {text: 'id3', id: 2},
              {text: 'id4', id: 3},
              {text: 'id5', id: 4},
            ],
          },
          {
            userID: 'nico',
            pseudo: 'niKKo',
            playerCards: [
              {text: 'id6', id: 5},
              {text: 'id7', id: 6},
              {text: 'id8', id: 7},
              {text: 'id9', id: 8},
              {text: 'id10', id: 9},
            ],
          },
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
                  playerId: 'playerID2',
                }],
                handCard: {id: 0, text: 'id1'},
              },
              {
                playerId: 'playerID2',
                votes: [{
                  emotion: 'blaa',
                  playerId: 'playerID',
                }],
                handCard: {id: 1, text: 'id2'},
              },
            ],
          },
          {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla2'},
            playedCards: [
              {
                playerId: 'playerID',
                votes: [{
                  emotion: 'blabla',
                  playerId: 'playerID2',
                }],
                handCard: {id: 2, text: 'id3'},
              },
              {
                playerId: 'playerID2',
                votes: [{
                  emotion: 'blaa',
                  playerId: 'playerID',
                }],
                handCard: {id: 3, text: 'id4'},
              },
            ],
          },
          {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla3'},
            playedCards: [
              {
                playerId: 'playerID',
                votes: [{
                  emotion: 'blabla',
                  playerId: 'playerID2',
                }],
                handCard: {id: 4, text: 'id5'},
              },
              {
                playerId: 'playerID2',
                votes: [{
                  emotion: 'blaa',
                  playerId: 'playerID',
                }],
                handCard: {id: 5, text: 'id6'},
              },
            ],
          }, {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla4'},
            playedCards: [
              {
                playerId: 'playerID',
                votes: [{
                  emotion: 'blabla',
                  playerId: 'playerID2',
                }],
                handCard: {id: 6, text: 'id7'},
              },
              {
                playerId: 'playerID2',
                votes: [{
                  emotion: 'blaa',
                  playerId: 'playerID',
                }],
                handCard: {id: 7, text: 'id8'},
              },
            ],
          },
          {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla5'},
            playedCards: [
              {
                playerId: 'playerID',
                votes: [{
                  emotion: 'blabla',
                  playerId: 'playerID2',
                }],
                handCard: {id: 8, text: 'id9'},
              },
              {
                playerId: 'playerID2',
                votes: [{
                  emotion: 'blaa',
                  playerId: 'playerID',
                }],
                handCard: {id: 9, text: 'id10'},
              },
            ],
          },
        ],
      });
      await finishedGame.save();

      finishedGameNotJoined = new Game({
        status: 'finished',
        owner: 'nico',
        players: [
          {
            userID: 'soso',
            pseudo: 'SoSo',
            playerCards: [
              {text: 'id1', id: 0},
              {text: 'id2', id: 1},
              {text: 'id3', id: 2},
              {text: 'id4', id: 3},
              {text: 'id5', id: 4},
            ],
          },
          {
            userID: 'nico',
            pseudo: 'niKKo',
            playerCards: [
              {text: 'id6', id: 5},
              {text: 'id7', id: 6},
              {text: 'id8', id: 7},
              {text: 'id9', id: 8},
              {text: 'id10', id: 9},
            ],
          },
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
                  playerId: 'playerID2',
                }],
                handCard: {id: 0, text: 'id1'},
              },
              {
                playerId: 'playerID2',
                votes: [{
                  emotion: 'blaa',
                  playerId: 'playerID',
                }],
                handCard: {id: 1, text: 'id2'},
              },
            ],
          },
          {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla2'},
            playedCards: [
              {
                playerId: 'playerID',
                votes: [{
                  emotion: 'blabla',
                  playerId: 'playerID2',
                }],
                handCard: {id: 2, text: 'id3'},
              },
              {
                playerId: 'playerID2',
                votes: [{
                  emotion: 'blaa',
                  playerId: 'playerID',
                }],
                handCard: {id: 3, text: 'id4'},
              },
            ],
          },
          {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla3'},
            playedCards: [
              {
                playerId: 'playerID',
                votes: [{
                  emotion: 'blabla',
                  playerId: 'playerID2',
                }],
                handCard: {id: 4, text: 'id5'},
              },
              {
                playerId: 'playerID2',
                votes: [{
                  emotion: 'blaa',
                  playerId: 'playerID',
                }],
                handCard: {id: 5, text: 'id6'},
              },
            ],
          }, {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla4'},
            playedCards: [
              {
                playerId: 'playerID',
                votes: [{
                  emotion: 'blabla',
                  playerId: 'playerID2',
                }],
                handCard: {id: 6, text: 'id7'},
              },
              {
                playerId: 'playerID2',
                votes: [{
                  emotion: 'blaa',
                  playerId: 'playerID',
                }],
                handCard: {id: 7, text: 'id8'},
              },
            ],
          },
          {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla5'},
            playedCards: [
              {
                playerId: 'playerID',
                votes: [{
                  emotion: 'blabla',
                  playerId: 'playerID2',
                }],
                handCard: {id: 8, text: 'id9'},
              },
              {
                playerId: 'playerID2',
                votes: [{
                  emotion: 'blaa',
                  playerId: 'playerID',
                }],
                handCard: {id: 9, text: 'id10'},
              },
            ],
          },
        ],
      });
      await finishedGameNotJoined.save();

      const startedGameNotJoinedSchema = {
        status: 'in progress',
        owner: userId,
        players: [
          {
            userID: 'soso',
            pseudo: 'SoSo',
            playerCards: [
              {text: 'id1', id: 0},
              {text: 'id2', id: 1},
              {text: 'id3', id: 2},
              {text: 'id4', id: 3},
              {text: 'id5', id: 4},
            ],
          },
          {
            userID: 'nico',
            pseudo: 'niKKo',
            playerCards: [
              {text: 'id6', id: 5},
              {text: 'id7', id: 6},
              {text: 'id8', id: 7},
              {text: 'id9', id: 8},
              {text: 'id10', id: 9},
            ],
          },
        ],
        rounds: [
          {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla'},
            playedCards: [
              {
                playerId: 'soso',
                votes: [{
                  emotion: 'cute',
                  playerId: 'nico',
                }],
                handCard: {id: 0, text: 'id1'},
              },
              {
                playerId: 'playerID2',
                votes: [{
                  emotion: 'cute',
                  playerId: userId,
                }],
                handCard: {id: 1, text: 'id2'},
              },
            ],
          },
          {
            roundStatus: 'in progress',
            roundCard: {sentence: 'round card 2'},
            playedCards: [],
          },
        ],
      };
      startedGameNotJoined = new Game(startedGameNotJoinedSchema);
      await startedGameNotJoined.save();
    });

    it('should have a round card', async () => {
      const res = await agent
        .get(`/game/${startedGame.id}`);
      expect(res.body.game.rounds[res.body.game.rounds.length - 1]
        .roundCard.sentence).to.not.equal('');
    });

    it('should have a list per player of hand cards', async () => {
      const res = await agent
        .get(`/game/${startedGame.id}`);

      expect(res.body.game.players).to.be.an('array');
      res.body.game.players.forEach( async (player) => {
        expect(player.playerCards).to.be.an('array');
        expect(player.playerCards).to.have.length.above(1);
      });
    });
    xit('should display the card of the current player only', async () => {

    });
    // eslint-disable-next-line max-len
    it('should have only the last round in progress if the game is in progress', async () => {
      const res = await agent
        .get(`/game/${startedGame.id}`);

      expect(res.body.game.status).to.equal('in progress');
      expect(res.body.game.rounds[res.body.game.rounds.length - 1]
        .roundStatus).to.equal('in progress');
      for (let i = 0; i < res.body.game.rounds.length - 1; i++) {
        expect(res.body.game.rounds[i].roundStatus).to.equal('finished');
      }
    });
    it('if the game is finished, all five rounds are finished', async () => {
      const res = await agent
        .get(`/game/${finishedGame.id}`);
      expect(res.status).to.equal(200);
      expect(res.body.game.status).to.equal('finished');
      res.body.game.rounds.forEach( async (round) => {
        expect(round.roundStatus).to.equal('finished');
      });
    });
    it('cannot fetch a started game which the user did no join', async () => {
      const res = await agent
        .get(`/game/${startedGameNotJoined.id}`);
      expect(res.status).to.equal(400);
    });
    it('can fetch a finished game which the user did no join', async () => {
      const res = await agent
        .get(`/game/${finishedGameNotJoined.id}`);
      expect(res.status).to.equal(200);
    });
  });
});
