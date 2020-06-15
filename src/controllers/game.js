const Game = require('../models/game');
const HandCards = require('../data/handCards');
const RoundCards = require('../data/roundCards');

exports.createAGame = (req, res, next) => {
  const newGame = new Game();

  const creator = req.user._id.toString();
  const pseudoPlayer = req.user.pseudo;
  newGame.players.push({
    userID: creator,
    pseudo: pseudoPlayer,
    changeCards: 0,
    playerCards: [],
  });
  newGame.owner = creator;

  newGame.save().then(
    (game) => {
      res.status(200).json({message: 'New game created', game});
    }
  )
    .catch(
      (err) => {
        res.status(400).json({error: err});
      }
    );
};

exports.getAGame = (req, res, next) => {
  Game.findOne({_id: req.params.id})
    .then(
      (game) => {
        // Block if already already begun or finished
        // and player was not in the game
        const isPlayerInTheGame = game.players.filter((player) =>
          player.userID === req.user._id.toString()
        ).length > 0;

        if (!isPlayerInTheGame && game.status === 'in progress') {
          return res.status(400).json({
            error: 'The game has already started without you, '
              + 'you cannot access it',
          });
        }

        // Allow to get the same.
        if (game.status === 'finished') {
          return res.status(200).json({game});
        }

        // Just return the game
        return res.status(200).json({game});
      }
    )
    .catch(
      (err) => {
        res.status(400).json({error: err});
      }
    );
};

exports.joinAGame = (req, res, next) => {
  Game.findOne({_id: req.params.id})
    .then(
      (game) => {
        // Join the game - block if already already begun or finished
        // Add the user that join if status is waiting
        const user = req.user._id.toString();
        const pseudoPlayer = req.user.pseudo;

        let isPlayerInTheGame = false;
        for (let i = 0; i < game.players.length; i++) {
          if (game.players[i].userID === user) {
            isPlayerInTheGame = true;
            break;
          }
        }

        // If player already in the game, return an error
        if (isPlayerInTheGame) {
          return res.status(400).json({
            error: 'The player has already joined the game',
          });
        }

        // If the player is the 7th player, return an error
        // if (!isPlayerInTheGame && game.players.length + 1 >= 7) {
        //   return res.status(400).json({
        //     error: 'Sorry, you cannot join the game,'
        //       + ' as there are maximum 6 players for a game.',
        //   });
        // }

        // if the game is in status waiting, add the user to the game
        if (game.status === 'in progress') {
          return res.status(400).json({
            error: 'The game has already started, you cannot join it',
          });
        } else if (game.status === 'finished') {
          return res.status(400).json({
            error: 'The game is already finished, you cannot join it',
          });
        } else if (game.status === 'waiting') {
          const newPlayer = {
            userID: user,
            pseudo: pseudoPlayer,
            changeCards: 0,
            playerCards: [],
          };
          const newPlayers = [...game.players];
          newPlayers.push(newPlayer);

          Game.findOneAndUpdate(
            {_id: req.params.id},
            {players: newPlayers},
            {new: true, useFindAndModify: false}
          ).then(
            (game2) => {
              res.status(200).json({
                message: 'Game waiting, added a new user',
                game: game2,
              });
            }
          ).catch(
            (err) => {
              res.status(400).json({error: err});
            }
          );
        } else {
          return res.status(400).json({
            error: 'The game is already finished or started,'
              + ' you cannot join it',
          });
        }
      }
    )
    .catch(
      (err) => {
        res.status(400).json({error: err});
      }
    );
};

