const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const expect = chai.expect;
const Game = require('../../src/models/game');
const User = require('../../src/models/user');
const mongoose = require('mongoose');
const chaiSubset = require('chai-subset');

before((done) => {
  mongoose.connect(
    process.env.MONGO_DB_CONNECTION_STRING,
    {useUnifiedTopology: true, useNewUrlParser: true}
  ).then(() => {
    console.log('Successfully connected to Mongo DB Atlas');
    done();
  }).catch((error) => {
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
  let userId;
  let user;
  let userNotInGame;
  let pseudo;
  beforeEach( async () => {
    await User.deleteMany({token: 'nounous-token-84792346'});
    await User.deleteMany({token: 'intruder-token'});

    user = new User({
      pseudo: 'nounous',
      token: 'nounous-token-84792346',
    });

    await user.save();

    userId = user._id.toString();
    pseudo = user.pseudo;

    userNotInGame = new User({
      pseudo: 'Intruder',
      token: 'intruder-token',
    });

    await userNotInGame.save();
  });

  describe('Begin a game', () => {
    let game;
    let beganGame;
    let beforeStartGame;
    beforeEach( async () => {
      game = new Game({
        owner: userId,
      });
      await game.save();

      beforeStartGame = new Game({
        status: 'waiting',
        owner: 'soso',
        rounds: [
        ],
        players: [
          {
            userID: 'soso',
            pseudo: 'soso',
            changeCards: 0,
            playerCards: [],
          },
          {
            userID: 'nico',
            pseudo: 'nico',
            changeCards: 0,
            playerCards: [],
          },
        ],
      });
      await beforeStartGame.save();

      beganGame = new Game({
        status: 'waiting',
        owner: userId,
        players: [
          {
            userID: userId,
            pseudo: pseudo,
            changeCards: 0,
            playerCards: [],
          },
          {
            userID: 'nico',
            pseudo: 'niccco',
            changeCards: 0,
            playerCards: [],
          },
        ],
      });
      await beganGame.save();

      startedGameSchema = {
        status: 'in progress',
        owner: userId,
        players: [
          {
            userID: userId,
            pseudo: pseudo,
            changeCards: 0,
            playerCards: [
              {text: 'id2', id: 1},
              {text: 'id3', id: 2},
              {text: 'id4', id: 3},
              {text: 'id5', id: 4},
            ],
          },
          {
            userID: 'nico',
            pseudo: 'nico',
            changeCards: 0,
            playerCards: [
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
                playerId: 'nico',
                votes: [{
                  emotion: 'funny',
                  playerId: userId,
                }],
                handCard: {id: 5, text: 'id6'},
              },
              {
                playerId: userId,
                votes: [{
                  emotion: 'cute',
                  playerId: 'nico',
                }],
                handCard: {id: 0, text: 'id1'},
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
    });

    it('should UPDATE the game to have the status of in progress', async () => {
      const res = await chai.request(app)
        .put(`/game/${beganGame.id}`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).to.equal(200);
      expect(res.body.game.status).to.equal('in progress');
    });
    // eslint-disable-next-line max-len
    it('should contain the final list of players with 5 hand cards each', async () => {
      const res = await chai.request(app)
        .put(`/game/${beganGame.id}`)
        .set('Authorization', `Bearer ${user.token}`);
      const players = res.body.game.players;
      players.forEach( (p) => {
        const cardsNb = p.playerCards.length;
        expect(cardsNb).to.equal(5);
      });
    });
    // eslint-disable-next-line max-len
    it('should not be possible for a player who is not the owner to start the game', async () => {
      const res = await chai.request(app)
        .put(`/game/${beforeStartGame.id}`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).to.equal(400);
    });
    it('should not be possible to start a game already started', async () => {
      const res = await chai.request(app)
        .put(`/game/${startedGame.id}`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).to.equal(400);
    });
  });

  describe('When voting for a card', () => {
    let startedGame;
    let finishedGame;
    let gameFinishedCompleted;
    let startedGameNewRound;
    let gameLastVote;

    beforeEach( async () => {
      startedGame = new Game({
        status: 'in progress',
        owner: userId,
        players: [
          {
            userID: userId,
            pseudo: pseudo,
            changeCards: 0,
            playerCards: [
              {text: 'id2', id: 1},
              {text: 'id3', id: 2},
              {text: 'id4', id: 3},
              {text: 'id5', id: 4},
            ],
          },
          {
            userID: 'nico',
            pseudo: 'nikkko',
            changeCards: 0,
            playerCards: [
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
                  emotion: 'funny',
                  playerId: 'nico',
                }],
                handCard: {id: 0, text: 'id1'},
              },
              {
                playerId: 'nico',
                votes: [{
                  emotion: 'funny',
                  playerId: userId,
                }],
                handCard: {id: 5, text: 'id6'},
              },
            ],
          },
          {
            roundStatus: 'in progress',
            roundCard: {sentence: 'blablabla2'},
            playedCards: [
              {
                playerId: userId,
                votes: [{
                  emotion: 'funny',
                  playerId: 'nico',
                }],
                handCard: {id: 0, text: 'id1'},
              },
              {
                playerId: 'nico',
                votes: [],
                handCard: {id: 5, text: 'id6'},
              },
            ],
          },
        ],
      });
      await startedGame.save();

      startedGameNewRound = new Game({
        status: 'in progress',
        owner: userId,
        players: [
          {
            userID: userId,
            pseudo: pseudo,
            changeCards: 0,
            playerCards: [
              {text: 'id2', id: 1},
              {text: 'id3', id: 2},
              {text: 'id4', id: 3},
              {text: 'id5', id: 4},
            ],
          },
          {
            userID: 'nico',
            pseudo: 'ojononn',
            changeCards: 0,
            playerCards: [
              {text: 'id7', id: 6},
              {text: 'id8', id: 7},
              {text: 'id9', id: 8},
              {text: 'id10', id: 9},
            ],
          },
        ],
        rounds: [
          {
            roundStatus: 'in progress',
            roundCard: {sentence: 'blablabla'},
            playedCards: [
              {
                playerId: userId,
                votes: [{
                  emotion: 'funny',
                  playerId: 'nico',
                }],
                handCard: {id: 0, text: 'id1'},
              },
              {
                playerId: 'nico',
                votes: [],
                handCard: {id: 5, text: 'id6'},
              },
            ],
          },
        ],
      });
      await startedGameNewRound.save();

      gameLastVote = new Game({
        status: 'in progress',
        owner: userId,
        players: [
          {
            userID: userId,
            pseudo: pseudo,
            changeCards: 0,
            playerCards: [
              {text: 'id2', id: 1},
              {text: 'id3', id: 2},
              {text: 'id4', id: 3},
              {text: 'id5', id: 4},
            ],
          },
          {
            userID: 'nico',
            pseudo: 'niccocoo',
            changeCards: 0,
            playerCards: [
              {text: 'id7', id: 6},
              {text: 'id8', id: 7},
              {text: 'id9', id: 8},
              {text: 'id10', id: 9},
            ],
          },
        ],
        rounds: [
          {
            roundStatus: 'in progress',
            roundCard: {sentence: 'blablabla'},
            playedCards: [
              {
                playerId: userId,
                votes: [],
                handCard: {id: 0, text: 'id1'},
              },
              {
                playerId: 'nico',
                votes: [{
                  emotion: 'funny',
                  playerId: userId,
                }],
                handCard: {id: 5, text: 'id6'},
              },
            ],
          },
        ],
      });
      await gameLastVote.save();

      finishedGame = new Game({
        status: 'in progress',
        owner: userId,
        players: [
          {
            userID: userId,
            pseudo: pseudo,
            changeCards: 0,
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
            pseudo: 'nicooo',
            changeCards: 0,
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
                playerId: userId,
                votes: [{
                  emotion: 'funny',
                  playerId: 'nico',
                }],
                handCard: {id: 0, text: 'id1'},
              },
              {
                playerId: 'nico',
                votes: [{
                  emotion: 'funny',
                  playerId: userId,
                }],
                handCard: {id: 5, text: 'id6'},
              },
            ],
          },
          {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla2'},
            playedCards: [
              {
                playerId: userId,
                votes: [{
                  emotion: 'funny',
                  playerId: 'nico',
                }],
                handCard: {id: 1, text: 'id2'},
              },
              {
                playerId: 'nico',
                votes: [{
                  emotion: 'funny',
                  playerId: userId,
                }],
                handCard: {id: 6, text: 'id7'},
              },
            ],
          },
          {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla3'},
            playedCards: [
              {
                playerId: userId,
                votes: [{
                  emotion: 'funny',
                  playerId: 'nico',
                }],
                handCard: {id: 2, text: 'id3'},
              },
              {
                playerId: 'nico',
                votes: [{
                  emotion: 'funny',
                  playerId: userId,
                }],
                handCard: {id: 7, text: 'id8'},
              },
            ],
          }, {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla4'},
            playedCards: [
              {
                playerId: userId,
                votes: [{
                  emotion: 'funny',
                  playerId: 'nico',
                }],
                handCard: {id: 3, text: 'id4'},
              },
              {
                playerId: 'nico',
                votes: [{
                  emotion: 'funny',
                  playerId: userId,
                }],
                handCard: {id: 8, text: 'id9'},
              },
            ],
          },
          {
            roundStatus: 'in progress',
            roundCard: {sentence: 'blablabla5'},
            playedCards: [
              {
                playerId: userId,
                votes: [{
                  emotion: 'funny',
                  playerId: 'nico',
                }],
                handCard: {id: 4, text: 'id5'},
              },
              {
                playerId: 'nico',
                votes: [],
                handCard: {id: 9, text: 'id10'},
              },
            ],
          },
        ],
      });
      await finishedGame.save();

      gameFinishedCompleted = new Game({
        status: 'finished',
        owner: userId,
        players: [
          {
            userID: userId,
            pseudo: pseudo,
            changeCards: 0,
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
            pseudo: 'nicooo',
            changeCards: 0,
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
                playerId: userId,
                votes: [{
                  emotion: 'funny',
                  playerId: 'nico',
                }],
                handCard: {id: 0, text: 'id1'},
              },
              {
                playerId: 'nico',
                votes: [{
                  emotion: 'funny',
                  playerId: userId,
                }],
                handCard: {id: 5, text: 'id6'},
              },
            ],
          },
          {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla2'},
            playedCards: [
              {
                playerId: userId,
                votes: [{
                  emotion: 'funny',
                  playerId: 'nico',
                }],
                handCard: {id: 1, text: 'id2'},
              },
              {
                playerId: 'nico',
                votes: [{
                  emotion: 'funny',
                  playerId: userId,
                }],
                handCard: {id: 6, text: 'id7'},
              },
            ],
          },
          {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla3'},
            playedCards: [
              {
                playerId: userId,
                votes: [{
                  emotion: 'funny',
                  playerId: 'nico',
                }],
                handCard: {id: 2, text: 'id3'},
              },
              {
                playerId: 'nico',
                votes: [{
                  emotion: 'funny',
                  playerId: userId,
                }],
                handCard: {id: 7, text: 'id8'},
              },
            ],
          }, {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla4'},
            playedCards: [
              {
                playerId: userId,
                votes: [{
                  emotion: 'funny',
                  playerId: 'nico',
                }],
                handCard: {id: 3, text: 'id4'},
              },
              {
                playerId: 'nico',
                votes: [{
                  emotion: 'funny',
                  playerId: userId,
                }],
                handCard: {id: 8, text: 'id9'},
              },
            ],
          },
          {
            roundStatus: 'finished',
            roundCard: {sentence: 'blablabla5'},
            playedCards: [
              {
                playerId: userId,
                votes: [{
                  emotion: 'funny',
                  playerId: 'nico',
                }],
                handCard: {id: 4, text: 'id5'},
              },
              {
                playerId: 'nico',
                votes: [{
                  emotion: 'funny',
                  playerId: userId,
                }],
                handCard: {id: 9, text: 'id10'},
              },
            ],
          },
        ],
      });
      await gameFinishedCompleted.save();
    });

    // eslint-disable-next-line max-len
    it('should update the status of the game to finished if the last player voted during the last round and should have 5 rounds finished', async () => {
      const info = {emotion: 'funny'};
      const res = await chai.request(app)
        // eslint-disable-next-line max-len
        .put(`/game/${finishedGame.id}/round/${finishedGame.rounds[4].id}/playedCards/${finishedGame.rounds[4].playedCards[1].id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(info);
      expect(res.body.game.status).to.equal('finished');
      expect(res.body.game.rounds[res.body.game.rounds.length - 1].roundStatus)
        .to.equal('finished');
      expect(res.body.game.rounds).to.have.length.lessThan(6);
      expect(res.body.game.rounds).to.have.length.above(4);
      expect(res.status).to.equal(200);
    });

    it('should update the round with the vote', async () => {
      const info = {emotion: 'funny'};
      const res = await chai.request(app)
        // eslint-disable-next-line max-len
        .put(`/game/${startedGameNewRound.id}/round/${startedGameNewRound.rounds[0].id}/playedCards/${startedGameNewRound.rounds[0].playedCards[1].id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(info);
      const pathToVote = res.body.game.rounds[0].playedCards[1].votes;
      expect(pathToVote[pathToVote.length - 1].emotion).to.equal(info.emotion);
      expect(pathToVote[pathToVote.length - 1].playerId).to.equal(userId);
    });
    it('should not be possible to vote for a random round', async () => {
      const info = {emotion: 'funny'};
      const res = await chai.request(app)
        // eslint-disable-next-line max-len
        .put(`/game/${startedGameNewRound.id}/round/FakeRoundID/playedCards/${startedGameNewRound.rounds[0].playedCards[1].id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(info);
      expect(res.status).to.equal(400);
    });
    it('should not be possible to vote for a finished round', async () => {
      const info = {emotion: 'funny'};
      const res = await chai.request(app)
        // eslint-disable-next-line max-len
        .put(`/game/${startedGame.id}/round/${startedGame.rounds[0].id}/playedCards/${startedGame.rounds[0].playedCards[1].id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(info);
      expect(res.status).to.equal(400);
    });
    it('should only be possible to pass a valid emotion', async () => {
      const info = {emotion: 'notValidEmotion'};
      const res = await chai.request(app)
        // eslint-disable-next-line max-len
        .put(`/game/${startedGame.id}/round/${startedGame.rounds[1].id}/playedCards/${startedGame.rounds[1].playedCards[1].id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(info);
      expect(res.status).to.equal(400);
    });
    it('should not be possible to vote for an non existing card', async () => {
      const info = {emotion: 'funny'};
      const res = await chai.request(app)
        // eslint-disable-next-line max-len
        .put(`/game/${startedGame.id}/round/${startedGame.rounds[1].id}/playedCards/fakeID`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(info);
      expect(res.status).to.equal(400);
    });
    it('should not be possible to vote more than once per round', async () => {
      const info = {emotion: 'funny'};
      const res = await chai.request(app)
        // eslint-disable-next-line max-len
        .put(`/game/${gameLastVote.id}/round/${gameLastVote.rounds[0].id}/playedCards/${gameLastVote.rounds[0].playedCards[1].id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(info);
      expect(res.status).to.equal(400);
    });
    it('should not be possible to vote for ourselves', async () => {
      const info = {emotion: 'funny'};
      const res = await chai.request(app)
        // eslint-disable-next-line max-len
        .put(`/game/${startedGame.id}/round/${startedGame.rounds[1].id}/playedCards/${startedGame.rounds[1].playedCards[0].id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(info);
      expect(res.status).to.equal(400);
    });
    it('should begin a new round when all players voted', async () => {
      const info = {emotion: 'funny'};
      const res = await chai.request(app)
        // eslint-disable-next-line max-len
        .put(`/game/${startedGameNewRound.id}/round/${startedGameNewRound.rounds[0].id}/playedCards/${startedGameNewRound.rounds[0].playedCards[1].id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(info);
      const pathToRound = res.body.game.rounds;
      expect(pathToRound[pathToRound.length - 1].roundStatus)
        .to.equal('in progress');
      expect(pathToRound[pathToRound.length - 2].roundStatus)
        .to.equal('finished');
      expect(pathToRound[pathToRound.length - 1].roundCard.sentence)
        .to.have.length.above(0);
    });
    // eslint-disable-next-line max-len
    it('should have a new round card different from the previous ones when a new round is created', async () => {
      const info = {emotion: 'funny'};
      const res = await chai.request(app)
        // eslint-disable-next-line max-len
        .put(`/game/${startedGameNewRound.id}/round/${startedGameNewRound.rounds[0].id}/playedCards/${startedGameNewRound.rounds[0].playedCards[1].id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(info);

      const pathToRound = res.body.game.rounds;
      const existingRoundCards
        = startedGameNewRound.rounds.map((round) => round.roundCard.sentence );
      const newRoundCard
        = pathToRound[pathToRound.length - 1].roundCard.sentence;

      expect(existingRoundCards).not.to.include(newRoundCard);
    });
    it('should error if we try to vote for a finished game', async () => {
      const info = {emotion: 'funny'};
      const res = await chai.request(app)
        // eslint-disable-next-line max-len
        .put(`/game/${gameFinishedCompleted.id}/round/${gameFinishedCompleted.rounds[0].id}/playedCards/${gameFinishedCompleted.rounds[0].playedCards[1].id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(info);

      expect(res.status).to.equal(400);
    });
  });
});

describe('UPDATE a game information /game/:id/players', () => {
  let userId;
  let user;
  let userNotInGame;
  let pseudo;
  let game;
  let waitingGameStart;
  let startedGame2;

  beforeEach(async () => {
    await User.deleteMany({token: 'nounous-token-84792346'});
    await User.deleteMany({token: 'intruder-token'});

    user = new User({
      pseudo: 'nounous',
      token: 'nounous-token-84792346',
    });

    await user.save();

    userId = user._id.toString();
    pseudo = user.pseudo;

    userNotInGame = new User({
      pseudo: 'Intruder',
      token: 'intruder-token',
    });

    await userNotInGame.save();

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
          changeCards: 0,
          playerCards: [],
        },
      ],
    });
    await waitingGameStart.save();

    startedGame2 = new Game({
      status: 'in progress',
      owner: 'nico',
      players: [
        {
          userID: 'nico',
          pseudo: 'niKKo',
          changeCards: 0,
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
          changeCards: 0,
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
  });

  afterEach(async () => {
    await User.deleteMany({token: 'nounous-token-84792346'});
    await User.deleteMany({token: 'intruder-token'});
  });

  describe('Join an existing game', () => {
    it('has a list of participants, containing the current user', async () => {
      const res = await chai.request(app)
        .put(`/game/${game.id}/players`)
        .set('Authorization', `Bearer ${user.token}`);
      const player
        = res.body.game.players.filter((p) => p.userID === userId )[0];
      expect(player.userID).to.equal(userId);
    });
    it('should add the new player in the game', async () => {
      const res = await chai.request(app)
        .put(`/game/${waitingGameStart.id}/players`)
        .set('Authorization', `Bearer ${user.token}`);

      const player
        = res.body.game.players.filter((p) => p.userID === userId )[0];
      expect(player.userID).to.equal(userId);
      expect(player.pseudo).to.equal(pseudo);
    });
    // eslint-disable-next-line max-len
    it('should not be possible to join if the game already began, or is finished', async () => {
      const res = await chai.request(app)
        .put(`/game/${startedGame2.id}/players`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).to.equal(400);
    });
    // it('should not accept more than 6 players', async () => {
    //     const res = await chai.request(app)
    //     .get(`/game/${gameWith6Players.id}`);
    //     expect(res.status).to.equal(400);
    // });
  });
});

describe('UPDATE a card for player /:id/players/:playerId/playerCards', () => {
  let userId;
  let user;
  let pseudo;
  let game;
  let startedGame1;
  let startedGame2;
  let startedGame3;
  let gameFinishedCompleted;

  beforeEach(async () => {
    await User.deleteMany({token: 'nounous-token-84792346'});

    user = new User({
      pseudo: 'nounous',
      token: 'nounous-token-84792346',
    });

    await user.save();

    userId = user._id.toString();
    pseudo = user.pseudo;

    game = new Game({
      owner: userId,
    });
    await game.save();

    startedGame1 = new Game({
      status: 'in progress',
      owner: 'nico',
      players: [
        {
          userID: 'nico',
          pseudo: 'niKKo',
          changeCards: 0,
          playerCards: [
            {text: 'id1', id: 0},
            {text: 'id2', id: 1},
            {text: 'id3', id: 2},
            {text: 'id5', id: 4},
          ],
        },
        {
          userID: userId,
          pseudo: pseudo,
          changeCards: 0,
          playerCards: [
            {text: 'id6', id: 5},
            {text: 'id8', id: 7},
            {text: 'id9', id: 8},
            {text: 'id10', id: 9},
          ],
        },
      ],
      rounds: [
        {
          roundStatus: 'in progress',
          roundCard: {sentence: 'blablabla'},
          playedCards: [
            {
              playerId: userId,
              votes: [{
                emotion: 'funny',
                playerId: 'nico',
              }],
              handCard: {id: 6, text: 'id7'},
            },
            {
              playerId: 'nico',
              votes: [],
              handCard: {id: 3, text: 'id4'},
            },
          ],
        },
      ],
    });
    await startedGame1.save();

    startedGame2 = new Game({
      status: 'in progress',
      owner: 'nico',
      players: [
        {
          userID: 'nico',
          pseudo: 'niKKo',
          changeCards: 0,
          playerCards: [
            {text: 'id1', id: 0},
            {text: 'id2', id: 1},
            {text: 'id3', id: 2},
            {text: 'id4', id: 3},
            {text: 'id5', id: 4},
          ],
        },
        {
          userID: userId,
          pseudo: pseudo,
          changeCards: 0,
          playerCards: [
            {text: 'id6', id: 5},
            {text: 'id7', id: 6},
            {text: 'id8', id: 7},
            {text: 'id9', id: 8},
            {text: 'id10', id: 9},
          ],
        },
      ],
    });
    await startedGame2.save();

    startedGame3 = new Game({
      status: 'in progress',
      owner: 'nico',
      players: [
        {
          userID: 'nico',
          pseudo: 'niKKo',
          changeCards: 0,
          playerCards: [
            {text: 'id1', id: 0},
            {text: 'id2', id: 1},
            {text: 'id3', id: 2},
            {text: 'id4', id: 3},
            {text: 'id5', id: 4},
          ],
        },
        {
          userID: userId,
          pseudo: pseudo,
          changeCards: 1,
          playerCards: [
            {text: 'id6', id: 5},
            {text: 'id7', id: 6},
            {text: 'id8', id: 7},
            {text: 'id9', id: 8},
            {text: 'id10', id: 9},
          ],
        },
      ],
    });
    await startedGame3.save();

    gameFinishedCompleted = new Game({
      status: 'finished',
      owner: userId,
      players: [
        {
          userID: userId,
          pseudo: pseudo,
          changeCards: 0,
          playerCards: [],
        },
        {
          userID: 'nico',
          pseudo: 'nicooo',
          changeCards: 0,
          playerCards: [],
        },
      ],
      rounds: [
        {
          roundStatus: 'finished',
          roundCard: {sentence: 'blablabla1'},
          playedCards: [
            {
              playerId: userId,
              votes: [{
                emotion: 'funny',
                playerId: 'nico',
              }],
              handCard: {id: 0, text: 'id1'},
            },
            {
              playerId: 'nico',
              votes: [{
                emotion: 'funny',
                playerId: userId,
              }],
              handCard: {id: 5, text: 'id6'},
            },
          ],
        },
        {
          roundStatus: 'finished',
          roundCard: {sentence: 'blablabla2'},
          playedCards: [
            {
              playerId: userId,
              votes: [{
                emotion: 'funny',
                playerId: 'nico',
              }],
              handCard: {id: 1, text: 'id2'},
            },
            {
              playerId: 'nico',
              votes: [{
                emotion: 'funny',
                playerId: userId,
              }],
              handCard: {id: 6, text: 'id7'},
            },
          ],
        },
        {
          roundStatus: 'finished',
          roundCard: {sentence: 'blablabla3'},
          playedCards: [
            {
              playerId: userId,
              votes: [{
                emotion: 'funny',
                playerId: 'nico',
              }],
              handCard: {id: 2, text: 'id3'},
            },
            {
              playerId: 'nico',
              votes: [{
                emotion: 'funny',
                playerId: userId,
              }],
              handCard: {id: 7, text: 'id8'},
            },
          ],
        }, {
          roundStatus: 'finished',
          roundCard: {sentence: 'blablabla4'},
          playedCards: [
            {
              playerId: userId,
              votes: [{
                emotion: 'funny',
                playerId: 'nico',
              }],
              handCard: {id: 3, text: 'id4'},
            },
            {
              playerId: 'nico',
              votes: [{
                emotion: 'funny',
                playerId: userId,
              }],
              handCard: {id: 8, text: 'id9'},
            },
          ],
        },
        {
          roundStatus: 'finished',
          roundCard: {sentence: 'blablabla5'},
          playedCards: [
            {
              playerId: userId,
              votes: [{
                emotion: 'funny',
                playerId: 'nico',
              }],
              handCard: {id: 4, text: 'id5'},
            },
            {
              playerId: 'nico',
              votes: [{
                emotion: 'funny',
                playerId: userId,
              }],
              handCard: {id: 9, text: 'id10'},
            },
          ],
        },
      ],
    });
    await gameFinishedCompleted.save();
  });

  afterEach(async () => {
    await User.deleteMany({token: 'nounous-token-84792346'});
  });

  describe('Change a card in the player hand', () => {
    it('should create a new set with the same length as before', async () => {
      const res = await chai.request(app)
        .put(`/game/${startedGame1.id}/players/${userId}/playerCards`)
        .set('Authorization', `Bearer ${user.token}`);
      const player
        = res.body.game.players.filter((p) => p.userID === userId )[0];
      const cardNumberBefore = startedGame1.players[0].playerCards.length;
      expect(player.userID).to.equal(userId);
      expect(player.playerCards.length).to.equal(cardNumberBefore);
    });

    it('should return an error if the playerId is not the userId', async () => {
      const res = await chai.request(app)
        .put(`/game/${startedGame1.id}/players/Nicoco/playerCards`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(res.status).to.equal(400);
    });

    // eslint-disable-next-line max-len
    it('should replace the card set with a new set of new cards not present in the hands of the player', async () => {
      const res = await chai.request(app)
        .put(`/game/${startedGame2.id}/players/${userId}/playerCards`)
        .set('Authorization', `Bearer ${user.token}`);
      const player
        = res.body.game.players.filter((p) => p.userID === userId )[0];

      const oldCards = startedGame2.players.filter(
        (p) => p.userID === userId
      )[0].playerCards;
      const oldCardTextTable = [];
      for (let i = 0; i < oldCards.length; i++) {
        oldCardTextTable.push(oldCards[i].id);
      }

      const cards = player.playerCards;
      cards.forEach( (card) => {
        const cardText = card.id;
        expect(oldCardTextTable).to.not.include(cardText);
      });
    });

    // eslint-disable-next-line max-len
    it('should replace the card set with a new set of cards not present in the game', async () => {
      const res = await chai.request(app)
        .put(`/game/${startedGame1.id}/players/${userId}/playerCards`)
        .set('Authorization', `Bearer ${user.token}`);

      // Create a table with all the card ids in the game
      const oldCardsTable = [];
      // Check in the hands of all players
      for (let i = 0; i < startedGame1.players.length; i++) {
        const playerCards = startedGame1.players[i].playerCards;
        for (let j = 0; j < playerCards.length; j++) {
          oldCardsTable.push(playerCards[j].id);
        }
      }
      // Check the played cards in the rounds
      for (let i = 0; i < startedGame1.rounds.length; i++) {
        const playedCards = startedGame1.rounds[i].playedCards;
        for (let j = 0; j < playedCards.length; j++) {
          oldCardsTable.push(playedCards[j].handCard.id);
        }
      }

      const newPlayerCards
        = res.body.game.players.filter(
          (p) => p.userID === userId
        )[0].playerCards;
      newPlayerCards.forEach( (card) => {
        const cardId = card.id;
        expect(oldCardsTable).to.not.include(cardId);
      });
    });

    it('should not change any card if the player hand is empty', async () => {
      const res = await chai.request(app)
        .put(`/game/${gameFinishedCompleted.id}/players/${userId}/playerCards`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(res.status).to.equal(400);
    });

    it('should not change any card if the game is finished', async () => {
      const res = await chai.request(app)
        .put(`/game/${gameFinishedCompleted.id}/players/${userId}/playerCards`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(res.status).to.equal(400);
    });

    it('should increase +1 the changeCards number of the player', async () => {
      const res = await chai.request(app)
        .put(`/game/${startedGame2.id}/players/${userId}/playerCards`)
        .set('Authorization', `Bearer ${user.token}`);

      const expectedchangeCards = startedGame2.players.filter(
        (p) => p.userID === userId
      )[0].changeCards + 1;
      const player
      = res.body.game.players.filter((p) => p.userID === userId )[0];
      expect(player.changeCards).to.equal(expectedchangeCards);
    });

    // eslint-disable-next-line max-len
    it('should not change any card if the player already changed the card set once', async () => {
      const res = await chai.request(app)
        .put(`/game/${startedGame3.id}/players/${userId}/playerCards`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(res.status).to.equal(400);
    });
  });
});
