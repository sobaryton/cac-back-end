exports.getUserId = (req,res,next) => {
    res.status(200).json({
        userId: req.session.userID,
        pseudo: req.session.pseudo
    });
}
