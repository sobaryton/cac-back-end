# Cards Against Coronavirus - Backend

Cards Against Coronavirus(Backend) is the API that is used in the game, that you can find here: https://cards-against-coronavirus.sodev.me/

This project has been done in Node.js & Express.js, using MongoDB & Mongoose as the database and models and Mocha & Chai for the TDD tests.

There is a system of authentication using passport.js.

## Getting Started

Run npm install
Run npm start

## Routes of the project

The different routes are:

### User

```
GET - '/user/'
```

Used to get the user token and authentication

```
PUT - '/user/'
```

Used to create a new user

### Game

```
GET - '/game/:id'
```

Used to get a certain game

```
POST - '/game/'
```

Used to create a game

```
POST - '/game/:id/round/:roundId'
```

Used to play a card in a game round

```
PUT - '/game/:id'
```

Used to start the game

```
PUT - '/game/:id/players'
```

Used to join a game

```
POST - '/game/:id/round/:roundId/playedCards/:playedCardId'
```

Used to vote for a certain card in a round of a game

```
POST - '/game/:id/players/:playerId/playerCards'
```

Used to change the set of card of a player during a game

## Running the tests

Run npm test
The tests have been done with Mocha and Chai. There is one file per route.

## Deployment

The project is on Bitbucket and has pipelines that test and deploy the server to a private account on Heroku.

## Built With

- [Node.js](https://nodejs.org/en/) - The web framework used
- [Express.js](https://expressjs.com/) - The web framework used
- [MongoDB](https://www.mongodb.com/) - Used for the database
- [Mongoose](https://mongoosejs.com/docs/) - Used for the models
- [Mocha](https://mochajs.org/) - Used to test the API
- [Chai](https://www.chaijs.com/) - Used to test the API
- [passport.js](http://www.passportjs.org/) - Used to authenticate the user

## Authors

- **Solene Bary** - _Backend work_ - [sobaryton](https://github.com/sobaryton)
- **Nicolas Severin** - _Frontend work_ - [nico-incubiq](https://github.com/nico-incubiq)
