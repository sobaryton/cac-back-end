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

exports.beginAGame = (req,res,next) => {
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