exports.startAGame = (req, res, next) => {
  Game.findOne({_id: req.params.id}).then(
    (game) => {
      // Check if the game is waiting, otherwise you cannot start it
      if (game.status !== 'waiting') {
        return res.status(400).json({
          error: `The game ${game._id} is not in a status of waiting'
            + ' but is ${game.status}, therefore you cannot start it.`,
        });
      }

      // If you do not have at least 2 players, you cannot start the game
      if (game.players.length < 2) {
        return res.status(400).json({
          error: 'Need at least two players to play a game',
        });
      }

      // If there are more than 6 players, you cannot play
      // if (game.players.length > 6) {
      //   return res.status(400).json({
      //     error: 'There are more than 6 players in the game, '
      //       + 'you cannot play.',
      //   });
      // }

      // Check that the owner of the game can ONLY start the game
      const playerPressingStart = req.user._id.toString();
      if (playerPressingStart !== game.owner) {
        const owner = game.players
          .filter((player) => player.userID === game.owner)[0];

        return res.status(400).json({
          error: 'The player who has to start the game '
            + `should be the owner of the game: ${owner.pseudo}`,
        });
      }

      // add a new round
      // change the round to in progress
      // add a round card random
      const bankOfRoundCards = RoundCards.RoundCards.cards;
      const roundCardNew
        = bankOfRoundCards[Math.floor(Math.random() * bankOfRoundCards.length)];
      const newRound = {
        roundStatus: 'in progress',
        roundCard: {sentence: roundCardNew},
        playedCards: [],
      };

      // add the cards randomly to the players
      const numberCardTotal = (game.players.length) * 5;
      let handCardsNew
        = HandCards.HandCards.cards.map((text, id) => ({id, text}));
      handCardsNew = shuffle(handCardsNew);
      const newPlayers = [...game.players];
      let n = 0;

      for (let i = 0; i < numberCardTotal; i++) {
        if (newPlayers[n].playerCards.length === 5) {
          n++;
        }
        newPlayers[n].playerCards.push(handCardsNew[i]);
      }

      Game.findOneAndUpdate(
        {_id: req.params.id},
        {status: 'in progress', players: newPlayers, $push: {rounds: newRound}},
        {new: true, useFindAndModify: false}
      ).then(
        (game) => {
          res.status(200).json({message: 'New game began', game});
        }
      )
        .catch(
          (err) => {
            res.status(400).json({error: err});
          }
        );
    }
  )
    .catch(
      (err) => {
        res.status(400).json({error: err});
      }
    );
};

exports.playACard = (req, res, next) => {
  // Find the game you are in
  Game.findOne({_id: req.params.id}).then(
    (game) => {
      const playedCard = req.body.card;
      const currentPlayer = req.user._id.toString();

      // Find the round id, you are playing
      const currentRound
        = game.rounds.filter((round) => round.id === req.params.roundId)[0];
      if (currentRound === undefined) {
        return res.status(400).json({
          error: `The ID "${req.body.roundId}" is not a valid round ID.`,
        });
      }
      if (currentRound.roundStatus !== 'in progress') {
        return res.status(400).json({
          error: 'The round you want to play is not in progress.',
        });
      }

      const currentRoundID = currentRound.id;

      // We will check first if the player is a player of the game
      let isPlayerInTheGame = false;
      for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].userID === currentPlayer) {
          isPlayerInTheGame = true;
          break;
        }
      }

      if (!isPlayerInTheGame) {
        // the player is not in the players of the game, throw an error
        return res.status(400).json({
          error: `The player ${currentPlayer} can\'t play, `
            + `as he is not in game ${req.params.id}`,
        });
      }

      // Then we check the player did not play on this round before
      let alreadyPlay = false;
      const setCard = game.rounds[game.rounds.length - 1].playedCards;
      for (let i = 0; i < setCard.length; i++) {
        if (setCard[i].playerId === currentPlayer) {
          alreadyPlay = true;
          break;
        }
      }

      if (alreadyPlay) {
        // the player already played a card - we return an error
        return res.status(400).json({
          error: `You can\'t play in this round, `
            + 'as you already played a card before.',
        });
      }

      // We clone the current array players of the game
      const currentPlayerObj = [...game.players];
      // We loop through it and find the player with the
      // userID that equal the userID in the request
      for (let i = 0; i < currentPlayerObj.length; i++) {
        if (currentPlayerObj[i].userID === currentPlayer) {
          if (currentPlayerObj[i].playerCards.filter((c) =>
            c.text === playedCard.text && c.id === playedCard.id
          ).length === 0) {
            // the card is not in the set of cards of the player
            return res.status(400).json({
              error: `The player can\'t play the card ${playedCard.text}, `
                + `as this is not in the set of the player ${currentPlayer}`,
            });
          }

          // replace the current player card with the new array of cards
          currentPlayerObj[i].playerCards = currentPlayerObj[i]
            .playerCards.filter((card) => card.id !== playedCard.id);
          break;
        }
      }

      // Add the card in the current round in the board - playedCards
      // We clone the current game rounds array
      const newBoard = [...game.rounds];

      // We prepare the new card that the player decided to play
      const newCardPlayed
                = {
                  playerId: currentPlayer,
                  votes: [],
                  handCard: playedCard,
                };

      // We loop through the game rounds array and find a round
      // that have the same id as the current round in parameters of the request
      for (let i = 0; i < newBoard.length; i++) {
        if (newBoard[i].id === currentRoundID) {
          // We add the card in the board in the right round
          newBoard[i].playedCards.push(newCardPlayed);
        }
      }

      // Amend this game with a new player object and a new round object
      Game.findOneAndUpdate(
        {_id: req.params.id},
        {players: currentPlayerObj, rounds: newBoard},
        {new: true, useFindAndModify: false}
      ).then(
        (game) => {
          res.status(200).json({message: 'Card played', game: game});
        }
      )
        .catch(
          (err) => {
            res.status(400).json({error: err});
          }
        );
    }
  )
    .catch(
      (err) => {
        res.status(400).json({error: err});
      }
    );
};

