const Game = require('../models/game');

exports.getAGame = (req,res,next) => {
    Game.findOne({ _id: req.params.id})
    .then(
        (game) => {
            res.status(200).json(game);
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

exports.startAGame = (req,res,next) => {
    Game.findOne({_id: req.params.id}).then(
        (game) => {
            if(game.players.length < 2){
                res.status(400).json({ error: 'Need at least two players to play a game' });
            } else {
                Game.findOneAndUpdate({_id: req.params.id}, { status: 'in progress' }, {new: true, useFindAndModify: false}).then(
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
    
    
    
}

exports.voteForACard = (req,res,next) => {
    let gameId = req.params.id;
    Game.findOneAndUpdate({_id: gameId},{ status: 'finished' }, {new: true, useFindAndModify: false}).then(
        (game) => {
            res.status(200).json({ message: 'New game began', game: game });
        }
    )
    .catch(
        (err) => {
            res.status(400).json({ error: err });
        }
    )
    
}