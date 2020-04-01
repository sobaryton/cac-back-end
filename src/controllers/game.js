const Game = require('../models/game');
const HandCards = require('../data/handCards');
const RoundCards = require('../data/roundCards');

exports.getAGame = (req,res,next) => {
    Game.findOne({ _id: req.params.id})
    .then(
        (game) => {
            //Join the game - block if already already begun or finished
            //Add the user that join if status is waiting
            let user = 'soso';

            let isPlayerInTheGame = false;
            for(let i=0; i<game.players.length; i++){
                if(game.players[i].pseudo === user){
                    isPlayerInTheGame = true;
                    break;
                }
            }
            console.log('isPlayerInTheGame ',isPlayerInTheGame);

            //If player already in the game, return the game
            if (isPlayerInTheGame) {
                res.status(200).json({game: game});
            } 
            //if the game is in status waiting, add the user to the game
            else if(game.status === 'waiting'){
                let newPlayer = {
                    pseudo: user,
                    playerCards:[]
                }
                let newPlayers = [...game.players];
                newPlayers.push(newPlayer);

                Game.findOneAndUpdate({_id: req.params.id},{ players: newPlayers }, {new: true, useFindAndModify: false}).then(
                    (game2) => {
                        res.status(200).json({ message: 'Game waiting, added a new user', game: game2 });
                    }
                )
                .catch(
                    (err) => {
                        res.status(400).json({ error: err });
                    }
                )
            } 
            else {
                res.status(200).json({ error: 'The game is already finished or started, you cannot join it', game: game });
            }
        }
    )
    .catch(
        (err) => {
            res.status(400).json({ error: err });
        }
    )
};

exports.createAGame = (req,res,next) => {
    let newGame = new Game();

    //add the creator of the game in the game players
    let creator = 'soso';
    newGame.players.push({
        pseudo: creator,
        playerCards: []
    });

    newGame.save().then(
        (game) => {
            res.status(200).json({ message: 'New game created', game });
        }
    )
    .catch(
        (err) => {
            res.status(400).json({ error: err });
        }
    )
};

exports.playACard = (req,res,next) => {
    //Find the game you are in
    Game.findOne({_id: req.params.id}).then(
        (game) => {

            let playedCard = req.body.card;
            let currentPlayer = req.body.player;

            //We will check first if the player is a player of the game
            let isPlayerInTheGame = false;
            for(let i=0; i<game.players.length; i++){
                if(game.players[i].pseudo === currentPlayer){
                    isPlayerInTheGame = true;
                    break;
                }
            }

            if(!isPlayerInTheGame){
                //the player is not in the players of the game, throw an error
                return res.status(400).json({ error: `The player ${currentPlayer} can\'t play, as he is not in game ${req.params.id}` });
            }

            //Remove the card of the hand of the player
            //this returns a new array without the card played
            let newPlayerHand = game.players
            .filter(player => player.pseudo === currentPlayer)[0].playerCards
            .filter(card => card !== playedCard);

            //We clone the current array players of the game
            let currentPlayerObj = [... game.players];
            //We loop through it and find the player with the pseudo that equal the pseudo in the request
            for(let i = 0; i<currentPlayerObj.length; i++){
                if(currentPlayerObj[i].pseudo === currentPlayer){

                    if(currentPlayerObj[i].playerCards.indexOf(playedCard) === -1){
                        //the card is not in the set of cards of the player, return an error
                        return res.status(400).json({ error: `The player can\'t play the card ${playedCard}, as this is not in the set of the player ${currentPlayer}` });
                    }

                    //replace in the current player card array in players with the new array of cards
                    currentPlayerObj[i].playerCards.splice(0, currentPlayerObj[i].playerCards.length, ...newPlayerHand);
                    break;
                }
            }

            //Add the card in the current round in the board - playedCards
            //We clone the current game rounds array
            let newBoard = [... game.rounds];
            
            //We prepare the new card that the player decided to play
            let newCardPlayed =
                {
                    playerId: currentPlayer,
                    votes: [{
                        emotion: '',
                        playerId: ''
                    }],
                    handCardId: playedCard
                };

            
            //Find the round id, you are playing
            let currentRoundID = game.rounds.filter(round => round.id === req.params.roundId)[0].id;
            
            //We loop through the game rounds array and find a round that have the same id as the current round in parameters of the request
            for(let i = 0; i<newBoard.length; i++){
                if(newBoard[i].id === currentRoundID){
                    //We add the card in the board in the right round
                    newBoard[i].playedCards.push(newCardPlayed);
                }
            }
            
            //Amend this game with a new player object and a new round object
            Game.findOneAndUpdate({_id: req.params.id}, { players: currentPlayerObj, rounds: newBoard }, {new: true, useFindAndModify: false}).then(
                (game) => {
                    res.status(200).json({ message: 'Card played', game: game });
                }
            )
            .catch(
                (err) => {
                    res.status(400).json({ error: err });
                }
            );
            
        }        
    )
    .catch(
        (err) => {
            res.status(400).json({ error: err });
        }
    );
};