const shuffle = (arr) => {
  let i;
  let j;
  let temp;
  for (i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
};


exports.voteForACard = (req, res, next) => {
  // ajouter le vote pour la carte avec l'emotion

  const gameId = req.params.id;

  Game.findOne({_id: req.params.id}).then(
    (game) => {
      // We check first if the game is not finished yet
      if (game.status === 'finished') {
        return res.status(400).json({
          error: 'The game is already finished, you cannot vote.',
        });
      }

      // Find the round id, you are playing
      const currentRound = game.rounds.filter((round) =>
        round.id === req.params.roundId
      )[0];

      if (currentRound === undefined) {
        return res.status(400).json({
          error: `The round has an undefined ID: "${req.params.roundId}"`,
        });
      }

      if (currentRound.roundStatus !== 'in progress') {
        return res.status(400).json({
          error: `The round is not in progress: "${currentRound.roundStatus}"`,
        });
      }

      const currentRoundID = currentRound.id;

      // We register the vote for a played card
      const emotion = req.body.emotion;
      const cardChoosen = req.params.playedCardId;
      const currentPlayer = req.user._id.toString();
      const validateEmotions = ['scary', 'funny', 'disgusting', 'nsfw', 'cute'];

      // We clone the current game rounds array
      const newBoard = [...game.rounds];

      // We check the emotion returned and validate it or return an error
      if (validateEmotions.indexOf(emotion) === -1) {
        return res.status(400).json({
          error: `The emotion "${emotion}" is not valid. `
            + `Please use one of these emotions: 'scary', `
            + `'funny', 'disgusting', 'nsfw', 'cute'.`,
        });
      }

      // We prepare the new card that the player decided to play
      const newVote = {
        emotion: emotion,
        playerId: currentPlayer,
      };

      // We loop through the game rounds array and find a round that have the
      // same id as the current round in parameters of the request
      for (let i = 0; i < newBoard.length; i++) {
        if (newBoard[i].id === currentRoundID) {
          // We add the card in the board in the right round
          const setOfCards = newBoard[i].playedCards;
          let voted = false;

          // Return an error if the player already voted
          if (setOfCards.flatMap((card) => card.votes)
            .map((vote) => vote.playerId).indexOf(currentPlayer) !== -1) {
            return res.status(400).json({
              error: `The player ${currentPlayer} can't play, he already voted`,
            });
          }

          for (let j = 0; j < setOfCards.length; j++) {
            if (setOfCards[j].id === cardChoosen) {
              // Return error if the player votes for himself
              if (setOfCards[j].playerId === currentPlayer) {
                return res.status(400).json({
                  error: `The player ${currentPlayer} `
                    + `can't vote for his own card`,
                });
              } else {
                setOfCards[j].votes.push(newVote);
                voted = true;
              }
            }
          }
          if (!voted) {
            // couldnt find the card, so the card is not existing
            return res.status(400).json({
              error: `The card "${cardChoosen}" doesn't exist `
                + `in the player hand`,
            });
          }
        }
      }

      // We have different functionnalities:
      // - If the vote is not the last vote, push the vote into the object only
      // - If we have all the votes, the round is marked as finished
      // - If the number of rounds is not equal to five, initialise a new round
      // - If all five rounds are finished, the game is finished

      // First we count how many vote we got for the last round in the game
      const gamerNumber = game.players.length;
      let voteNumber = 0;
      game.rounds[game.rounds.length - 1].playedCards.forEach((card) => {
        voteNumber += card.votes.length;
      });

      // If we have the same amount of votes than the number of players,
      // we set the round to finished
      if (voteNumber === gamerNumber) {
        // We set the round to finished
        for (let i = 0; i < newBoard.length; i++) {
          if (newBoard[i].id === currentRoundID) {
            newBoard[i].roundStatus = 'finished';
          }
        }

        // Check if this is 5 finished rounds -> finished Game
        // We check here if the five rounds have the status finished
        const allRoundsFinished = game.rounds.every((round) =>
          round.roundStatus === 'finished'
        );

        // it should have all five rounds finished
        // We send back the status game finished
        if (game.rounds.length === 5 && allRoundsFinished) {
          Game.findOneAndUpdate(
            {_id: gameId},
            {status: 'finished', rounds: newBoard},
            {new: true, useFindAndModify: false}
          ).then(
            (finishedGame) => {
              res.status(200).json({
                message: 'Game is finished',
                game: finishedGame,
              });
            }
          ).catch(
            (err) => {
              res.status(400).json({error: err});
            }
          );
        } else {
          // We initialise the next round
          chooseRandomRoundCard = (bankCardArray) =>
            bankCardArray[Math.floor(Math.random() * bankCardArray.length)];

          // filter all the cards already chosen in the last rounds
          const tabRoundCards = [];
          for (let i = 0; i < newBoard.length; i++) {
            tabRoundCards.push(newBoard[i].roundCard.sentence);
          }

          const bankOfRoundCards = RoundCards.RoundCards.cards
            .filter((card) => tabRoundCards.indexOf(card) === -1);
          const roundCardNew = chooseRandomRoundCard(bankOfRoundCards);

          const newRound = {
            roundStatus: 'in progress',
            roundCard: {sentence: roundCardNew},
            playedCards: [],
          };

          newBoard.push(newRound);

          Game.findOneAndUpdate(
            {_id: gameId},
            {rounds: newBoard},
            {new: true, useFindAndModify: false}
          ).then(
            (game) => {
              res.status(200).json({
                message: 'The current round is finished - new round created',
                game: game,
              });
            }
          ).catch(
            (err) => {
              res.status(400).json({error: err});
            }
          );
        }
      } else {
        // return the game object with the new vote
        Game.findOneAndUpdate(
          {_id: gameId},
          {rounds: newBoard},
          {new: true, useFindAndModify: false}
        ).then(
          (game) => {
            res.status(200).json({
              message: 'Vote in the DB, '
                + 'the round is waiting for other votes to be finished',
              game: game,
            });
          }
        ).catch(
          (err) => {
            res.status(400).json({error: err});
          }
        );
      }
    }
  )
    .catch(
      (err) => {
        res.status(400).json({error: err});
      }
    );
};


exports.changeACard = (req, res, next) => {
  Game.findOne({_id: req.params.id})
    .then(
      (game) => {
        const playerId = req.user.id;
        const player = game.players.filter(
          (p) => p.userID === playerId
        )[0];

        let newCardSet = [];
        const numberCardTotal = player.playerCards.length;

        // return an error if the hand is empty
        if (numberCardTotal === 0) {
        // the player doesn't have any more cards
          return res.status(400).json({
            error: `The player ${currentPlayer} can\'t change his cards, `
            + `as he has no more cards to play`,
          });
        }

        // if the game is not in progress
        // no more amendments can be made in the hand cards
        if (game.status !== 'in progress') {
          return res.status(400).json({
            error: `The game is not in progress, you can\'t change your cards.`,
          });
        }

        // Check if the player already requested to change his cards
        // He is allowed to do it only once
        if (player.changeCards > 0) {
          return res.status(400).json({
            error: `You already changed your cards once, `
            + `you can\'t change again your cards.`,
          });
        }

        // Create an array with all the cards of the game
        const oldCards = [];
        for (let i = 0; i < game.players.length; i++) {
          const playerCards = game.players[i].playerCards;
          for (let j = 0; j < playerCards.length; j++) {
            oldCards.push(playerCards[j].id);
          }
        }

        // Take the cards in the game already played
        for (let i = 0; i < game.rounds.length; i++) {
          const playedCards = game.rounds[i].playedCards;
          for (let j = 0; j < playedCards.length; j++) {
            oldCards.push(playedCards[j].handCard.id);
          }
        }

        let handCardsNew
        = HandCards.HandCards.cards
          .map(
            (text, id) => ({id, text})
          ).filter(
            (c) => oldCards.indexOf(c.id) === -1
          );
        handCardsNew = shuffle(handCardsNew);

        newCardSet = handCardsNew.slice(0, numberCardTotal);

        const newChangeCards = player.changeCards + 1;

        const newPlayer = {
          userID: req.user.id,
          pseudo: req.user.pseudo,
          changeCards: newChangeCards,
          playerCards: newCardSet,
        };

        let newPlayers = [...game.players];
        newPlayers = newPlayers.filter((p) => p.userID !== playerId);
        newPlayers.push(newPlayer);

        Game.findOneAndUpdate(
          {_id: req.params.id},
          {players: newPlayers},
          {new: true, useFindAndModify: false}
        ).then(
          (game) => {
            res.status(200).json({
              message: 'Cards replaced',
              game: game,
            });
          }
        ).catch(
          (err) => {
            res.status(400).json({error: err});
          }
        );
      }
    )
    .catch(
      (err) => {
        res.status(400).json({error: err});
      }
    );
};