shuffle = (arr) => {
    var i,
        j,
        temp;
    for (i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;    
};

exports.startAGame = (req,res,next) => {
    Game.findOne({_id: req.params.id}).then(
        (game) => {
            if(game.players.length < 2){
                res.status(400).json({ error: 'Need at least two players to play a game' });
            } else {
                //add a new round
                //change the round to in progress
                //add a round card random
                let bankOfRoundCards = RoundCards.RoundCards.cards;
                let roundCardNew = bankOfRoundCards[Math.floor(Math.random()*bankOfRoundCards.length)];
                let newRound = {
                    roundStatus: 'in progress',
                    roundCard: { sentence: roundCardNew},
                    playedCards: []
                }

                //add the cards randomly to the players
                let numberCardTotal = (game.players.length)*5;
                let handCardsNew = [...HandCards.HandCards.cards];
                handCardsNew =  shuffle(handCardsNew);
                let newPlayers = [...game.players];
                let n = 0;

                for(let i=0; i<numberCardTotal; i++){
                    if(newPlayers[n].playerCards.length === 5){
                        n++;
                    } else {
                        newPlayers[n].playerCards.push(handCardsNew[i]);
                    }
                }
                
                Game.findOneAndUpdate({_id: req.params.id}, { status: 'in progress', players: newPlayers, $push: {rounds: newRound} }, {new: true, useFindAndModify: false}).then(
                    (game) => {
                        res.status(200).json({ message: 'New game began', game });
                    }
                )
                .catch(
                    (err) => {
                        res.status(400).json({ error: err });
                    }
                )
            }
        }        
    )
    .catch(
        (err) => {
            res.status(400).json({ error: err });
        }
    )
    
}

exports.voteForACard = (req,res,next) => {

    //ajouter le vote pour la carte avec l'emotion

    let gameId = req.params.id;
    
    Game.findOne({_id: req.params.id}).then(
        (game) => {

            //We count how many vote we got
            const gamerNumber = game.players.length;
            let voteNumber = 0;
            game.rounds[game.rounds.length-1].playedCards.forEach(card => {
                voteNumber += card.votes.length;
            });

            //we set the status of the game as finished when the last vote on the last round is done.
            let allRoundsFinished = true;
            game.rounds.forEach(round => {
                return round.roundStatus !== 'finished'? allRoundsFinished = false : null;
            });
            
            //it should have all five rounds finished
            if(game.rounds.length === 5 && allRoundsFinished && gamerNumber === voteNumber){
                Game.findOneAndUpdate({_id: gameId},{ status: 'finished' }, {new: true, useFindAndModify: false}).then(
                    (finishedGame) => {
                        res.status(200).json({ message: 'Game is finished', finishedGame: finishedGame });
                    }
                )
                .catch(
                    (err) => {
                        res.status(400).json({ error: err });
                    }
                )
            }
        }
    )
    .catch(
        (err) => {
            res.status(400).json({ error: err });
        }
    );


    
    
}